import type {AppProps} from 'next/app'
import Head from "next/head"
import {Analytics} from "@vercel/analytics/react"
import {store, persistor} from '../redux/store'
import {Provider} from 'react-redux'
import {PersistGate} from "redux-persist/integration/react"

import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Head>
            <title>FriendsPSL</title>
            <link rel="icon" href="/smile.png" />
          </Head>
          <Component {...pageProps} />
        </PersistGate>
      </Provider>
      <Analytics />
    </>
  )
}
