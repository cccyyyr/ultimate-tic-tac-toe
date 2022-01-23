import Head from 'next/head'
import Link from 'next/link'
import {useEffect, useState} from 'react'
import {useUser} from '../context/userContext'
import firebase from '../firebase/clientApp'
import {useRouter} from 'next/router'

export default function Home() {
    // Our custom hook to get context values
    const [player1, setPlayer1] = useState("Player 1");
    const [player2, setPlayer2] = useState("Player 2");
    const router = useRouter();
    return (
        <div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const db = firebase.database();
                    const gamesRef = db.ref("games");
                    const newGameRef = gamesRef.push();
                    newGameRef.set({
                        x_played: [""],
                        o_played: [""],
                        x_turn: true,
                        x_cells: [""],
                        o_cells: [""],
                        in_game: true,
                        all_enabled: true,
                        enabled: -1,
                    }).then(() => router.push(`/games/${newGameRef.key}`));
                }}>
                <input
                    name="player1"
                    value={player1}
                    onChange={(e) => setPlayer1(e.target.value)}
                />

                <input
                    name="player2"
                    value={player2}
                    onChange={(e) => setPlayer2(e.target.value)}
                />
                <button type="submit">Let's Play!</button>
            </form>
        </div>
    );
}
