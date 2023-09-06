import type { NextApiRequest, NextApiResponse } from "next"
import { Event } from ".."
import { leagueToRangeLst } from "./pullSchedules"

require("dotenv").config({path: "../.env"})
const { MongoClient } = require('mongodb')

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

export const getPlayerTeamNumber = async (league: string, player: string) => {
    if (league === "phillyfallcompetitive") {
        await client.connect()
        const db = client.db(process.env.MONGODB_DBNAME)
        const players = db.collection(process.env.MONGODB_PLAYERS_COLL)

        const leaguePlayersCursor = players.find({league: league})
        if (leaguePlayersCursor) {
            const leaguePlayersPromise = leaguePlayersCursor.toArray()
                .then((docs: any) => {
                    return docs[0]
                })
                .catch((error: any) => console.error(error))
            const leaguePlayers = await leaguePlayersPromise

            for (let range of leagueToRangeLst[league]) {
                if (leaguePlayers["players"][range][player] !== undefined) {
                    return leaguePlayers["players"][range][player]
                }
            }
        }
    } else {
        await client.connect()
        const db = client.db(process.env.MONGODB_DBNAME)
        const players = db.collection(process.env.MONGODB_PLAYERS_COLL)

        const leaguePlayersCursor = players.find({league: league})
        if (leaguePlayersCursor) {
            const leaguePlayersPromise = leaguePlayersCursor.toArray()
                .then((docs: any) => {
                    return docs[0]
                })
                .catch((error: any) => console.error(error))
            const leaguePlayers = await leaguePlayersPromise
            
            return leaguePlayers["players"][player]
        }
    }

    return -1
}

const getPlayerSchedules = async (league: string, playersLst: string[]): Promise<Event[][]> => {
    await client.connect()
    const db = client.db(process.env.MONGODB_DBNAME)
    const schedules = db.collection(process.env.MONGODB_SCHEDULES_COLL)

    let leagueSchedules: any
    const leagueSchedulesCursor = await schedules.find({league: league})
    if (leagueSchedulesCursor) {
        const leagueSchedulesPromise = leagueSchedulesCursor.toArray()
            .then((docs: any) => {
                return docs[0]
            })
            .catch((error: any) => console.error(error))
        leagueSchedules = await leagueSchedulesPromise
    }
    
    let playerSchedulesLst: Event[][] = []

    for (let player of playersLst) {
        let teamNumber = await getPlayerTeamNumber(league, player)
        if (teamNumber === -1) {
            throw new Error(`Name "${player}" was not found.`)
        }

        const playerlessEventLst = leagueSchedules[teamNumber].schedule
        let playerSchedule: Event[] = []
        for (let i = 0; i < Object.keys(playerlessEventLst).length; i++) {
            let tempEvent: Event = {
                player: player,
                date: playerlessEventLst[i].date,
                location: playerlessEventLst[i].location,
            }

            if (playerlessEventLst[i].field) {
                tempEvent.field = playerlessEventLst[i].field
            }

            playerSchedule.push(tempEvent)
        }
        
        playerSchedulesLst.push(playerSchedule)
    }

    client.close()
    return playerSchedulesLst
}

const parseSchedules = (playerSchedulesLst: Event[][]): [Date, Event[]][] => {
    let schedulesEmpty = false
    let eventsSortedByDate: Event[] = []
    let curEarliestIdx = 0

    // compile all schedules into one list sorted by date
    while (!schedulesEmpty) {
        for (let i = 0; i < playerSchedulesLst.length; i++) {
            if (playerSchedulesLst[i].length > 0) {
                curEarliestIdx = i
                break
            }
        }

        for (let i = 0; i < playerSchedulesLst.length; i++) {
            if (playerSchedulesLst[i].length > 0) {
                if (playerSchedulesLst[i][0].date! <= playerSchedulesLst[curEarliestIdx][0].date!) {
                    curEarliestIdx = i
                }
            }
        }
        
        eventsSortedByDate.push(playerSchedulesLst[curEarliestIdx].shift()!)
        
        schedulesEmpty = true
        for (let schedule of playerSchedulesLst) {
            if (schedule.length > 0) {
                schedulesEmpty = false
                break
            }
        }
    }

    // compile a list of events grouped by date
    if (eventsSortedByDate[0] === undefined) {
        return []
    }

    let eventsGroupedByDateLst: [Date, Event[]][] = []
    let currentDate = eventsSortedByDate[0].date
    while (eventsSortedByDate.length > 0) {
        delete eventsSortedByDate[0].date

        if (eventsGroupedByDateLst.length > 0) {
            if (currentDate!.getTime() === eventsGroupedByDateLst[eventsGroupedByDateLst.length - 1][0].getTime()) {
                eventsGroupedByDateLst[eventsGroupedByDateLst.length - 1][1].push(eventsSortedByDate.shift()!)
            } else {
                eventsGroupedByDateLst.push([currentDate!, [eventsSortedByDate.shift()!]])
            }
        } else {
            eventsGroupedByDateLst.push([currentDate!, [eventsSortedByDate.shift()!]])
        }
        
        if (eventsSortedByDate.length > 0) {
            if (currentDate !== eventsSortedByDate[0].date) {
                currentDate = eventsSortedByDate[0].date
            }
        }
    }

    return eventsGroupedByDateLst
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const playerSchedulesLst = await getPlayerSchedules(req.body.league, req.body.playersLst)

        if (!playerSchedulesLst) {
            return res.status(500).json({error: "Failed to compile individual player schedules."})
        }

        const masterSchedule = parseSchedules(playerSchedulesLst)

        if (masterSchedule) {
            return res.status(200).json({masterSchedule: masterSchedule})
        } else {
            return res.status(500).json({error: "Failed to create master schedule."})
        }
    } catch (error: any) {
        return res.status(400).json({error: error.message})
    }
}