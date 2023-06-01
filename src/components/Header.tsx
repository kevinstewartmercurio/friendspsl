import Link from "next/link"

export function Header(props: {handlePopup: (popupStr: string) => void}) {
    return (
        <>
            <div className="w-full mb-8 px-6 flex flex-row">
                <div className="w-full md:w-1/2 text-3xl md:text-4xl font-medium py-4 flex justify-center md:justify-start items-center">
                    <Link href="/">
                        <span className="text-[#82eaff]">
                            F
                        </span>
                        <span className="text-[#ffcefb]">
                            (riends)
                        </span>
                        <span className="text-[#82eaff]">
                            PSL
                        </span>
                    </Link>
                </div>
                <div className="text-gray-300 w-1/2 hidden md:flex flex-row justify-end items-center">
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