export function Header(props: {handlePopup: (popupStr: string) => void}) {
    return (
        <>
            <div className="w-full mb-8 px-6 flex flex-row">
                <div className="w-1/2 text-4xl font-medium py-4 flex justify-start items-center">
                    <a href="/">
                        <span className="text-[#82eaff]">
                            Pada
                        </span>
                        <span className="text-[#ffcefb]">
                            Friend
                        </span>
                        <span className="text-[#82eaff]">
                            Viewer
                        </span>
                    </a>
                </div>
                <div className="text-gray-300 w-1/2 flex flex-row justify-end items-center">
                    <button className="border-transparent border-[1.5px] px-0.5 hover:border-b-gray-300" onClick={(e) => {
                        e.preventDefault()
                        props.handlePopup("How it works")
                    }}>
                        How it works
                    </button>
                    <button className="border-transparent border-[1.5px] ml-8 px-0.5 hover:border-b-gray-300" onClick={(e) => {
                        e.preventDefault()
                        props.handlePopup("How it's built")
                    }}>
                        How it's built
                    </button>
                </div>
            </div>
        </>
    )
}