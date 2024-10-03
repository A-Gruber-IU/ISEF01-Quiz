import { useNavigate } from 'react-router-dom';
import GamePlay from "./GamePlay";
import { useActiveCourse } from '../User/useActiveCourse';
import { useFirebase } from '../useFirebase';
import { setDoc, serverTimestamp as serverTimestampFS, doc, deleteDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { set, ref as databaseRef } from 'firebase/database';

export default function SingleGame() {
    const { auth, firestore, database } = useFirebase();
    const activeUser = auth.currentUser;
    const { activeCourse } = useActiveCourse();
    const [gameInit, setGameInit] = useState(false);
    const navigate = useNavigate();
    const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);

    const defaultStatuses = { online: true, coop: false, competition: false, matching_user_id: null, game_id: null };

    async function initializeStatus() {
        const userStatusRef = databaseRef(database, `lobbies/${activeCourse.id}/${activeUser.uid}`);
        let newStatuses = { ...defaultStatuses, game_id: activeUser.uid };
        await set(userStatusRef, newStatuses);
    }
    initializeStatus();

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
    }, [activeCourse, activeUser, database, firestore]);


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
                <GamePlay courseId={activeCourse?.id} gameId={activeUser?.uid} />
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