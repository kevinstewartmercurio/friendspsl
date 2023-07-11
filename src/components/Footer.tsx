import {useState, useEffect} from "react"

export function Footer(props: {contentHeight: number}) {
    const [screenHeight, setScreenHeight] = useState(window.innerHeight)

    useEffect(() => {
        const handleResize = () => {
            setScreenHeight (window.innerHeight)
        }

        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    return (
        <>
            <div className={`text-primary-text w-full mt-16 px-4 pb-3 md:pb-4 text-center text-sm md:text-base ${props.contentHeight < screenHeight ? "fixed bottom-0" : ""}`}>
                Designed and built by&nbsp; 
                <a href="https://www.kevinstewartmercurio.com/" target="_blank" rel="noreferrer" className="border-transparent border-[1.5px] hover:border-b-primary-text">
                    Kevin Stewart-Mercurio
                </a>
                &nbsp;
                <span>
                    &#x2022; June 2023
                </span>
            </div>
        </>
    )
}