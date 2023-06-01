import { useState, useEffect } from "react"

import { Header } from "@/components/Header"
import { Input } from "@/components/Input"
import { Schedule } from "@/components/Schedule"
import { Footer } from "@/components/Footer"

export type Event = {
    player: string,
    date?: Date,
    location: string,
    field?: string
}

export default function Home() {
    const [popup, setPopup] = useState<string>("")
    const [masterSchedule, setMasterSchedule] = useState<[Date, Event[]][]>([])
    const [scheduleGenerated, setScheduleGenerated] = useState<boolean>(false)

    useEffect(() => {
        if (masterSchedule.length > 0) {
            setScheduleGenerated(true)
        }
    }, [masterSchedule])

    const handlePopup = (popupStr: string) => {

    }

    const handleSubmit = async (playersLst: string[]) => {
        setScheduleGenerated(false)
        
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
                <Header handlePopup={handlePopup} />
            </div>
            <div>
                <Input handleSubmit={handleSubmit} scheduleGenerated={scheduleGenerated} />
            </div>
            <div>
                <Schedule masterSchedule={masterSchedule} scheduleGenerated={scheduleGenerated} />
            </div>
            <div>
                <Footer />
            </div>
        </>
    )
}