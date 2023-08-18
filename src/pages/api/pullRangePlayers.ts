import { NextApiRequest, NextApiResponse } from "next"
import { compareDates } from "./pullSchedules"
import { rosterUrlToNamesLst } from "./pullPlayers"

// import {
    
// } from "@/rosterUrls"

const { MongoClient } = require("mongodb")
require("dotenv").config({path: "../.env"})

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const leagueToRosterUrls: {[key: string]: string[]} = {
    
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await client.connect()
    const db = client.db(process.env.MONGODB_DBNAME)
    const players = db.collection(process.env.MONGODB_PLAYERS_COLL)

    const oldPlayers = await players.find({league: req.body.league})
    if (oldPlayers) {
        const oldRangeDatePromise = oldPlayers.toArray()
            .then((docs: any) => {
                if (docs[0] !== undefined) {
                    return docs[0][`date-${req.body.start}-${req.body.end}`]
                } else {
                    return null
                }
            })
            .catch((error: any) => console.error(error))
        const oldRangeDate = await oldRangeDatePromise
        
        if (oldRangeDate !== null) {
            if (!compareDates(oldRangeDate, new Date())) {
                return res.status(200).json({})
            }
        }
    }

    let rangePlayersObj: {[key: string]: number} = {}
    for (let i = req.body.start; i <= req.body.end; i++) {
        for (let name of (await rosterUrlToNamesLst(leagueToRosterUrls[req.body.league][i - 1]) as string[])) {
            rangePlayersObj[name] = i
        }
    }

    const updateRangePlayersQuery = {$set: {} as {[key: string]: {[key: string]: number}}}
    updateRangePlayersQuery.$set[`players.${req.body.start}-${req.body.end}`] = rangePlayersObj
    await players.updateOne({league: req.body.league}, updateRangePlayersQuery)

    const updateRangeDateQuery = {$set: {} as {[key: string]: Date}}
    updateRangeDateQuery.$set[`date-${req.body.start}-${req.body.end}`] = new Date()
    await players.updateOne({league: req.body.league}, updateRangeDateQuery)

    return res.status(200).json({})
}