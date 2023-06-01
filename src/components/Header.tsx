export function Header(props: {handlePopup: (popupStr: string) => void}) {
    return (
        <>
            <div className="w-full mb-8 px-6 flex flex-row">
                <div className="w-1/2 text-4xl font-medium py-4 flex justify-start items-center">
                    <a href="/">
                        <span className="text-[#82eaff]">
                            F
                        </span>
                        <span className="text-[#ffcefb]">
                            (riends)
                        </span>
                        <span className="text-[#82eaff]">
                            PSL
                        </span>
                    </a>
                </div>
                <div className="text-gray-300 w-1/2 flex flex-row justify-end items-center">
                    <button className="border-transparent border-[1.5px] px-0.5 hover:border-b-gray-300" onClick={(e) => {
                        e.preventDefault()
                        props.handlePopup("How it Works")
                    }}>
                        How it Works
                    </button>
                    <button className="border-transparent border-[1.5px] ml-10 px-0.5 hover:border-b-gray-300" onClick={(e) => {
                        e.preventDefault()
                        props.handlePopup("How it's Built")
                    }}>
                        How it's Built
                    </button>
                </div>
            </div>
        </>
    )
}