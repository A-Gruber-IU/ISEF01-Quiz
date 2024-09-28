import GamePlay from "./GamePlay";
import { useActiveCourse } from '../User/useActiveCourse';
import { useFirebase } from '../useFirebase';
import { setDoc, serverTimestamp as serverTimestampFS, doc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function SingleGame() {
    const { auth, firestore } = useFirebase();
    const activeUser = auth.currentUser;
    const { activeCourse } = useActiveCourse();
    const [gameInit, setGameInit] = useState(false);

    // Create a new game in firestore
    useEffect(() => {
        if (activeUser && activeCourse) {
            async function newGameInFS() {
                try {
                    const gameDataRef = doc(firestore, `game_data`, activeUser.uid);
                    await setDoc(gameDataRef, {
                        player1: {
                            uid: activeUser.uid,
                            name: activeUser.displayName,
                        },
                        game_mode: "single",
                        start_time: serverTimestampFS()
                    });
                    setGameInit(true);
                    console.log("Game initilized.")
                } catch (error) {
                    console.error("Error initializing game.", error.message)
                }
            }
            newGameInFS();
        }
    }, [activeCourse, activeUser, firestore]);

    if (gameInit) {
        console.log("Starting game.")
        return (
            <GamePlay courseId={activeCourse?.id} gameId={activeUser?.uid} />
        );
    }
}