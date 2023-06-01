import type { NextApiRequest, NextApiResponse } from "next"

const path = require("path")
const XLSX = require("xlsx")
const cheerio = require("cheerio")

type Event = {
    player: string,
    date?: Date,
    location: string,
    field?: string
}

const teamNumberToScheduleURL: {[key: number]: string} = {
    1: "https://pada.org/t/team-01-11612/schedule/event_id/active_events_only/game_type/upcoming",
    2: "https://pada.org/t/team-02-8456/schedule/event_id/active_events_only/game_type/upcoming",
    3: "https://pada.org/t/team-03-7271/schedule/event_id/active_events_only/game_type/upcoming",
    4: "https://pada.org/t/team-04-6494/schedule/event_id/active_events_only/game_type/upcoming",
    5: "https://pada.org/t/team-05-4271/schedule/event_id/active_events_only/game_type/upcoming",
    6: "https://pada.org/t/team-06-3916/schedule/event_id/active_events_only/game_type/upcoming",
    7: "https://pada.org/t/team-07-2461/schedule/event_id/active_events_only/game_type/upcoming",
    8: "https://pada.org/t/team-08-2290/schedule/event_id/active_events_only/game_type/upcoming",
    9: "https://pada.org/t/team-09-1259/schedule/event_id/active_events_only/game_type/upcoming",
    10: "https://pada.org/t/team-10-1168/schedule/event_id/active_events_only/game_type/upcoming",
    11: "https://pada.org/t/team-11-853/schedule/event_id/active_events_only/game_type/upcoming",
    12: "https://pada.org/t/team-12-810/schedule/event_id/active_events_only/game_type/upcoming",
    13: "https://pada.org/t/team-13-533/schedule/event_id/active_events_only/game_type/upcoming",
    14: "https://pada.org/t/team-14-503/schedule/event_id/active_events_only/game_type/upcoming",
    15: "https://pada.org/t/team-15-437/schedule/event_id/active_events_only/game_type/upcoming",
    16: "https://pada.org/t/team-16-407/schedule/event_id/active_events_only/game_type/upcoming",
    17: "https://pada.org/t/team-17-243/schedule/event_id/active_events_only/game_type/upcoming",
    18: "https://pada.org/t/team-18-227/schedule/event_id/active_events_only/game_type/upcoming",
    19: "https://pada.org/t/team-19-190/schedule/event_id/active_events_only/game_type/upcoming",
    20: "https://pada.org/t/team-20-180/schedule/event_id/active_events_only/game_type/upcoming",
    21: "https://pada.org/t/team-21-152/schedule/event_id/active_events_only/game_type/upcoming",
    22: "https://pada.org/t/team-22-146/schedule/event_id/active_events_only/game_type/upcoming",
    23: "https://pada.org/t/team-23-136/schedule/event_id/active_events_only/game_type/upcoming",
    24: "https://pada.org/t/team-24-126/schedule/event_id/active_events_only/game_type/upcoming",
    25: "https://pada.org/t/team-25-96/schedule/event_id/active_events_only/game_type/upcoming",
    26: "https://pada.org/t/team-26-83/schedule/event_id/active_events_only/game_type/upcoming",
    27: "https://pada.org/t/team-27-77/schedule/event_id/active_events_only/game_type/upcoming",
    28: "https://pada.org/t/team-28-74/schedule/event_id/active_events_only/game_type/upcoming",
    29: "https://pada.org/t/team-29-64/schedule/event_id/active_events_only/game_type/upcoming",
    30: "https://pada.org/t/team-30-65/schedule/event_id/active_events_only/game_type/upcoming",
    31: "https://pada.org/t/team-31-62/schedule/event_id/active_events_only/game_type/upcoming",
    32: "https://pada.org/t/team-32-57/schedule/event_id/active_events_only/game_type/upcoming"
}

const getPlayerTeamNumber = (player: string): number => {
    const filePath = path.join(process.cwd(), "public/FPSL_Draft_2023.xlsx")
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    for (const cellAddress in worksheet) {
        if (worksheet.hasOwnProperty(cellAddress)) {
            const cellValue = worksheet[cellAddress].v
            if (cellValue === player) {
                return parseInt(cellAddress.slice(1))
            }
        }
    }

    return -1
}

const getPlayerSchedules = async (playersLst: string[]): Promise<Event[][]> => {
    let playerSchedulesLst: Event[][] = []

    for (let player of playersLst) {
        let teamNumber = getPlayerTeamNumber(player)
        if (teamNumber === -1) {
            throw new Error(`Name "${player}" was not found.`)
        }

        let teamScheduleURL = teamNumberToScheduleURL[teamNumber]

        const playerSchedule = await fetch(teamScheduleURL, {
            method: "GET"
        })
            .then((res) => {
                if (res.ok) {
                    return res.text()
                } else {
                    throw new Error("Failed to fetch from team schedule URL.")
                }
            })
            .then((data) => {
                const $ = cheerio.load(data)

                const dateSpans = $("span.push-left").filter((_index: number, element: any) => $(element).children("a").length === 0).toArray()
                const locationAnchors = $("span.push-left").find("a").toArray()
                const fieldSpans = $("span.push-left").filter((_index: number, element: any) => $(element).find("a").length > 0).toArray()
                let scheduleLst = []

                for (let i = 0; i < dateSpans.length; i++) {
                    let tempSchedule: Event = {
                        player: player,
                        date: new Date($(dateSpans[i]).text()),
                        location: $(locationAnchors[i]).text()
                    }

                    if ($(locationAnchors[i]).text() !== "PLD (Parking Lot Duty)") {
                        tempSchedule["field"] = $(fieldSpans[i]).text().trim().slice(-2)
                    }

                    scheduleLst.push(tempSchedule)
                }

                return scheduleLst
            })
            .catch((error) => console.error(error))
        
        if (playerSchedule) {
            playerSchedulesLst.push(playerSchedule)
        }
    }

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
        const playerSchedulesLst = await getPlayerSchedules(req.body.playersLst as string[])

        if (!playerSchedulesLst) {
            return res.status(500).json({error: "Failed to create individual player schedules."})
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