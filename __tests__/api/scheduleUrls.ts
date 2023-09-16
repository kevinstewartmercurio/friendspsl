import fetchMock from "jest-fetch-mock"

import { 
    ccmfall2023ScheduleUrls,
    phillyfallcasual2023ScheduleUrls,
    phillyfallcompetitive2023ScheduleUrls,
    phillyopenfall2023ScheduleUrls,
    phillywomanmatchingfall2023ScheduleUrls,
    delawareFallOpen2023ScheduleUrls
} from "@/scheduleUrls"

const scheduleUrls: string[][] = [
    ccmfall2023ScheduleUrls,
    phillyfallcasual2023ScheduleUrls,
    phillyfallcompetitive2023ScheduleUrls,
    phillyopenfall2023ScheduleUrls,
    phillywomanmatchingfall2023ScheduleUrls,
    delawareFallOpen2023ScheduleUrls
]

const canFetchUrl = async (url: string): Promise<boolean> => {
    try {
        const res = await fetchMock(url, {method: "GET"})

        if (res.ok) {
            return true
        } else {
            console.error(`Received status code ${res.status} from ${url}`)
            return false
        }
    } catch (error: any) {
        console.error(`Error fetching ${url}: ${error.message}`)
        return false
    }
}

for (let scheduleUrlsLst of scheduleUrls) {
    for (let url of scheduleUrlsLst) {
        test(`fetching schedule url ${url}`, async () => {
            const res = await canFetchUrl(url)
            expect(res).toBe(true)
        })
    }
}