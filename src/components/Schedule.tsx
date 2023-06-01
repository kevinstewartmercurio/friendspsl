import { Event } from "@/pages"

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export function Schedule(props: {masterSchedule: [Date, Event[]][], scheduleGenerated: boolean}) {
    if (!props.scheduleGenerated) {
        return (
            <></>
        )
    }

    return (
        <>
            <div className="w-full mt-16 flex justify-center">
                <table className="text-gray-300 w-5/6 font-normal">
                    <thead className="text-left">
                        <tr>
                            <th className="pl-3">
                                Date
                            </th>
                            <th>
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2">
                                        Player(s)
                                    </div>
                                    <div className="w-2/5">
                                        Location
                                    </div>
                                    <div className="w-[1/10]">
                                        Field
                                    </div>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.masterSchedule.map((outerItem: [Date, Event[]], outerIndex: number) => {
                            const tempDate = new Date(outerItem[0])
                            const dateTxt = `${months[tempDate.getMonth()]} ${tempDate.getDate()}, ${tempDate.getFullYear()}`

                            const conditionalBackground = `${outerIndex % 2 === 0 ? "bg-[#014961]" : "bg-[#003950]"}`
                            const conditionalRoundedLeft = `${outerIndex % 2 === 0 ? "rounded-l-lg" : ""} ${outerIndex === props.masterSchedule.length - 1 ? "rounded-l-lg" : ""}`
                            const conditionalRoundedRight = `${outerIndex % 2 === 0 ? "rounded-r-lg" : ""} ${outerIndex === props.masterSchedule.length - 1 ? "rounded-r-lg" : ""}`

                            return (
                                <tr key={outerIndex} className={`${conditionalBackground}`}>
                                    <td className={`w-1/4 pl-3 py-3 ${conditionalRoundedLeft}`}>
                                        {dateTxt}
                                    </td>
                                    <td className={`py-3 ${conditionalRoundedRight}`}>
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