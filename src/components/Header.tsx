import { useState } from "react"
import Link from "next/link"

import { slide as Menu } from "react-burger-menu"

const menuLinks2023 = [
    {name: "FPSL", href: "/"},
    {name: "UHLe", href: "/uhle"},
    {name: "PICL", href: "/picl"},
    {name: "CCM", href: "/ccm"},
    {name: "Delaware Open", href: "/delaware-open"},
    {name: "Rocky", href: "/rocky"},
    {name: "Delaware Mixed", href: "/delaware-mixed"},
    {name: "South Jersey Mixed", href: "/south-jersey-mixed"}
]

export function Header(props: {handlePopup: (popupStr: string) => void, popupActive: boolean}) {
    const [openMenu, setOpenMenu] = useState<boolean>(false)

    return (
        <>
            <div className={`${props.popupActive ? "hidden" : ""}`}>
                <Menu className="bg-gray-300 px-6 py-16" isOpen={openMenu} onOpen={undefined} onClose={() => setOpenMenu(false)} width={236} customCrossIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                    </svg>
                }>
                    <div className="w-max border-b-black border-transparent border-2 mb-4 text-xl">
                        2023
                    </div>
                    {menuLinks2023.map((link, index) => {
                        return (
                            <Link key={index} id={link.name.toLowerCase()} className="menu-item my-3 pl-4 text-xl" href={link.href}>
                                {link.name}
                            </Link>
                        )
                    })}
                </Menu>
            </div>

            <div className="w-full mb-8 px-12 flex flex-row">
                {/* hamburger */}
                <div className="w-1/4 hidden md:flex items-center">
                    <button className="text-white" onClick={() => setOpenMenu(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                        </svg>
                    </button>
                </div>
                {/* logo */}
                <div className="w-full md:w-1/2 text-3xl md:text-4xl font-medium py-4 flex justify-center items-center">
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
                {/* popup buttons */}
                <div className="text-gray-300 w-1/4 hidden md:flex flex-row justify-end items-center">
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