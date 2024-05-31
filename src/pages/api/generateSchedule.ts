import type { NextApiRequest, NextApiResponse } from "next";
import { Event } from "..";

require("dotenv").config({ path: "../.env" });
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const getPlayerSchedules = async (playersLst: string[]): Promise<Event[][]> => {
    await client.connect();
    const db = client.db(process.env.MONGODB_DBNAME);
    const players = db.collection(process.env.MONGODB_PLAYERS_COLL);
    const schedules = db.collection(process.env.MONGODB_SCHEDULES_COLL);

    let playerSchedulesLst: Event[][] = [];

    for (let player of playersLst) {
        const playerDoc = await players.findOne({ n: player });

        if (playerDoc === null) {
            throw new Error(`Name ${player} was not found.`);
        }

        const schedulesDoc = await schedules.findOne({ t: playerDoc.t });
        const playerlessEventLst = schedulesDoc.schedule;
        const playerSchedule: Event[] = [];
        for (let i = 0; i < Object.keys(playerlessEventLst).length; i++) {
            const tempEvent: Event = {
                player: player,
                date: playerlessEventLst[i].date,
                location: playerlessEventLst[i].location,
            };

            if (playerlessEventLst[i].field) {
                tempEvent.field = playerlessEventLst[i].field;
            }

            playerSchedule.push(tempEvent);
        }

        playerSchedulesLst.push(playerSchedule);
    }

    client.close();
    return playerSchedulesLst;
};

const parseSchedules = (playerSchedulesLst: Event[][]): [Date, Event[]][] => {
    let schedulesEmpty = false;
    let eventsSortedByDate: Event[] = [];
    let curEarliestIdx = 0;

    // compile all schedules into one list sorted by date
    while (!schedulesEmpty) {
        for (let i = 0; i < playerSchedulesLst.length; i++) {
            if (playerSchedulesLst[i].length > 0) {
                curEarliestIdx = i;
                break;
            }
        }

        for (let i = 0; i < playerSchedulesLst.length; i++) {
            if (playerSchedulesLst[i].length > 0) {
                if (
                    playerSchedulesLst[i][0].date! <=
                    playerSchedulesLst[curEarliestIdx][0].date!
                ) {
                    curEarliestIdx = i;
                }
            }
        }

        eventsSortedByDate.push(playerSchedulesLst[curEarliestIdx].shift()!);

        schedulesEmpty = true;
        for (let schedule of playerSchedulesLst) {
            if (schedule.length > 0) {
                schedulesEmpty = false;
                break;
            }
        }
    }

    // compile a list of events grouped by date
    if (eventsSortedByDate[0] === undefined) {
        return [];
    }

    let eventsGroupedByDateLst: [Date, Event[]][] = [];
    let currentDate = eventsSortedByDate[0].date;
    while (eventsSortedByDate.length > 0) {
        delete eventsSortedByDate[0].date;

        if (eventsGroupedByDateLst.length > 0) {
            if (
                currentDate!.getTime() ===
                eventsGroupedByDateLst[
                    eventsGroupedByDateLst.length - 1
                ][0].getTime()
            ) {
                eventsGroupedByDateLst[
                    eventsGroupedByDateLst.length - 1
                ][1].push(eventsSortedByDate.shift()!);
            } else {
                eventsGroupedByDateLst.push([
                    currentDate!,
                    [eventsSortedByDate.shift()!],
                ]);
            }
        } else {
            eventsGroupedByDateLst.push([
                currentDate!,
                [eventsSortedByDate.shift()!],
            ]);
        }

        if (eventsSortedByDate.length > 0) {
            if (currentDate !== eventsSortedByDate[0].date) {
                currentDate = eventsSortedByDate[0].date;
            }
        }
    }

    return eventsGroupedByDateLst;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const playerSchedulesLst = await getPlayerSchedules(
            req.body.playersLst
        );

        if (!playerSchedulesLst) {
            return res.status(500).json({
                error: "Failed to compile individual player schedules.",
            });
        }

        const masterSchedule = parseSchedules(playerSchedulesLst);

        if (masterSchedule) {
            return res.status(200).json({ masterSchedule: masterSchedule });
        } else {
            return res
                .status(500)
                .json({ error: "Failed to create master schedule." });
        }
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
}
