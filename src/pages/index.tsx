import { useState, useEffect } from "react"

import { Header } from "@/components/Header"
import { Input } from "@/components/Input"
import { Schedule } from "@/components/Schedule"
import { Footer } from "@/components/Footer"
import { HowItWorks } from "@/components/HowItWorks"
import { HowItsBuilt } from "@/components/HowItsBuilt"

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
    const [readyToGenerate, setReadyToGenerate] = useState<boolean>(true)
    const [errorType, setErrorType] = useState<string>("") 
    const [league, setLeague] = useState("fpsl")

    useEffect(() => {
        if (masterSchedule.length > 0) {
            setScheduleGenerated(true)
            setReadyToGenerate(true)
        }
    }, [masterSchedule])

    const handlePopup = (popupStr: string) => {
        setPopup(popupStr)
    }

    const handleSubmit = async (playersLst: string[]) => {
        await fetch("/api/pullSchedules", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({league: "fpsl"})
        })

        setScheduleGenerated(false)
        setReadyToGenerate(false)
        setErrorType("")

        console.log("schedules pulled", playersLst)
        
        await fetch("/api/generateSchedule", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({league: "fpsl", playersLst: playersLst})
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                } else if (res.status === 400) {
                    setErrorType("Unrecognized name")
                } else if (res.status === 500) {
                    setErrorType("Server error")
                }
            })
            .then((data) => {
                setMasterSchedule(Object.values(data.masterSchedule))
            })
            .catch((error) => {
                setReadyToGenerate(true)
            })
    }
    
    return (
        <>
            {popup !== "How it Works" ? (<></>) : (<HowItWorks handlePopup={handlePopup} />)}
            {popup !== "How it's Built" ? (<></>) : (<HowItsBuilt handlePopup={handlePopup} />)}
            <div className={`${popup !== "" ? "blur-sm" : ""}`}>
                <div>
                    <Header handlePopup={handlePopup} />
                </div>
                <div>
                    <Input handleSubmit={handleSubmit} scheduleGenerated={scheduleGenerated} readyToGenerate={readyToGenerate} errorType={errorType} />
                </div>
                <div>
                    <Schedule masterSchedule={masterSchedule} scheduleGenerated={scheduleGenerated} />
                </div>
                <div>
                    <Footer />
                </div>
            </div>
        </>
    )
}