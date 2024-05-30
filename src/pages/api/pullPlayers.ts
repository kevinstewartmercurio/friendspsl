import { NextApiRequest, NextApiResponse } from "next";
import { compareDates } from "./pullSchedules";
import { formatName } from "..";

// import { fpsl2024RosterUrls } from "@/rosterUrls";

const cheerio = require("cheerio");
const { MongoClient } = require("mongodb");
require("dotenv").config({ path: "../.env" });

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const leagueToRosterUrls: { [key: string]: string[] } = {
    // fpsl: fpsl2024RosterUrls,
};

export const rosterUrlToNamesLst = async (url: string) => {
    const namesLst = await fetch(url, { method: "GET" })
        .then((res) => {
            if (res.ok) {
                return res.text();
            } else {
                throw new Error(`Failed to access roster page: ${url}.`);
            }
        })
        .then((data) => {
            const $ = cheerio.load(data);

            const nameTags = $(
                "div.media-item-tile-overlay.media-item-tile-overlay-bottom > h3"
            );

            let names: string[] = [];
            let tempName: string;
            for (let i = 0; i < nameTags.length; i++) {
                tempName = formatName($(nameTags[i]).text());
                names.push(tempName);
            }

            return names;
        })
        .catch((error) => console.error(error));

    return namesLst;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await client.connect();
    const db = client.db(process.env.MONGODB_DBNAME);
    const players = db.collection(process.env.MONGODB_PLAYERS_COLL);

    const oldPlayers = await players.find({ league: req.body.league });
    if (oldPlayers) {
        const oldDatePromise = oldPlayers
            .toArray()
            .then((docs: any) => {
                if (docs[0] !== undefined) {
                    return docs[0].date;
                } else {
                    return null;
                }
            })
            .catch((error: any) => console.error(error));
        const oldDate = await oldDatePromise;

        if (oldDate !== null) {
            if (!compareDates(oldDate, new Date())) {
                return res.status(200).json({});
            }
        }
    }

    const playerToTeamNumber: {
        [key: string]: Date | string | { [key: string]: number };
    } = {
        date: new Date(),
        league: req.body.league,
    };

    let playersObj: { [key: string]: number } = {};
    for (let i = 0; i < leagueToRosterUrls[req.body.league].length; i++) {
        for (let name of (await rosterUrlToNamesLst(
            leagueToRosterUrls[req.body.league][i]
        )) as string[]) {
            playersObj[name] = i + 1;
        }
    }
    playerToTeamNumber["players"] = playersObj;

    await players.deleteOne({ league: req.body.league });
    await players.insertOne(playerToTeamNumber);

    client.close();
    return res.status(200).json({});
}
