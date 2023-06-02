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
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
