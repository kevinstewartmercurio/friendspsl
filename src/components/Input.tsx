import { useState, useEffect, ChangeEvent } from "react"

export function Input(props: {handleSubmit: (playersLst: string[]) => void, scheduleGenerated: boolean, readyToGenerate: boolean, errorType: string}) {
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
            {/* header height: 104px, footer height: 104px */}
            <div className={`w-full py-6 text-sm md:text-base flex justify-center ${props.scheduleGenerated ? "" : "min-h-[calc(100vh-104px-104px)] items-center"}`}>
                <div className="w-3/5 max-w-[480px] min-w-[300px]">
                    {props.errorType === "Unrecognized name" ? (
                        <div className={`w-full ${playerCount > 1 ? "pr-[50px]" : ""}`}>
                            <div className="bg-gray-300 border-red-700 border-[3px] rounded-lg w-full mb-6 px-4 py-2">
                                <span className="text-red-700">
                                    Error:&nbsp;
                                </span>
                                At least one of the provided names was not found in the 2023 FPSL Draft data. If you are unable to generate a schedule for a name you believe is spelled correctly please&nbsp;
                                <a href="mailto:kevinstewartmercurio@gmail.com" className="underline">
                                    contact me
                                </a>
                                .
                            </div>
                        </div>
                    ) : (<></>)}
                    {props.errorType === "Server error" ? (
                        <div className={`w-full ${playerCount > 1 ? "pr-[50px]" : ""}`}>
                            <div className="bg-gray-300 border-red-700 border-[3px] rounded-lg w-full mb-6 px-4 py-2">
                                <span className="text-red-700">
                                    Error:&nbsp;
                                </span>
                                The server could not complete your request. Please try again later.
                            </div>
                        </div>
                    ) : (<></>)}
                    <form className="w-full" onSubmit={(e) => {
                        e.preventDefault()

                        if (props.readyToGenerate) {
                            // check if playersLst has any nonempty strings
                            let playersLstEmpty = true
                            for (let player of playersLst) {
                                if (player !== "") {
                                    playersLstEmpty = false
                                    break
                                }
                            }

                            if (!playersLstEmpty) {
                                setSubmitText("One moment please...")
                                props.handleSubmit(playersLst)
                            }
                        }
                    }}>
                        <div className="flex flex-row">
                            <div className={`input-container w-full mb-2 relative flex flex-col ${playerCount > 1 ? "mr-[50px]" : ""}`}>
                                <input id="player0" type="text" value={playersLst[0]} onChange={(e) => {handlePlayerChange(e, 0)}}
                                    className="bg-gray-300 border-gray-300 border-[1.5px] rounded-lg w-full h-12 px-4 pt-2 outline-none"/>
                                <label htmlFor="player0" className={playersLst[0] && "filled"}>
                                    Player Name
                                </label>
                            </div>
                        </div>
                        {Array.from({length: playerCount - 1}, (_, index) => (
                            <div key={index} className="flex flex-row">
                                <div className="input-container w-full mb-2 relative flex flex-col">
                                    <input id={`player${index + 1}`} type="text" value={playersLst[index + 1]} onChange={(e) => {handlePlayerChange(e, index + 1)}}
                                        className="bg-gray-300 border-gray-300 border-[1.5px] rounded-lg w-full h-12 px-4 pt-2 outline-none"/>
                                    <label htmlFor={`player${index + 1}`} className={playersLst[index + 1] && "filled"}>
                                        Player Name
                                    </label>
                                </div>
                                <button className="text-[#82eaff] bg-[#014961] border-[#014961] border-[1.5px] rounded-lg w-12 ml-2 mb-2 flex justify-center items-center outline-none hover:text-[#014961] hover:bg-[#82eaff] duration-300" onClick={(e) => {
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
                            <button className="text-[#82eaff] bg-[#014961] border-[#014961] border-[1.5px] rounded-lg w-1/3 h-12 flex justify-center items-center outline-none hover:text-[#014961] hover:bg-[#82eaff] duration-300" onClick={(e) => {
                                e.preventDefault()
                                incrementPlayerCount()
                            }}>
                                Add Player
                            </button>
                            <input type="submit" value={submitText} className="text-gray-300 bg-gray-800 border-gray-800 border-[1.5px] rounded-lg w-2/3 h-12 ml-2 flex justify-center items-center outline-none hover:cursor-pointer hover:text-gray-800 hover:bg-[#ffcefb] duration-300" />
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}