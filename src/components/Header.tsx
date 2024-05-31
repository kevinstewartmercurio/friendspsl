import { useState, useEffect } from "react"
import Link from "next/link"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { update } from "@/features/theme/themeSlice"

export const toggleTheme = (theme: boolean) => {
    const r = document.querySelector(":root") as HTMLElement

    if (theme) {
        // default light colors
        r.style.setProperty("--background", "#e4e4d4")
        r.style.setProperty("--input-bg", "#efefef")
        r.style.setProperty("--primary-text", "#555a56")
        r.style.setProperty("--secondary-text", "#8a9b69")
        r.style.setProperty("--menu-bg", "#f2f2e0")
        r.style.setProperty("--add-player-text", "#555a56")
        r.style.setProperty("--add-player-text-hover", "#e4e4d4")
        r.style.setProperty("--add-player-bg", "#cbd0bf")
        r.style.setProperty("--add-player-bg-hover", "#555a56")
        r.style.setProperty("--generate-schedule-text", "#e4e4d4")
        r.style.setProperty("--generate-schedule-bg", "#6b886b")
        r.style.setProperty("--generate-schedule-bg-hover", "#555a56")
        r.style.setProperty("--remove-player-text", "#555a56")
        r.style.setProperty("--remove-player-text-hover", "#e4e4d4")
        r.style.setProperty("--remove-player-bg", "#cbd0bf")
        r.style.setProperty("--remove-player-bg-hover", "#555a56")
        r.style.setProperty("--error-border", "#e30000")
        r.style.setProperty("--schedule-accent", "#d5d5c5")
    } else {
        // dark colors
        r.style.setProperty("--background", "#1c1e26")
        r.style.setProperty("--input-bg", "#dddddd")
        r.style.setProperty("--primary-text", "#bbb")
        r.style.setProperty("--secondary-text", "#db886f")
        r.style.setProperty("--menu-bg", "#262933")
        r.style.setProperty("--add-player-text", "#bbb")
        r.style.setProperty("--add-player-text-hover", "#1c1e26")
        r.style.setProperty("--add-player-bg", "#17181f")
        r.style.setProperty("--add-player-bg-hover", "#c4a88a")
        r.style.setProperty("--generate-schedule-text", "#1c1e26")
        r.style.setProperty("--generate-schedule-bg", "#7c7c7c")
        r.style.setProperty("--generate-schedule-bg-hover", "#c4a88a")
        r.style.setProperty("--remove-player-text", "#bbb")
        r.style.setProperty("--remove-player-text-hover", "#1c1e26")
        r.style.setProperty("--remove-player-bg", "#17181f")
        r.style.setProperty("--remove-player-bg-hover", "#c4a88a")
        r.style.setProperty("--error-border", "#bd0000")
        r.style.setProperty("--schedule-accent", "#222531")
    }
}

export function Header() {
    const theme = useAppSelector(state => state.theme.value)
    const dispatch = useAppDispatch()

    useEffect(() => {
        toggleTheme(theme)
    }, [theme])

    return (
        <>
            <div className="w-full mb-8 px-6 md:px-12 flex flex-row">
                {/* hamburger */}
                <div className="w-1/12 md:w-1/4"></div>
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
                {/* help and theme toggle */}
                <div className="text-primary-text w-1/12 md:w-1/4 flex flex-row justify-end items-center">
                    <Link href="/help" className="ml-10 px-0.5 md:py-1.5 hidden sm:block">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-question-lg" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M4.475 5.458c-.284 0-.514-.237-.47-.517C4.28 3.24 5.576 2 7.825 2c2.25 0 3.767 1.36 3.767 3.215 0 1.344-.665 2.288-1.79 2.973-1.1.659-1.414 1.118-1.414 2.01v.03a.5.5 0 0 1-.5.5h-.77a.5.5 0 0 1-.5-.495l-.003-.2c-.043-1.221.477-2.001 1.645-2.712 1.03-.632 1.397-1.135 1.397-2.028 0-.979-.758-1.698-1.926-1.698-1.009 0-1.71.529-1.938 1.402-.066.254-.278.461-.54.461h-.777ZM7.496 14c.622 0 1.095-.474 1.095-1.09 0-.618-.473-1.092-1.095-1.092-.606 0-1.087.474-1.087 1.091S6.89 14 7.496 14Z"/>
                        </svg>
                    </Link>
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
        </>
    )
}