import { useNavigate } from 'react-router-dom';
import GamePlay from "./GamePlay";
import { useActiveCourse } from '../User/useActiveCourse';
import { useUserStatuses, defaultStatuses } from '../User/useUserStatuses';
import { useFirebase } from '../useFirebase';
import { setDoc, serverTimestamp as serverTimestampFS, doc, deleteDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

export default function SingleGame() {
    const { auth, firestore } = useFirebase();
    const activeUser = auth.currentUser;
    const { activeCourse } = useActiveCourse();
    const [gameInit, setGameInit] = useState(false);
    const navigate = useNavigate();
    const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
    const { handleStatusChange } = useUserStatuses();

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

            async function updateStatuses() {
                let newStatuses = { ...defaultStatuses, game_id: activeUser.uid };
                await handleStatusChange(newStatuses);
            }
            newGameInFS();
            updateStatuses();
        }
    }, [activeCourse, activeUser, firestore, handleStatusChange]);


    async function handleExit() {
        try {
            await handleStatusChange(defaultStatuses);
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
                <Button sx={{ mt: 2 }} variant="contained" color="secondary" onClick={openExitDialog}>
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
                            Bist du sicher, dass du das Spiel verlassen möchtest? Dies beendet das Spiel für beide Spieler.
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