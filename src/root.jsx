import { Outlet, useLocation, useNavigation } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Container } from '@mui/material';
import BottomNav from './Layout/BottomNav';
import TopNav from './Layout/TopNav';
import Login from './User/Login';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { connectAuthEmulator, signOut } from "firebase/auth";
import { connectFirestoreEmulator, getDoc, doc, deleteDoc } from "firebase/firestore";
import { connectDatabaseEmulator, ref as databaseRef, remove, onDisconnect, get, onValue, set } from "firebase/database";
import { connectStorageEmulator } from 'firebase/storage';

import { useFirebase } from './useFirebase';
import { useActiveCourse } from './User/useActiveCourse';

const iuTheme = createTheme({
    colorSchemes: {
        light: {
            palette: {
                primary: {
                    light: '#f2f0f1',
                    main: '#efedee',
                    dark: '#a7a5a6',
                    contrastText: '#000',
                },
                secondary: {
                    light: '#5f8eff',
                    main: '#3772ff',
                    dark: '#264fb2',
                    contrastText: '#fff',
                },
                darkGrey: {
                    main: '#545454',
                    light: '#545454',
                    dark: '#545454',
                    contrastText: '#fff',
                },
                plainBlack: {
                    main: '#010101',
                    light: '#010101',
                    dark: '#010101',
                    contrastText: '#fff',
                },
                ochre: {
                    main: '#E3D026',
                    light: '#E9DB5D',
                    dark: '#A29415',
                    contrastText: '#242105',
                },
                lightGreen: {
                    main: '#8bc34a',
                    light: '#a2cf6e',
                    dark: '#618833',
                    contrastText: '#000',
                },
            },
        },
    },
});


// Check if development mode
const isDevelopment = import.meta.env.DEV;

export default function Root() {

    const [activeUser, setActiveUser] = useState(null);
    const navigation = useNavigation();
    const { auth, app, firestore, database, storage } = useFirebase();
    const { activeCourse } = useActiveCourse();

    const location = useLocation();
    const previousLocation = useRef(location);


    useEffect(() => {
        if (isDevelopment) {
            connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: false });
            connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
            connectDatabaseEmulator(database, "127.0.0.1", 9000);
            connectStorageEmulator(storage, "127.0.0.1", 9199);
        } else {
            // Production mode: Firebase App Check needed for access to resources
            initializeAppCheck(app, {
                provider: new ReCaptchaV3Provider('6LeDu0cqAAAAAKvIvMe_3__CciQMAQCr1M4-uOrD'),
                isTokenAutoRefreshEnabled: true
            });
        }
    }, [app, auth, database, firestore, storage]);


    // Make sure user status is reset when navigating away from lobby or game to avoid inconsistencies
    useEffect(() => {
        const defaultStatuses = { online: true, coop: false, competition: false, matching_user_id: null, game_id: null };
        async function resetStatus() {
            if (!activeCourse || !activeUser) return;
            const userStatusRef = databaseRef(database, `lobbies/${activeCourse.id}/${activeUser.uid}`);
            await set(userStatusRef, defaultStatuses);
        }
        async function deleteGameData(gameId) {
            const gameRef = doc(firestore, 'game_data', gameId);
            const docSnap = await getDoc(gameRef);
            if (docSnap.exists()) {
                await deleteDoc(gameRef);
            }
        }
        async function exitPrivateLobby(privateLobbyId) {
            if (!privateLobbyId) return;
            // Remove private lobby
            const privateLobbyRef = databaseRef(database, `private_lobbies/${privateLobbyId}`);
            remove(privateLobbyRef).catch((error) =>
                console.error("Error removing private lobby:", error)
            );
            resetStatus();
        }

        if (previousLocation.current.pathname === "/" && location.pathname !== "/") {
            resetStatus();
        }
        if (previousLocation.current.pathname.startsWith("/coop") && !location.pathname.startsWith("/coop")) {
            const gameId = previousLocation.current.pathname.slice(6)
            exitPrivateLobby(gameId);
            deleteGameData(gameId);
        }
        if (previousLocation.current.pathname.startsWith("/competition") && !location.pathname.startsWith("/competition")) {
            const gameId = previousLocation.current.pathname.slice(12)
            exitPrivateLobby(gameId);
            deleteGameData(gameId);
        }
        
        previousLocation.current = location;
    }, [location, activeCourse, activeUser, database, firestore]);


    useEffect(() => {
        if (!activeUser || !activeCourse) return;
        const userStatusRef = databaseRef(database, `lobbies/${activeCourse.id}/${activeUser.uid}`);
        // Sets up a listener for user status changes in realtime database
        const getUserStatus = onValue(userStatusRef, async (snapshot) => {
            console.log("onValue listener for user status set up.");
            if (snapshot.exists()) {
                const userStatus = snapshot.val();
                console.log("userStatus (root): ", userStatus)
                onDisconnect(userStatusRef).remove();
                if (userStatus?.game_id) {
                    const gameRef = databaseRef(database, `private_lobbies/${userStatus?.game_id}`);
                    onDisconnect(gameRef).remove();
                }
            }
        });
        return () => {
            getUserStatus();
        };
    }, [activeCourse, activeUser, database]);


    useEffect(() => {
        console.log("New activeUser:", activeUser);
    }, [activeUser]);


    // Logout function is passed on to menu drawer in top nav bar for logout button
    const handleLogout = useCallback(async () => {
        try {
            const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
            const courses = (userDoc.data().courses);
            const removePromises = courses.map(courseId => {
                const userStatusRef = databaseRef(database, `lobbies/${courseId}/${auth.currentUser.uid}`);
                return remove(userStatusRef);
            });

            // Wait for all remove operations to complete
            await Promise.all(removePromises);

            // Sign out
            await signOut(auth);
            setActiveUser(null);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    }, [auth, database, firestore]);


    if (activeUser) {


        return (
            <ThemeProvider theme={iuTheme}>
                <TopNav onLogout={handleLogout} />
                <div
                    id="mainView"
                    className={
                        navigation.state === "loading" ? "loading" : ""
                    }
                >
                    <Container sx={{ py: 9 }}>
                        <Outlet />
                    </Container>
                </div>
                <BottomNav />
            </ThemeProvider>
        );
    } else {
        return (
            <Login auth={auth} setActiveUser={setActiveUser} />
        )
    }
}