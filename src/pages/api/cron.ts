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
import getConfig from "next/config"
const { publicRuntimeConfig } = getConfig();
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
const leagueToSpreadsheetPath: {[key: string]: string} = {
    fpsl: "public/FPSL_Draft_2023.xlsx",
    uhle: "public/UHLe_Rosters_2023.xlsx",
    picl: "public/PICL_Rosters_2023.xlsx"
}

type PlayerlessEvent = {
    date: Date,
    location: string,
    field?: string
}



// ROSTER UPDATING HELPER FUNCTIONS
// for names that don't follow the formatting expectations in formatName
const exceptions: {[key: string]: string} = {
    "natalie felix didonato": "Natalie Felix DiDonato",
    "geoff dimasi": "Geoff DiMasi",
    "cj finnigan": "CJ Finnigan"
}

// removes extra spaces in names, fixes capitalization errors, etc.
const formatName = (name: string): string => {
    let retName = name.toLowerCase()

    // check if name is in the list of name formatting exceptions
    if (exceptions[retName]) {
        return exceptions[retName]
    }

    // replace multiple space characters in a row with a single space character
    retName = retName.replace(/ +/g, " ")

    // remove periods and commas
    retName = retName.replace(/[.,]/g, "")

    // capitalize the first letter
    retName = `${retName[0].toUpperCase()}${retName.substring(1)}`

    // capitalize letters after spaces, hyphens, apostrophes, and "Mc"
    let tempChar: string
    for (let i = 1; i < retName.length; i++) {
        if (retName[i - 1] === " " || retName[i - 1] === "-" || retName[i - 1] === "'" || retName.substring(i - 2, i) === "Mc") {
            tempChar = retName.charAt(i).toUpperCase()
            retName = `${retName.substring(0, i)}${tempChar}${retName.substring(i + 1)}`
        }
    }

    return retName
}

// fetches all publicly available names from the input roster page
const linkToNamesLst = async (url: string) => {
    const namesLst= await fetch(url, {method: "GET"})
        .then((res) => {
            if (res.ok) {
                return res.text()
            } else {
                throw new Error(`Failed to access roster page (${url})`)
            }
        })
        .then((data) => {
            const $ = cheerio.load(data)

            const nameTags = $("div.media-item-tile-overlay.media-item-tile-overlay-bottom > h3")
            
            let names: string[] = []
            let tempName: string
            for (let i = 0; i < nameTags.length; i++) {
                tempName = formatName($(nameTags[i]).text())
                names.push(tempName)
            }

            return names
        })
        .catch((error) => console.error(error))

    return namesLst
}

// takes a list of roster pages and outputs a list of lists of names
const linksToLeagueNames = async (urls: string[]) => {
    const leagueNamesPromises = urls.map(async (url) => {
        return await linkToNamesLst(url)
    })

    const leagueNames = Promise.all(leagueNamesPromises)
        .then((values) => {
            return values
        })

    return leagueNames
}

// populates the input spreadsheet with the input names
const writeNamesToSpreadsheet = (names: string[][], spreadsheetPath: string) => {
    // const filePath = path.join(process.cwd(), spreadsheetPath)
    const filePath = path.join(publicRuntimeConfig, spreadsheetPath)
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // clear the spreadsheet
    for (const cellAddress in worksheet) {
        delete worksheet[cellAddress]
    }

    // populate the spreadsheet with names
    names.forEach((innerLst, index) => {
        innerLst.unshift((index + 1).toString())

        XLSX.utils.sheet_add_aoa(worksheet, [innerLst], {origin: -1, skipHeader: false})
    })

    XLSX.writeFile(workbook, filePath)
}

// populates the input spreadsheet with names fetched from the input list of roster page urls
const linksToSpreadsheet = async (urls: string[], filePath: string): Promise<void> => {
    const names = await linksToLeagueNames(urls)
    writeNamesToSpreadsheet(names as string[][], filePath)
}



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // connect to database
    await client.connect()
    const db = client.db(process.env.MONGODB_DBNAME)
    const schedules = db.collection(process.env.MONGODB_COLLNAME)

    // updates all schedule objects in the schedules collection for each league
    for (let league of leagues) {
        // ex: {league: "fpsl", 1: [schedule], 2: [schedule], ...}
        const newNumberToTeamSchedules: {[key: number | string]: {[key: number]: PlayerlessEvent} | Date | string} = {
            date: new Date(),
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

    // updates roster spreadsheets for each league (excluding fpsl 2023, which stores draft data)
    for (let league of leagues.slice(1)) {
        await linksToSpreadsheet(leagueToRosterUrls[league], leagueToSpreadsheetPath[league])
    }
    
    res.status(200).end("Running cron job...")
}