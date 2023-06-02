export function HowItsBuilt(props: {handlePopup: (popupStr: string) => void}) {
    return (
        <>
            <div className="w-full h-full absolute z-10 flex justify-center items-center">
                <div className="bg-gray-300 border-gray-500 border-[1.5px] rounded-lg w-3/5 px-12 py-8">
                    <div className="flex flex-row">
                        <div className="w-4/5 h-full text-3xl">
                            How it's Built
                        </div>
                        <div className="w-1/5 h-full flex justify-end items-center">
                            <button className="outline-none hover:cursor-pointer" onClick={(e) => {
                                e.preventDefault
                                props.handlePopup("")
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="mt-6 pr-8">
                        This project was built using Next.js, Tailwind, TypeScript, and MongoDB and it's being hosted with Vercel.
                    </div>
                    <div className="mt-6 pr-8">
                        After you provide your list of names, the server checks that list against a spreadsheet containing all 32 FPSL rosters to determine what team each player is on. With that information, all relevant team schedules are referenced to compile one master schedule for all requested players. Team schedules are pulled daily from the PADA website and stored in a database to minimize the potential number of requests being sent to the PADA website.
                    </div>
                </div>
            </div>
        </>
    )
}