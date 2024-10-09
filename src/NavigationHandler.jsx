import { set, ref as databaseRef, remove } from "firebase/database";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBlocker, useLocation, useNavigation } from "react-router-dom";
import { useFirebase } from './useFirebase';
import { useActiveCourse } from './User/useActiveCourse';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";


export default function NavigationHandler() {

    const navigate = useNavigation();
    const { auth, firestore, database } = useFirebase();
    const { activeCourse } = useActiveCourse();
    const activeUser = auth.currentUser;
    const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
    const location = useLocation();
    const previousLocation = useRef(location);

    // let blocker = useBlocker(
    //     ({ currentLocation, nextLocation }) =>
    //       (location.pathname.startsWith("/single") || location.pathname.startsWith("/coop") || location.pathname.startsWith("/competition")) &&
    //       currentLocation.pathname !== nextLocation.pathname
    //   );

    // Make sure user status is reset when navigating away from lobby or game to avoid inconsistencies
    useEffect(() => {
        if (!activeCourse || !activeUser) return;
        const defaultStatuses = { online: true, coop: false, competition: false, matching_user_id: null, game_id: null };
        const userStatusRef = databaseRef(database, `lobbies/${activeCourse.id}/${activeUser.uid}`);
        async function resetStatus() {
            if (!activeCourse || !activeUser) return;
            await set(userStatusRef, defaultStatuses);
        }
        async function deleteGameData(gameId) {
            const gameRef = doc(firestore, 'game_data', gameId);
            const docSnap = await getDoc(gameRef);
            if (docSnap.exists()) {
                await deleteDoc(gameRef);
            }
        }

        async function resetLobbyStatus(privateLobbyId) {
            if (!privateLobbyId) return;
            // Remove private lobby
            const privateLobbyRef = databaseRef(database, `private_lobbies/${privateLobbyId}`);
            remove(privateLobbyRef).catch((error) =>
                console.error("Error removing private lobby:", error)
            );
            resetStatus();
        }

        if (previousLocation.current.pathname.startsWith("/coop") && previousLocation.current.pathname != location.pathname && !location.pathname.startsWith("/result")) {
            const gameId = previousLocation.current.pathname.slice(6)
            resetLobbyStatus(gameId);
            deleteGameData(gameId);
        }
        if (previousLocation.current.pathname.startsWith("/competition") && previousLocation.current.pathname != location.pathname && !location.pathname.startsWith("/result")) {
            const gameId = previousLocation.current.pathname.slice(12)
            resetLobbyStatus(gameId);
            deleteGameData(gameId);
        }
        if (previousLocation.current.pathname.startsWith("/single") && previousLocation.current.pathname != location.pathname && !location.pathname.startsWith("/result")) {
            const gameId = previousLocation.current.pathname.slice(7)
            deleteGameData(gameId);
        }
        if (previousLocation.current.pathname === "/" && location.pathname !== "/") {
            resetStatus();
        }

        previousLocation.current = location;
    }, [location, activeCourse, activeUser, database, firestore]);



    // const exitPrivateLobby = useCallback(
    //     (privateLobbyId) => {
    //         const defaultStatuses = { online: true, coop: false, competition: false, matching_user_id: null, game_id: null };
    //         if (!privateLobbyId) return;
    //         // Remove private lobby
    //         const privateLobbyRef = databaseRef(database, `private_lobbies/${privateLobbyId}`);
    //         remove(privateLobbyRef).catch((error) =>
    //             console.error("Error removing private lobby:", error)
    //         );
    //         // Reset user status
    //         const userStatusRef = databaseRef(database, `lobbies/${activeCourse?.id}/${activeUser.uid}`);
    //         set(userStatusRef, defaultStatuses).catch((error) =>
    //             console.error("Error resetting user status:", error)
    //         );
    //     },
    //     [database, activeCourse?.id, activeUser?.uid]
    // );

    // const handleExit = useCallback(async (gameId) => {
    //     try {
    //         if (!location.pathname.startsWith("/single")) {
    //             exitPrivateLobby(gameId);
    //         }
    //         const gameRef = doc(firestore, 'game_data', gameId);
    //         const docSnap = await getDoc(gameRef);
    //         if (docSnap.exists()) {
    //             await deleteDoc(gameRef);
    //         }
    //         navigate('/');
    //     } catch (error) {
    //         console.error("Error exiting game:", error);
    //     }
    // }, [exitPrivateLobby, firestore, location.pathname, navigate]);

    // const openExitDialog = useCallback(() => {
    //     setIsExitDialogOpen(true);
    // }, []);

    // const closeExitDialog = useCallback(() => {
    //     setIsExitDialogOpen(false);
    // }, []);

    // const confirmExit = useCallback(() => {
    //     closeExitDialog();
    //     handleExit();
    // }, [closeExitDialog, handleExit]);

    // if (blocker.state === "blocked") return (
    //     <Dialog
    //         open={isExitDialogOpen}
    //         aria-labelledby="alert-dialog-title"
    //         aria-describedby="alert-dialog-description"
    //     >
    //         <DialogTitle id="alert-dialog-title">
    //             {"Spiel verlassen?"}
    //         </DialogTitle>
    //         <DialogContent>
    //             <DialogContentText id="alert-dialog-description">
    //                 Bist du sicher, dass du das Spiel verlassen möchtest?
    //             </DialogContentText>
    //         </DialogContent>
    //         <DialogActions>
    //             <Button color='secondary'>Abbrechen</Button>
    //             <Button color='warning' autoFocus>
    //                 Verlassen
    //             </Button>
    //         </DialogActions>
    //     </Dialog>
    // );

}