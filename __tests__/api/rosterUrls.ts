import fetchMock from 'jest-fetch-mock'

import { 
    ccmfall2023RosterUrls,
    phillyfallcasual2023RosterUrls,
    phillyfallcompetitive2023RosterUrls,
    phillyopenfall2023RosterUrls,
    phillywomanmatchingfall2023RosterUrls,
    delawareFallOpen2023RosterUrls
} from "@/rosterUrls"

const rosterUrls: string[][] = [
    ccmfall2023RosterUrls,
    phillyfallcasual2023RosterUrls,
    phillyfallcompetitive2023RosterUrls,
    phillyopenfall2023RosterUrls,
    phillywomanmatchingfall2023RosterUrls,
    delawareFallOpen2023RosterUrls
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

for (let rosterUrlsLst of rosterUrls) {
    for (let url of rosterUrlsLst) {
        test(`fetching roster url ${url}`, async () => {
            const res = await canFetchUrl(url)
            expect(res).toBe(true)
        })
    }
}