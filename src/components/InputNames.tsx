import { useState, useEffect, ChangeEvent } from "react"
import Link from "next/link"

export function InputNames(props: {league: string, handleSubmit: (playersLst: string[]) => void, scheduleGenerated: boolean, readyToGenerate: boolean, errorType: string}) {
    const [playerCount, setPlayerCount] = useState<number>(1)
    const [playersLst, setPlayersLst] = useState<string[]>([""])
    const [submitText, setSubmitText] = useState<string>("Generate Schedule")

    useEffect(() => {
        if (props.readyToGenerate) {
            setSubmitText("Generate Schedule")
        }
    }, [props.readyToGenerate])

    const handlePlayerChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        setPlayersLst((prevLst) => {
            const newLst = prevLst.map((item, idx) => {
                if (idx === index) {
                    return e.target.value
                } else {
                    return item
                }
            })

            return newLst
        })
    }

    const incrementPlayerCount = () => {
      setPlayerCount((prev) => prev + 1)
      setPlayersLst((prev) => [...prev, ""])
    }

    const decrementPlayerCount = (index: number) => {
      setPlayerCount((prev) => prev - 1)
      setPlayersLst((prev) => prev.filter((_, idx) => idx !== (index + 1)))
    }

    return (
        <>
            <div className={`w-full py-6 text-sm md:text-base flex justify-center ${props.scheduleGenerated ? "" : "min-h-[calc(100vh-104px-104px)] items-center"}`}>
                <div className="w-3/5 max-w-[480px] min-w-[300px]">
                    <div className="text-primary-text mb-4 text-base md:text-lg text-center">
                        Looking at {props.league} friends!
                    </div>
                    {props.errorType === "Unrecognized name" ? (
                        <div className={`w-full ${playerCount > 1 ? "pr-[50px]" : ""}`}>
                            <div className="bg-input-bg border-error-border border-[3px] rounded-lg w-full mb-6 px-4 py-2">
                                <span className="text-error-text">
                                    Error:&nbsp;
                                </span>
                                <span>
                                    At least one of the provided names was not found in the {props.league} data.
                                </span>
                                <div className="mt-2">
                                    Please check out the&nbsp;
                                    <Link href="/help" className="underline">
                                        help
                                    </Link>
                                    &nbsp;page for troubleshooting information.
                                </div>
                            </div>
                        </div>
                    ) : (<></>)}
                    {props.errorType === "Server error" ? (
                        <div className={`w-full ${playerCount > 1 ? "pr-[50px]" : ""}`}>
                            <div className="bg-input-bg border-error-border border-[3px] rounded-lg w-full mb-6 px-4 py-2">
                                <span className="text-error-text">
                                    Error:&nbsp;
                                </span>
                                The server could not complete your request. Please try again later.
                            </div>
                        </div>
                    ) : (<></>)}
                    <form className="w-full" onSubmit={(e) => {
                        e.preventDefault()

                        if (props.readyToGenerate) {
                            const strippedPlayersLst = playersLst.filter((player) => player !== "")

                            if (strippedPlayersLst.length > 0) {
                                setSubmitText("One moment...")
                                props.handleSubmit(strippedPlayersLst)
                            }
                        }
                    }}>
                        <div className="flex flex-row">
                            <div className={`input-container w-full mb-2 relative flex flex-col ${playerCount > 1 ? "mr-[50px]" : ""}`}>
                                <input id="player0" type="text" value={playersLst[0]} onChange={(e) => {handlePlayerChange(e, 0)}}
                                    className="bg-input-bg border-input-bg border-[1.5px] rounded-lg w-full h-12 px-4 pt-2 outline-none"/>
                                <label htmlFor="player0" className={playersLst[0] && "filled"}>
                                    Player Name
                                </label>
                            </div>
                        </div>
                        {Array.from({length: playerCount - 1}, (_, index) => (
                            <div key={index} className="flex flex-row">
                                <div className="input-container w-full mb-2 relative flex flex-col">
                                    <input id={`player${index + 1}`} type="text" value={playersLst[index + 1]} onChange={(e) => {handlePlayerChange(e, index + 1)}}
                                        className="bg-input-bg border-input-bg border-[1.5px] rounded-lg w-full h-12 px-4 pt-2 outline-none"/>
                                    <label htmlFor={`player${index + 1}`} className={playersLst[index + 1] && "filled"}>
                                        Player Name
                                    </label>
                                </div>
                                <button className="text-remove-player-text bg-remove-player-bg border-remove-player-bg border-[1.5px] rounded-lg w-12 ml-2 mb-2 flex justify-center items-center outline-none hover:text-remove-player-text-hover hover:bg-remove-player-bg-hover duration-300" onClick={(e) => {
                                  e.preventDefault()
                                  decrementPlayerCount(index)
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                                    </svg>
                                </button>
                            </div>
                        ))}
                        <div className={`w-full mt-4 flex flex-row ${playerCount > 1 ? "pr-[50px]" : ""}`}>
                            <button className="text-add-player-text bg-add-player-bg border-add-player-bg border-[1.5px] rounded-lg w-1/3 h-12 flex justify-center items-center outline-none hover:text-add-player-text-hover hover:bg-add-player-bg-hover duration-300" onClick={(e) => {
                                e.preventDefault()
                                incrementPlayerCount()
                            }}>
                                Add Player
                            </button>
                            <input type="submit" value={submitText} className="text-generate-schedule-text bg-generate-schedule-bg border-generate-schedule-bg border-[1.5px] rounded-lg w-2/3 h-12 ml-2 flex justify-center items-center outline-none hover:cursor-pointer hover:bg-generate-schedule-bg-hover duration-300" />
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}