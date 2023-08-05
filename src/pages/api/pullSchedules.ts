import { NextApiRequest, NextApiResponse } from "next"

const { MongoClient } = require('mongodb')
require("dotenv").config({path: "../.env"})
const cheerio = require("cheerio")

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

import { getPlayerTeamNumber } from "./generateSchedule"

import { 
    fpsl2023ScheduleUrls,
    uhle2023ScheduleUrls,
    ccm2023ScheduleUrls,
    rocky2023ScheduleUrls,
    delawareMixed2023ScheduleUrls,
    southJerseyMixed2023ScheduleUrls
} from "@/scheduleUrls"

const leagueToScheduleUrls: {[key: string]: string[]} = {
    fpsl: fpsl2023ScheduleUrls,
    uhle: uhle2023ScheduleUrls,
    ccm: ccm2023ScheduleUrls,
    rocky: rocky2023ScheduleUrls,
    delaware_mixed: delawareMixed2023ScheduleUrls,
    south_jersey_mixed: southJerseyMixed2023ScheduleUrls
}

export const leagueToRangeLst: {[key: string]: string[]} = {
    uhle: ["1-5", "6-10"],
}

type PlayerlessEvent = {
    date: Date,
    location: string,
    field?: string
}

const getScheduleForTeamNumber = async (league: string, teamNumber: number) => {
    const teamSchedule = await fetch(leagueToScheduleUrls[league][teamNumber - 1], {method: "GET"})
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
            const opponentDivs = $("div.row-fluid-always div.schedule-team-name:nth-child(2)").find("a").toArray()
            let scheduleObj: {[key: number]: PlayerlessEvent} = {}

            let locationIndex = 0 // only necessary because uhle pld format will make dateSpans.length !== locationAnchors.length
            for (let i = 0; i < dateSpans.length; i++) {
                // accounting for uhle pld format
                if (($(opponentDivs[(i * 2) + 1]).text() === "PLD") && (league === "uhle")) {
                    let tempEvent: PlayerlessEvent = {
                        date: new Date($(dateSpans[i]).text()),
                        location: "PLD (Parking Lot Duty)"
                    }

                    scheduleObj[i] = tempEvent
                    continue
                }

                let tempEvent: PlayerlessEvent = {
                    date: new Date($(dateSpans[i]).text()),
                    location: $(locationAnchors[locationIndex]).text()
                }

                if ($(locationAnchors[locationIndex]).text() !== "PLD (Parking Lot Duty)") {
                    if (($(locationAnchors[locationIndex]).text() !== "Ball Fields") || ($(fieldSpans[locationIndex]).text().trim().slice(-2)[0] === "#")) {
                        tempEvent["field"] = $(fieldSpans[locationIndex]).text().trim().slice(-2)
                    }
                }

                scheduleObj[i] = tempEvent
                locationIndex++
            }

            return scheduleObj
        })
        .catch((error) => console.error(error))

    return ({
        schedule: teamSchedule,
        date: new Date()
    })
}

export const compareDates = (d1: Date, d2: Date): boolean => {
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
    const players = db.collection(process.env.MONGODB_PLAYERS_COLL)
    const schedules = db.collection(process.env.MONGODB_SCHEDULES_COLL)

    for (let player of req.body.playersLst) {
        let teamNumber: number = -1
        if (req.body.league === "fpsl") {
            // FOR 2023 FPSL NAMES
            teamNumber = await getPlayerTeamNumber("fpsl", player)
        // handling ranged leagues separately
        } else if (req.body.league === "uhle") {
            const leaguePlayersCursor = players.find({league: req.body.league})
            if (leaguePlayersCursor) {
                const leaguePlayersPromise = leaguePlayersCursor.toArray()
                    .then((docs: any) => {
                        return docs[0]
                    })
                    .catch((error: any) => console.error(error))
                const leaguePlayers = await leaguePlayersPromise

                for (let range of leagueToRangeLst[req.body.league]) {
                    if (leaguePlayers["players"][range][player] !== undefined) {
                        teamNumber = leaguePlayers["players"][range][player]
                    }
                }
            }
        } else {
            const leaguePlayersCursor = players.find({league: req.body.league})
            if (leaguePlayersCursor) {
                const leaguePlayersPromise = leaguePlayersCursor.toArray()
                    .then((docs: any) => {
                        return docs[0]
                    })
                    .catch((error: any) => console.error(error))
                const leaguePlayers = await leaguePlayersPromise
                teamNumber = leaguePlayers.players[player]
            }
        }

        // if a teamNumber was found
        if ((teamNumber !== -1) && (teamNumber !== undefined)) {
            // if schedules does not have a document with league: req.body.league then create one
            let leagueSchedulesCursor = schedules.find({league: req.body.league})
            if (leagueSchedulesCursor) {
                const leagueSchedulesPromise = leagueSchedulesCursor.toArray()
                    .then((docs: any) => {
                        return docs[0]
                    })
                    .catch((error: any) => console.error(error))
                const leagueSchedules = await leagueSchedulesPromise
                
                if (leagueSchedules === undefined) {
                    schedules.insertOne({league: req.body.league})
                }
            }

            // check if the league document has a schedule for the current teamNumber
            leagueSchedulesCursor = schedules.find({league: req.body.league})
            if (leagueSchedulesCursor) {
                const leagueSchedulesPromise = leagueSchedulesCursor.toArray()
                    .then((docs: any) => {
                        return docs[0]
                    })
                    .catch((error: any) => console.error(error))
                const leagueSchedules = await leagueSchedulesPromise

                // if the league document in schedules doesn't have a schedule for the current teamNumber then create one
                if (teamNumber in leagueSchedules) {
                    // if the current teamNumber schedule hasn't been updated today then update it
                    if (compareDates(new Date(), leagueSchedules[teamNumber].date)) {
                        schedules.updateOne({league: req.body.league}, {
                            $set: {
                                [`${teamNumber}`]: await getScheduleForTeamNumber(req.body.league, teamNumber)
                            }
                        })
                    }
                } else {
                    // add a schedule for teamNumber in the league document
                    schedules.updateOne({league: req.body.league}, {
                        $set: {
                            [`${teamNumber}`]: await getScheduleForTeamNumber(req.body.league, teamNumber)
                        }
                    })
                }
            }
        }
    }

    return res.status(200).json({})
}