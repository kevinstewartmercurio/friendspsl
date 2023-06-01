export function HowItWorks(props: {handlePopup: (popupStr: string) => void}) {
    return (
        <>
            <div className="w-full h-full absolute z-10 flex justify-center items-center">
                <div className="bg-gray-300 border-gray-500 border-[1.5px] rounded-lg w-3/5 px-12 py-8">
                    <div className="flex flex-row">
                        <div className="w-4/5 h-full text-3xl">
                            How it Works
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
                        After providing a list of player names you can click "Generate Schedule" to see all upcoming events for those players.
                    </div>
                    <div className="mt-4 pr-8">
                        Note that the time it takes to generate a schedule increases with the number of player names provided. For more information on why this happens see the&nbsp;
                        <button className="underline" onClick={(e) => {
                            e.preventDefault()
                            props.handlePopup("How it's Built")
                        }}>
                            How it's Built
                        </button>
                        &nbsp;tab.
                    </div>
                    <div className="mt-4 pr-8">
                        Additionally, all names are checked against a slightly modified version of the 2023 FPSL Draft data (altered to remove extra spaces, capitalize names, etc.). If you are unable to generate a schedule for a name you believe is spelled correctly please&nbsp; 
                        <a href="mailto:kevinstewartmercurio@gmail.com" className="underline">
                            contact me
                        </a>
                        .
                    </div>
                </div>
            </div>
        </>
    )
}