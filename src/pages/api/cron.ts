/* 
cron tasks:
    - update roster spreadsheets
    - pull schedules for all teams
*/

import type { NextApiRequest, NextApiResponse } from "next"

const { MongoClient } = require("mongodb")
require("dotenv").config({path: "../.env"})
const cheerio = require("cheerio")
const path = require("path")
const XLSX = require("xlsx")

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true

})

const leagues = ["fpsl", "uhle", "picl"]

import { 
    fpsl2023ScheduleUrls,
    uhle2023ScheduleUrls,
    picl2023ScheduleUrls
} from "@/scheduleUrls"
import {
    fpsl2023RosterUrls,
    uhle2023RosterUrls,
    picl2023RosterUrls
} from "@/rosterUrls"

const leagueToScheduleUrls: {[key: string]: string[]} = {
    fpsl: fpsl2023ScheduleUrls,
    uhle: uhle2023ScheduleUrls,
    picl: picl2023ScheduleUrls
}
const leagueToRosterUrls: {[key: string]: string[]} = {
    fpsl: fpsl2023RosterUrls,
    uhle: uhle2023RosterUrls,
    picl: picl2023RosterUrls
}

type PlayerlessEvent = {
    date: Date,
    location: string,
    field?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // connect to database
    await client.connect()
    const db = client.db(process.env.MONGODB_DBNAME)
    const schedules = db.collection(process.env.MONGODB_COLLNAME)

    // updates all schedule objects in the schedules collection for each league
    for (let league of leagues) {
        // ex: {league: "fpsl", 1: [schedule], 2: [schedule], ...}
        const newNumberToTeamSchedules: {[key: number | string]: {[key: number]: PlayerlessEvent} | string} = {
            league: league
        }

        // within the current league, gather each team schedule
        const teamSchedulePromisesLst = leagueToScheduleUrls[league].map(async (url) => {
            const teamSchedule = await fetch(url, {method: "GET"})
                .then((res) => {
                    if (res.ok) {
                        return res.text()
                    } else {
                        throw new Error(`Failed to fetch from ${url}.`)
                    }
                })
                .then((data) => {
                    const $ = cheerio.load(data)

                    const dateSpans = $("span.push-left").filter((_index: number, element: any) => $(element).children("a").length === 0).toArray()
                    const locationAnchors = $("span.push-left").find("a").toArray()
                    const fieldSpans = $("span.push-left").filter((_index: number, element: any) => $(element).find("a").length > 0).toArray()
                    let scheduleObj: {[key: number]: PlayerlessEvent} = {}

                    // iterate through each event found within the schedule page
                    for (let i = 0; i < dateSpans.length; i++) {
                        let tempEvent: PlayerlessEvent = {
                            date: new Date($(dateSpans[i]).text()),
                            location: $(locationAnchors[i]).text()
                        }

                        if ($(locationAnchors[i]).text() !== "PLD (Parking Lot Duty)") {
                            tempEvent["field"] = $(fieldSpans[i]).text().trim().slice(-2)
                        }

                        // accounting for UHLe PLD format
                        if (tempEvent.location === "") {
                            tempEvent.location = "PLD (Parking Lot Duty)"
                        }

                        scheduleObj[i] = tempEvent
                    }

                    return scheduleObj
                })
                .catch((error) => console.error(error))
            
            return teamSchedule
        })

        await Promise.all(teamSchedulePromisesLst)
            .then((values) => {
                values.forEach((val, index) => {
                    newNumberToTeamSchedules[index + 1] = val as {[key: number]: PlayerlessEvent}
                })
            })
            .catch((error) => console.error(error))

        await schedules.deleteOne({league: league})
        await schedules.insertOne(newNumberToTeamSchedules)
    }
    
    res.status(200).end("Running cron job...")
}