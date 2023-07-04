import { NextApiRequest, NextApiResponse } from "next"
import { compareDates } from "./pullSchedules"

import { 
    uhle2023RosterUrls,
    picl2023RosterUrls,
    ccm2023RosterUrls,
    delawareOpen2023RosterUrls,
    rocky2023RosterUrls,
    delawareMixed2023RosterUrls,
    southJerseyMixed2023RosterUrls
} from "@/rosterUrls"

const cheerio = require("cheerio")
const { MongoClient } = require('mongodb')
require("dotenv").config({path: "../.env"})

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const leagueToRosterUrls: {[key: string]: string[]} = {
    uhle: uhle2023RosterUrls,
    picl: picl2023RosterUrls,
    ccm: ccm2023RosterUrls,
    delaware_open: delawareOpen2023RosterUrls,
    rocky: rocky2023RosterUrls,
    delaware_mixed: delawareMixed2023RosterUrls,
    south_jersey: southJerseyMixed2023RosterUrls
}

const exceptions: {[key: string]: string} = {
    "natalie felix didonato": "Natalie Felix DiDonato",
    "geoff dimasi": "Geoff DiMasi",
    "cj finnigan": "CJ Finnigan"
}

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

const rosterUrlToNamesLst = async (url: string) => {
    const namesLst = await fetch(url, {method: "GET"})
        .then((res) => {
            if (res.ok) {
                return res.text()
            } else {
                throw new Error(`Failed to access roster page: ${url}.`)
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await client.connect()
    const db = client.db(process.env.MONGODB_DBNAME)
    const players = db.collection(process.env.MONGODB_PLAYERS_COLL)

    const oldPlayers = await players.find({league: req.body.league})
    if (oldPlayers) {
        const oldDatePromise = oldPlayers.toArray()
            .then((docs: any) => {
                return docs[0].date
            })
            .catch((error: any) => console.error(error))
        const oldDate = await oldDatePromise

        if (!compareDates(oldDate, new Date())) {
            return res.status(200).json({})
        }
    }

    const playerToTeamNumber: {[key: string]: Date | string | {[key: string]: number}} = {
        date: new Date(),
        league: req.body.league
    }
    
    let playersObj: {[key: string]: number} = {}
    for (let i = 0; i < leagueToRosterUrls[req.body.league].length; i++) {
        for (let name of (await rosterUrlToNamesLst(leagueToRosterUrls[req.body.league][i]) as string[])) {
            playersObj[name] = i + 1
        }
    }
    playerToTeamNumber["players"] = playersObj

    
    await players.deleteOne({league: req.body.league})
    await players.insertOne(playerToTeamNumber)

    client.close()
    return res.status(200).json({})
}