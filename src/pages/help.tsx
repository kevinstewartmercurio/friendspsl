import { useEffect } from "react"
import Link from "next/link"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { update } from "@/features/theme/themeSlice"
import { Footer } from "@/components/Footer"

import { toggleTheme } from "@/components/Header"

function Header() {
    const theme = useAppSelector(state => state.theme.value)
    const dispatch = useAppDispatch()

    useEffect(() => {
        toggleTheme(theme)
    }, [theme])

    return (
        <div className="w-full mb-8 px-6 md:px-12 flex flex-row">
            {/* back arrow */}
            <div className="text-primary-text w-12 md:w-1/4 flex flex-row justify-start items-center">
                <Link href="/">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                    </svg>
                </Link>
            </div>
            {/* logo */}
            <div className="w-5/6 md:w-1/2 text-2xl min-[375px]:text-3xl md:text-4xl font-medium py-4 flex justify-center items-center">
                <Link href="/">
                    <span className="text-primary-text">
                        F
                    </span>
                    <span className="text-secondary-text">
                        (riends)
                    </span>
                    <span className="text-primary-text">
                        PSL
                    </span>
                </Link>
            </div>
            {/* theme toggle */}
            <div className="text-primary-text w-12 md:w-1/4 flex flex-row justify-end items-center">
                <button className="h-full ml-8 pb-0.5 flex justify-center items-center" onClick={(e) => {
                    e.preventDefault()
                    dispatch(update(!theme))
                }}>
                    {theme ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-moon-fill" viewBox="0 0 16 16">
                            <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sun-fill" viewBox="0 0 16 16">
                            <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
                        </svg>
                    )}
                </button>
            </div>
        </div>
    )
}

export default function Help() {
    return (
        <>
            <Header />
            <div className="text-primary-text mb-6 px-4 md:px-6 lg:px-12 text-sm md:text-base lg:text-lg">
                <div className="text-secondary-text mb-1 text-lg md:text-xl lg:text-2xl">
                    How it Works
                </div>
                <div className="mb-3">
                    After providing a list of player names you can click 
                    "Generate Schedule" to see all upcoming events for those 
                    players.
                </div>
                <div className="mb-3">
                    The server stores all
                    available names from each team roster page and events from
                    each team schedule page in a databse and then uses that
                    information to generate schedules for specified players. To
                    minimize requests being sent to the PADA website, each
                    team's stored roster and schedule information will update
                    at most once per day.
                </div>
            </div>
            <div className="text-primary-text mb-6 px-4 md:px-6 lg:px-12 text-sm md:text-base lg:text-lg">
                <div className="text-secondary-text mb-1 text-lg md:text-xl lg:text-2xl">
                    How it's Built
                </div>
                <div className="mb-3">
                    This project was built using Next.js, Tailwind, TypeScript, 
                    and MongoDB and it's being hosted with Vercel. For those 
                    interested in the source code, the repository can be found on 
                    my&nbsp;
                    <Link href="https://github.com/kevinstewartmercurio/friendspsl" className="underline">
                        Github
                    </Link>
                    .
                </div>
            </div>
            <div className="text-primary-text mb-6 px-4 md:px-6 lg:px-12 text-sm md:text-base lg:text-lg">
                <div className="text-secondary-text mb-1 text-lg md:text-xl lg:text-2xl">
                    A Note on Privacy
                </div>
                <div className="mb-3">
                    The first iteration of this project provided access to 2023 
                    FPSL data using the draft spreadsheet that was posted on the
                    PADA Twitter account. In the spirit of protecting private 
                    information, all other leagues (current and future) will 
                    rely on team roster pages for player names.&nbsp;
                    <b>
                        This means that your PADA profile page must be public 
                        for your name to appear on FriendsPSL.
                    </b>
                </div>
                <div className="mb-3">
                    To change this setting go to your PADA account page, go to 
                    the "Preferences & Privacy" section, locate the "Who can 
                    see my profile page?" question, and select "Everyone".
                </div>
            </div>
            <div className="text-primary-text mb-6 px-4 md:px-6 lg:px-12 text-sm md:text-base lg:text-lg">
                <div className="text-secondary-text mb-1 text-lg md:text-xl lg:text-2xl">
                    Having Trouble with a Specific Name?
                </div>
                <div className="mb-3">
                    Please&nbsp;
                    <Link href="mailto:kevinstewartmercurio@gmail.com" className="underline">
                        contact me
                    </Link>
                    &nbsp;if you're unable to generate a schedule for a name
                    you're sure you're spelling correctly. All names are
                    formatted to account for capitalization errors, unnecessary
                    spaces, etc. Additionally some names need to be handled as
                    exceptions to the formatting rules. It's possible that this
                    process formatted a name incorrectly.
                </div>
            </div>
            <Footer />
        </>
    )
}