import { NextApiRequest, NextApiResponse } from "next";

const { MongoClient } = require("mongodb");
require("dotenv").config({ path: "../.env" });
const cheerio = require("cheerio");

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

import { fpsl2024ScheduleUrls } from "@/scheduleUrls";

type PlayerlessEvent = {
    date: Date;
    location: string;
    field?: string;
};

const getScheduleForTeamNumber = async (teamNumber: number) => {
    const teamSchedule = await fetch(fpsl2024ScheduleUrls[teamNumber - 1], {
        method: "GET",
    })
        .then((res) => {
            if (res.ok) {
                return res.text();
            }
        })
        .then((data) => {
            const $ = cheerio.load(data);

            const dateSpans = $("span.push-left")
                .filter(
                    (_index: number, element: any) =>
                        $(element).children("a").length === 0
                )
                .toArray();
            const locationAnchors = $("span.push-left").find("a").toArray();
            const fieldSpans = $("span.push-left")
                .filter(
                    (_index: number, element: any) =>
                        $(element).find("a").length > 0
                )
                .toArray();
            const opponentDivs = $(
                "div.row-fluid-always div.schedule-team-name:nth-child(2)"
            )
                .find("a")
                .toArray();
            let scheduleObj: { [key: number]: PlayerlessEvent } = {};

            let locationIndex = 0; // only necessary because uhle pld format will make dateSpans.length !== locationAnchors.length
            for (let i = 0; i < dateSpans.length; i++) {
                let tempEvent: PlayerlessEvent = {
                    date: new Date($(dateSpans[i]).text()),
                    location: $(locationAnchors[locationIndex]).text(),
                };

                if (
                    $(locationAnchors[locationIndex]).text() !==
                    "PLD (Parking Lot Duty)"
                ) {
                    if (
                        $(locationAnchors[locationIndex]).text() !==
                            "Ball Fields" ||
                        $(fieldSpans[locationIndex])
                            .text()
                            .trim()
                            .slice(-2)[0] === "#"
                    ) {
                        tempEvent["field"] = $(fieldSpans[locationIndex])
                            .text()
                            .trim()
                            .slice(-2);
                    }
                }

                scheduleObj[i] = tempEvent;
                locationIndex++;
            }

            return scheduleObj;
        })
        .catch((error) => console.error(error));

    return {
        t: teamNumber,
        schedule: teamSchedule,
        date: new Date(),
    };
};

export const compareDates = (d1: Date, d2: Date): boolean => {
    // returns true if d1 and d2 are different days, false otherwise
    if (d1 === undefined) {
        return true;
    }

    const d1EST = new Date(
        d1.toLocaleString("en-US", { timeZone: "America/New_York" })
    );
    const d2EST = new Date(
        d2.toLocaleString("en-US", { timeZone: "America/New_York" })
    );

    return (
        d1EST.getFullYear() !== d2EST.getFullYear() ||
        d1EST.getMonth() !== d2EST.getMonth() ||
        d1EST.getDate() !== d2EST.getDate()
    );
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    await client.connect();
    const db = client.db(process.env.MONGODB_DBNAME);
    const players = db.collection(process.env.MONGODB_PLAYERS_COLL);
    const schedules = db.collection(process.env.MONGODB_SCHEDULES_COLL);

    for (let player of req.body.playersLst) {
        const playerDoc = await players.findOne({
            n: player,
        });

        if (playerDoc === null) {
            return res.status(400).json({});
        }

        const scheduleDoc = await schedules.findOne({ t: playerDoc.t });

        if (compareDates(new Date(), scheduleDoc.date)) {
            await schedules.deleteOne({ t: playerDoc.t });
            await schedules.insertOne(
                await getScheduleForTeamNumber(playerDoc.t)
            );
        }
    }

    return res.status(200).json({});
}
