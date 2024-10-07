import { useNavigate } from 'react-router-dom';
import GamePlay from "./GamePlay";
import { useActiveCourse } from '../User/useActiveCourse';
import { useFirebase } from '../useFirebase';
import { serverTimestamp as serverTimestampFS, doc, deleteDoc, addDoc, collection } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { set, ref as databaseRef } from 'firebase/database';

export default function SingleGame() {
    const { auth, firestore, database } = useFirebase();
    const activeUser = auth.currentUser;
    const { activeCourse } = useActiveCourse();
    const [gameInit, setGameInit] = useState(false);
    const [gameId, setGameId] = useState();
    const navigate = useNavigate();
    const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);

    const defaultStatuses = { online: true, coop: false, competition: false, matching_user_id: null, game_id: null };

    // Create a new game in firestore
    useEffect(() => {
        if (activeUser && activeCourse && !gameInit) {
            async function newGameInFS() {
                try {
                    const gameDataRef = await addDoc(collection(firestore, "game_data"), {
                        player1: {
                            uid: activeUser.uid,
                            name: activeUser.displayName,
                        },
                        game_mode: "single",
                        start_time: serverTimestampFS()
                    });
                    setGameId(gameDataRef.id);
                    setGameInit(true);
                    console.log("Game initilized.")
                } catch (error) {
                    console.error("Error initializing game.", error.message)
                }
            }
            newGameInFS();
        }
    }, [activeCourse, activeUser, database, firestore, gameInit]);

    async function initializeStatus() {
        const userStatusRef = databaseRef(database, `lobbies/${activeCourse.id}/${activeUser.uid}`);
        let newStatuses = { ...defaultStatuses, game_id: gameId };
        await set(userStatusRef, newStatuses);
    }
    initializeStatus();

    async function handleExit() {
        try {
            const userStatusRef = databaseRef(database, `lobbies/${activeCourse.id}/${activeUser.uid}`);
            await set(userStatusRef, defaultStatuses);
            const gameRef = doc(firestore, 'game_data', activeUser.uid);
            await deleteDoc(gameRef);
            navigate('/');
        } catch (err) {
            console.error("Error exiting game:", err);
        }
    }

    function openExitDialog() {
        setIsExitDialogOpen(true);
    }

    function closeExitDialog() {
        setIsExitDialogOpen(false);
    }

    function confirmExit() {
        closeExitDialog();
        handleExit();
    }


    if (gameInit) {
        console.log("Starting game.")
        return (
            <>
                <GamePlay courseId={activeCourse?.id} gameId={gameId} />
                <Button sx={{ mt: 2 }} variant="contained" color="warning" onClick={openExitDialog}>
                    Spiel verlassen
                </Button>
                <Dialog
                    open={isExitDialogOpen}
                    onClose={closeExitDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Spiel verlassen?"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Bist du sicher, dass du das Spiel verlassen möchtest?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button color='secondary' onClick={closeExitDialog}>Abbrechen</Button>
                        <Button color='warning' onClick={confirmExit} autoFocus>
                            Verlassen
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
}