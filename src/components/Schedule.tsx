import { Event } from "@/pages"

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function parseDate(inStr: string): string {
    const year = inStr.slice(0, 4)
    const month = months[parseInt(inStr.slice(5,7)) - 1]
    let day = inStr.slice(8, 10)
    
    if (day[0] === "0") {
        day = day.slice(-1)
    }

    return `${month} ${day}, ${year}`
}

export function Schedule(props: {masterSchedule: [Date, Event[]][], scheduleGenerated: boolean}) {
    if (!props.scheduleGenerated) {
        return (
            <></>
        )
    }

    return (
        <>
            <div className="w-full mt-16 flex justify-center">
                <table className="text-primary-text w-5/6 text-sm md:text-base font-normal">
                    <thead className="text-left">
                        <tr>
                            <th className="w-1/5 sm:w-1/4 px-3">
                                Date
                            </th>
                            <th className="pr-3">
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2">
                                        Player(s)
                                    </div>
                                    <div className="w-1/2 flex flex-row">
                                        <div className="w-4/5">
                                            Location
                                        </div>
                                        <div className="hidden md:block">
                                            Field
                                        </div>
                                    </div>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.masterSchedule.map((outerItem: [Date, Event[]], outerIndex: number) => {
                            const dateTxt = parseDate(outerItem[0] as unknown as string)

                            const conditionalBackground = `${outerIndex % 2 === 0 ? "bg-schedule-accent" : "bg-background"}`
                            const conditionalRoundedLeft = `${outerIndex % 2 === 0 ? "rounded-l-lg" : ""} ${outerIndex === props.masterSchedule.length - 1 ? "rounded-l-lg" : ""}`
                            const conditionalRoundedRight = `${outerIndex % 2 === 0 ? "rounded-r-lg" : ""} ${outerIndex === props.masterSchedule.length - 1 ? "rounded-r-lg" : ""}`

                            return (
                                <tr key={outerIndex} className={`${conditionalBackground}`}>
                                    <td className={`pl-3 py-3 ${conditionalRoundedLeft}`}>
                                        {dateTxt}
                                    </td>
                                    <td className={`pr-3 py-3 ${conditionalRoundedRight}`}>
                                        <div className="flex flex-col">
                                            {outerItem[1].map((innerItem: Event, innerIndex: number) => {
                                                const conditionalPLDWidth = `${innerItem.location === "PLD (Parking Lot Duty)" ? "w-full" : "w-4/5"}`

                                                return (
                                                    <div key={innerIndex} className="flex flex-row">
                                                        <div className="w-1/2">
                                                            {innerItem.player}
                                                        </div>
                                                        <div className="w-1/2 flex flex-row">
                                                            <div className={`${conditionalPLDWidth}`}>
                                                                {innerItem.location}
                                                            </div>
                                                            {innerItem.location === "PLD (Parking Lot Duty)" ? <></> : (
                                                                <div className="w-1/5">
                                                                    {innerItem.field}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </>
    )
}