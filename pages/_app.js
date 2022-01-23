import UserProvider from '../context/userContext'
import "../css/game.css"
import {useEffect} from "react";
import firebase from '../firebase/clientApp'
// Custom App to wrap it with context provider
export default function App({Component, pageProps}) {
    return (
        <Component {...pageProps} />
        // <UserProvider>
        //     <Component {...pageProps} />
        // </UserProvider>
    )
}
