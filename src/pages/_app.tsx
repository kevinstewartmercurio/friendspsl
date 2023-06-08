import type { AppProps } from 'next/app'
import Head from "next/head"
import { Analytics } from "@vercel/analytics/react"

import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>FriendsPSL</title>
        <link rel="icon" href="/smile.png" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1446470018172212" crossOrigin="anonymous"></script>
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
