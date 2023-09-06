import {useState, useEffect, useRef} from "react"

import { Header } from "@/components/Header"
import { InputNames } from "@/components/InputNames"
import { Schedule } from "@/components/Schedule"
import { Footer } from "@/components/Footer"
import { HowItWorks } from "@/components/HowItWorks"
import { HowItsBuilt } from "@/components/HowItsBuilt"

import type { Event } from "."
import { formatName } from "."

export default function PhillyFallCompetitive() {
    const contentRef = useRef<HTMLDivElement>(null)
    const [contentHeight, setContentHeight] = useState(0)

    // 1-6, 7-12, 13-18, 19-22
    const [pulling, setPulling] = useState<boolean[]>([false, false, false, false])

    const [popup, setPopup] = useState<string>("")
    const [masterSchedule, setMasterSchedule] = useState<[Date, Event[]][] | null>(null)
    const [scheduleGenerated, setScheduleGenerated] = useState<boolean>(false)
    const [readyToGenerate, setReadyToGenerate] = useState<boolean>(true)
    const [errorType, setErrorType] = useState<string>("")

    useEffect(() => {
        if (pulling[0] === false) {
            const pullPlayers1 = async () => {
                await fetch("/api/pullRangePlayers", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        league: "phillyfallcompetitive",
                        start: 1,
                        end: 6
                    })
                })
                    .then((res) => {
                        if (res.ok) {
                            setPulling((prev) => [true, prev[1], prev[2], prev[3]])
                        }
                    })
            }

            pullPlayers1()
        }
    }, [])

    useEffect(() => {
        if (pulling[0] === true) {
            const pullPlayers2 = async () => {
                await fetch("/api/pullRangePlayers", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        league: "phillyfallcompetitive",
                        start: 7, 
                        end: 12
                    })
                })
                    .then((res) => {
                        if (res.ok) {
                            setPulling((prev) => [prev[0], true, prev[2], prev[3]])
                        }
                    })
            }

            pullPlayers2()
        }
    }, [pulling[0]])

    useEffect(() => {
        if (pulling[1] === true) {
            const pullPlayers3 = async () => {
                await fetch("/api/pullRangePlayers", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        league: "phillyfallcompetitive",
                        start: 13,
                        end: 18
                    })
                })
                    .then((res) => {
                        if (res.ok) {
                            setPulling((prev) => [prev[0], prev[1], true, prev[3]])
                        }
                    })
            }

            pullPlayers3()
        }
    }, [pulling[1]])

    useEffect(() => {
        if (pulling[2] === true) {
            const pullPlayers4 = async() => {
                await fetch("/api/pullRangePlayers", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        league: "phillyfallcompetitive",
                        start: 19,
                        end: 22
                    })
                })
                    .then((res) => {
                        if (res.ok) {
                            setPulling((prev) => [prev[0], prev[1], prev[2], true])
                        }
                    })
            }

            pullPlayers4()
        }
    }, [pulling[2]])

    useEffect(() => {
        if (masterSchedule !== null) {
            setScheduleGenerated(true)
            setReadyToGenerate(true)
        }
    }, [masterSchedule])

    // stores and constantly updates content height as state
    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries && entries.length > 0) {
                const { height } = entries[0].contentRect
                setContentHeight(height)
            }
        })

        if (contentRef.current) {
            resizeObserver.observe(contentRef.current)
        }

        return () => {
            if (contentRef.current) {
                resizeObserver.unobserve(contentRef.current)
            }
        }
    }, [contentRef])

    const handlePopup = (popupStr: string) => {
        setPopup(popupStr)
    }

    const handleSubmit = async (playersLst: string[]) => {
        playersLst.forEach((element, index) => {
            playersLst[index] = formatName(element)
        })

        await fetch("/api/pullSchedules", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                league: "phillyfallcompetitive",
                playersLst: playersLst
            })
        })

        setScheduleGenerated(false)
        setReadyToGenerate(false)
        setErrorType("")

        await fetch("/api/generateSchedule", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({league: "phillyfallcompetitive", playersLst: playersLst})
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
                console.error(error)
            })
    }

    return (
        <div ref={contentRef}>
            {popup !== "How it Works" ? (<></>) : (<HowItWorks handlePopup={handlePopup} />)}
            {popup !== "How it's Built" ? (<></>) : (<HowItsBuilt handlePopup={handlePopup} />)}
            <div className={`${popup !== "" ? "blur-sm" : ""}`}>
                <div>
                    <Header handlePopup={handlePopup} popupActive={popup !== "" ? true : false} />
                </div>
                <div>
                    <InputNames league="2023 Philly Fall Competitive" handleSubmit={handleSubmit} scheduleGenerated={scheduleGenerated} readyToGenerate={readyToGenerate} errorType={errorType} />
                </div>
                <div>
                    <Schedule masterSchedule={masterSchedule} scheduleGenerated={scheduleGenerated} />
                </div>
                <div>
                    <Footer contentHeight={contentHeight} />
                </div>
            </div>
        </div>
    )
}