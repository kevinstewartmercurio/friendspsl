import { NextApiRequest, NextApiResponse } from "next"

const { MongoClient } = require('mongodb')
require("dotenv").config({path: "../.env"})
const cheerio = require("cheerio")

import { fpsl2023ScheduleUrls } from "@/scheduleUrls"

const leagueToScheduleUrls: {[key: string]: string[]} = {
    fpsl: fpsl2023ScheduleUrls
}

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

type PlayerlessEvent = {
    date: Date,
    location: string,
    field?: string
}

export function compareDates(d1: Date, d2: Date): boolean {
    // returns true if d1 and d2 are different days, false otherwise
    if (d1 === undefined) {
        return true
    }

    const d1EST = new Date(d1.toLocaleString("en-US", {timeZone: "America/New_York"}))
    const d2EST = new Date(d2.toLocaleString("en-US", {timeZone: "America/New_York"}))

    return (
        (d1EST.getFullYear() !== d2EST.getFullYear()) || (d1EST.getMonth() !== d2EST.getMonth()) || (d1EST.getDate() !== d2EST.getDate())
    )
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await client.connect()
    const db = client.db(process.env.MONGODB_DBNAME)
    const schedules = db.collection(process.env.MONGODB_SCHEDULES_COLL)

    const oldSchedules = await schedules.find({league: req.body.league})
    if (oldSchedules) {
        const oldDatePromise = oldSchedules.toArray()
            .then((docs: any) => {
                return docs[0].date
            })
            .catch((error: any) => console.error(error))
        const oldDate = await oldDatePromise

        if (!compareDates(oldDate, new Date())) {
            return res.status(200).json({})
        }
    }

    const numberToTeamSchedule: {[key: number | string]: {[key: number]: PlayerlessEvent} | Date | string} = {
        date: new Date(),
        league: req.body.league
    }

    const teamSchedulePromisesLst = leagueToScheduleUrls[req.body.league].map(async (url) => {
        const teamSchedule = await fetch(url, {method: "GET"})
            .then((res) => {
                if (res.ok) {
                    return res.text()
                }
            })
            .then((data) => {
                const $ = cheerio.load(data)

                const dateSpans = $("span.push-left").filter((_index: number, element: any) => $(element).children("a").length === 0).toArray()
                const locationAnchors = $("span.push-left").find("a").toArray()
                const fieldSpans = $("span.push-left").filter((_index: number, element: any) => $(element).find("a").length > 0).toArray()
                let scheduleObj: {[key: number]: PlayerlessEvent} = {}

                for (let i = 0; i < dateSpans.length; i++) {
                    let tempEvent: PlayerlessEvent = {
                        date: new Date($(dateSpans[i]).text()),
                        location: $(locationAnchors[i]).text()
                    }

                    if (($(locationAnchors[i]).text() !== "PLD (Parking Lot Duty)") && ($(locationAnchors[i]).text() !== "Ball Fields")) {
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
                numberToTeamSchedule[index + 1] = val as {[key: number]: PlayerlessEvent}
            })
        })
        .catch((error) => console.error(error))

    await schedules.deleteOne({league: req.body.league})
    await schedules.insertOne(numberToTeamSchedule)
    
    
    client.close()
    return res.status(200).json({})
}