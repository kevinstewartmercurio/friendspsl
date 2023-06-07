import type { NextApiRequest, NextApiResponse } from "next"

const path = require("path")
const XLSX = require("xlsx")
const cheerio = require("cheerio")
require("dotenv").config({path: "../.env"})
const { MongoClient } = require('mongodb')

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

import { Event } from ".."

const getPlayerTeamNumber = (league: string, player: string): number => {
    const leagueToXLSXPath: {[key: string]: string} = {
        fpsl: "public/FPSL_Draft_2023.xlsx"
    }

    console.log(leagueToXLSXPath[league])

    const filePath = path.join(process.cwd(), leagueToXLSXPath[league])
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    for (const cellAddress in worksheet) {
        if (worksheet.hasOwnProperty(cellAddress)) {
            const cellValue = worksheet[cellAddress].v
            if (cellValue === player) {
                console.log(`returning ${parseInt(cellAddress.slice(1))}`)
                return parseInt(cellAddress.slice(1))
            }
        }
    }

    console.log("returning -1 from getPlayerTeamNumber")
    return -1
}

const getPlayerSchedules = async (league: string, playersLst: string[]): Promise<Event[][]> => {
    await client.connect()
    const db = client.db(process.env.MONGODB_DBNAME)
    const schedules = db.collection(process.env.MONGODB_COLLNAME)

    const dbSchedulesRef = await schedules.find({league: league})
    const dbSchedulesPromise = dbSchedulesRef.toArray()
        .then((docs: any) => {
            return docs[0]
        })
        .catch((error: any) => console.error(error))
    const dbSchedules = await dbSchedulesPromise
    
    let playerSchedulesLst: Event[][] = []

    for (let player of playersLst) {
        let teamNumber = getPlayerTeamNumber(league, player)
        console.log("teamNumber = ", teamNumber)
        if (teamNumber === -1) {
            throw new Error(`Name "${player}" was not found.`)
        }

        const playerlessEventLst = dbSchedules[teamNumber]
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