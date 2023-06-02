const { MongoClient } = require('mongodb')
require("dotenv").config({path: "../.env"})
const cheerio = require("cheerio")

const teamScheduleURLS = [
    "https://pada.org/t/team-01-11612/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-02-8456/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-03-7271/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-04-6494/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-05-4271/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-06-3916/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-07-2461/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-08-2290/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-09-1259/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-10-1168/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-11-853/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-12-810/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-13-533/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-14-503/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-15-437/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-16-407/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-17-243/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-18-227/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-19-190/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-20-180/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-21-152/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-22-146/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-23-136/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-24-126/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-25-96/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-26-83/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-27-77/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-28-74/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-29-64/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-30-65/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-31-62/schedule/event_id/active_events_only/game_type/upcoming",
    "https://pada.org/t/team-32-57/schedule/event_id/active_events_only/game_type/upcoming"
]

const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const main = async () => {
    await client.connect()
    const db = client.db(process.env.MONGODB_DBNAME)
    const coll = db.collection(process.env.MONGODB_COLLNAME)

    const numberToTeamSchedule = {date: new Date()}

    const teamSchedulePromisesLst =  teamScheduleURLS.map(async (url, index) => {
        const teamSchedule = await fetch(url, {method: "GET"})
            .then((res) => {
                if (res.ok) {
                    return res.text()
                }
            })
            .then((data) => {
                const $ = cheerio.load(data)

                const dateSpans = $("span.push-left").filter((_index, element) => $(element).children("a").length === 0).toArray()
                const locationAnchors = $("span.push-left").find("a").toArray()
                const fieldSpans = $("span.push-left").filter((_index, element) => $(element).find("a").length > 0).toArray()
                let scheduleObj = {}

                for (let i = 0; i < dateSpans.length; i++) {
                    let tempSchedule = {
                        date: new Date($(dateSpans[i]).text()),
                        location: $(locationAnchors[i]).text()
                    }

                    if ($(locationAnchors[i]).text() !== "PLD (Parking Lot Duty)") {
                        tempSchedule["field"] = $(fieldSpans[i]).text().trim().slice(-2)
                    }

                    scheduleObj[i] = tempSchedule
                }

                return scheduleObj
            })
            .catch((error) => console.error(error))
        
        return teamSchedule
    })

    await Promise.all(teamSchedulePromisesLst)
        .then((values) => {
            values.forEach((val, index) => {
                numberToTeamSchedule[index + 1] = val
            })
        })
        .catch((error) => console.error(error))
    
    
    await coll.deleteMany()
    await coll.insertOne(numberToTeamSchedule)

    client.close()
}   

main()
