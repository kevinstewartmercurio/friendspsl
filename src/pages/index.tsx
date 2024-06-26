import { useState, useEffect, useRef } from "react"

import { Header } from "@/components/Header"
import { InputNames } from "@/components/InputNames"
import { Schedule } from "@/components/Schedule"
import { Footer } from "@/components/Footer"

export type Event = {
    player: string,
    date?: Date,
    location: string,
    field?: string
}

const exceptions: {[key: string]: string} = {
    "natalie felix didonato": "Natalie Felix DiDonato",
    "geoff dimasi": "Geoff DiMasi",
    "cj finnigan": "CJ Finnigan",
    "elena lopez": "Elena López"
}

export const formatName = (name: string): string => {
    let retName = name.toLowerCase()

    // check if name is in the list of name formatting exceptions
    if (exceptions[retName]) {
        return exceptions[retName]
    }

    // replace multiple space characters in a row with a single space character
    retName = retName.replace(/ +/g, " ")

    // remove periods and commas
    retName = retName.replace(/[.,]/g, "")

    // capitalize the first letter
    retName = `${retName[0].toUpperCase()}${retName.substring(1)}`

    // capitalize letters after spaces, hyphens, apostrophes, and "Mc"
    let tempChar: string
    for (let i = 1; i < retName.length; i++) {
        if (retName[i - 1] === " " || retName[i - 1] === "-" || retName[i - 1] === "'" || retName.substring(i - 2, i) === "Mc") {
            tempChar = retName.charAt(i).toUpperCase()
            retName = `${retName.substring(0, i)}${tempChar}${retName.substring(i + 1)}`.trim()
        }
    }

    return retName
}

export default function Home() {
    const contentRef = useRef<HTMLDivElement>(null)
    const [contentHeight, setContentHeight] = useState(0)

    const [masterSchedule, setMasterSchedule] = useState<[Date, Event[]][] | null>(null)
    const [scheduleGenerated, setScheduleGenerated] = useState<boolean>(false)
    const [readyToGenerate, setReadyToGenerate] = useState<boolean>(true)
    const [errorType, setErrorType] = useState<string>("")

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

    const handleSubmit = async (playersLst: string[]) => {
        playersLst.forEach((element, index) => {
            playersLst[index] = formatName(element)
        })

        await fetch("/api/pullSchedules", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                playersLst: playersLst
            })
        })

        setScheduleGenerated(false)
        setReadyToGenerate(false)
        setErrorType("")

        await fetch("/api/generateSchedule", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({playersLst: playersLst})
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
                setScheduleGenerated(true)
                setReadyToGenerate(true)
                setErrorType("")
            })
            .catch((error) => {
                setReadyToGenerate(true)
                console.error(error)
            })
    }

    return (
        <div ref={contentRef}>
            <div>
                <div>
                    <Header />
                </div>
                <div>
                    <InputNames league="2024 FPSL" handleSubmit={handleSubmit} scheduleGenerated={scheduleGenerated} readyToGenerate={readyToGenerate} errorType={errorType} />
                </div>
                {/* <div className="w-full min-h-[calc(100vh-104px-104px)] px-8 flex flex-col justify-center items-center">
                    <div className="text-primary-text mb-4 text-base md:text-lg text-center">
                        Get ready for FPSL 2024!
                    </div>
                    <div className="text-primary-text mb-4 text-base md:text-lg text-center">
                        Visit <Link href="https://pada.org/e/fairmount-park-summer-league-2024" className="text-secondary-text border-transparent border-[1.5px] hover:border-b-secondary-text">https://pada.org</Link> to learn more.
                    </div>
                </div> */}
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