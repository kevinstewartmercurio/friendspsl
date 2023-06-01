import { useState, useEffect } from "react"

import { Input } from "@/components/Input"
import { Schedule } from "@/components/Schedule"

export type Event = {
    player: string,
    date?: Date,
    location: string,
    field?: string
}

export default function Home() {
    const [masterSchedule, setMasterSchedule] = useState<[Date, Event[]][]>([])

    // useEffect(() => {
    //     console.log(masterSchedule)
    // }, [masterSchedule])

    const handleSubmit = async (playersLst: string[]) => {
      await fetch("/api/generateSchedule", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({playersLst: playersLst})
      })
        .then((res) => {
            if (res.ok) {
                return res.json()
            }
        })
        .then((data) => {
            setMasterSchedule(Object.values(data.masterSchedule))
        })
    }
    
    return (
        <>
            <div>
                <Input handleSubmit={handleSubmit} />
            </div>
            <div>
                <Schedule masterSchedule={masterSchedule} />
            </div>
        </>
    )
}