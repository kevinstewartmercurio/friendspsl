import { useState, useEffect, ChangeEvent, MouseEvent } from "react"

export default function Home() {
    const [playerCount, setPlayerCount] = useState<number>(1)
    const [playersLst, setPlayersLst] = useState<string[]>([""])

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

    const handleSubmit = async (e: { preventDefault: () => void }) => {
      e.preventDefault()

      const result = await fetch("/api/generateSchedule", {
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
            console.log(data)
        })
    }
    
    return (
        <>
            <div className="w-full px-10 py-6 flex justify-center">
                <div>
                    <form onSubmit={(e) => handleSubmit(e)}>
                        <div className="flex flex-row">
                            <div className="input-container w-[440px] mb-2 relative flex flex-col">
                                <input id="player0" type="text" value={playersLst[0]} onChange={(e) => {handlePlayerChange(e, 0)}}
                                    className="bg-gray-300 border-gray-300 border-[1.5px] rounded-lg w-full h-12 px-4 pt-2 outline-none"/>
                                <label htmlFor="player0" className={playersLst[0] && "filled"}>
                                    Player Name
                                </label>
                            </div>
                        </div>
                        {Array.from({length: playerCount - 1}, (_, index) => (
                            <div key={index} className="flex flex-row">
                                <div className="input-container w-[440px] mb-2 relative flex flex-col">
                                    <input id={`player${index + 1}`} type="text" value={playersLst[index + 1]} onChange={(e) => {handlePlayerChange(e, index + 1)}}
                                        className="bg-gray-300 border-gray-300 border-[1.5px] rounded-lg w-full h-12 px-4 pt-2 outline-none"/>
                                    <label htmlFor={`player${index + 1}`} className={playersLst[index + 1] && "filled"}>
                                        Player Name
                                    </label>
                                </div>
                                <button className="text-gray-200 bg-[#1c5c63] border-[#1c5c63] border-[1.5px] rounded-lg w-12 ml-2 mb-2 flex justify-center items-center outline-none" onClick={(e) => {
                                  e.preventDefault()
                                  decrementPlayerCount(index)
                                }}> 
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                                    </svg>
                                </button>
                            </div>
                        ))}
                        <div className="w-[440px] mt-4 flex flex-row">
                            <button className="text-gray-200 bg-[#1c5c63] border-[#1c5c63] border-[1.5px] rounded-lg w-1/3 h-12 flex justify-center items-center outline-none" onClick={(e) => {
                              e.preventDefault()
                              incrementPlayerCount()
                            }}>
                                Add Player
                            </button>
                            <input type="submit" value="Generate Schedule" className="text-gray-200 bg-gray-800 border-gray-800 border-[1.5px] rounded-lg w-2/3 h-12 ml-2 flex justify-center items-center outline-none hover:cursor-pointer" />
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}