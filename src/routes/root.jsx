import { Outlet, useNavigation } from 'react-router-dom';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Container } from '@mui/material';
import BottomNav from '../Layout/BottomNav';
import TopNav from '../Layout/TopNav';
import Login from '../User/Login';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { UserContext } from '../User/UserContext';

// Firebase imports
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from 'firebase/database';
import { getAuth, connectAuthEmulator, signOut } from "firebase/auth";

// Firebase SDK configuration object
const firebaseConfig = {
    apiKey: "AIzaSyBevweMy2v48Meun9s80B6GTLjom8Ao-J4",
    authDomain: "iu-quizapp.firebaseapp.com",
    databaseURL: "https://iu-quizapp-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "iu-quizapp",
    storageBucket: "iu-quizapp.appspot.com",
    messagingSenderId: "1086779168474",
    appId: "1:1086779168474:web:ede6332a4022776237f7e3"
};

const iuTheme = createTheme({
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
            main: '#00000099'
        },
        plainBlack: {
            main: '#010101',
        },
    },
});


// Check if development mode
const isDevelopment = import.meta.env.DEV;

export default function Root() {

    const [activeUser, setActiveUser] = useState(null);
    const navigation = useNavigation();

    const app = useMemo(() => initializeApp(firebaseConfig), []);
    const auth = useMemo(() => getAuth(app), [app]);
    const firestore = useMemo(() => getFirestore(app), [app]);
    const database = useMemo(() => getDatabase(app), [app]);

    useEffect(() => {
        if (isDevelopment) {
            connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: false });
        } else {
            // Production mode
            initializeAppCheck(app, {
                provider: new ReCaptchaV3Provider('6LeDu0cqAAAAAKvIvMe_3__CciQMAQCr1M4-uOrD'),
                isTokenAutoRefreshEnabled: true
            });
        }
    }, [app, auth]);

    // Logout-Funktion wird für Logout-Button im Drawer-Menü an TopNav-Komponente übergeben
    const handleLogout = useCallback(async () => {
        try {
            await signOut(auth);
            setActiveUser(null);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    }, [auth]);

    // Presence System, das monitored ob der Nutzer online ist
    function rtdb_and_local_fs_presence() {
        const uid = auth().currentUser.uid;
        // Create a reference to this user's specific status node.
        // This is where we will store data about being online/offline.
        const userStatusDatabaseRef = database().ref('/status/' + uid);

        // We'll create two constants which we will write to 
        // the Realtime database when this device is offline
        // or online.
        const isOfflineForDatabase = {
            state: 'offline',
            last_changed: database.ServerValue.TIMESTAMP,
        };

        const isOnlineForDatabase = {
            state: 'online',
            last_changed: database.ServerValue.TIMESTAMP,
        };

        const userStatusFirestoreRef = firestore().doc('/status/' + uid);

        // Firestore uses a different server timestamp value, so we'll 
        // create two more constants for Firestore state.
        const isOfflineForFirestore = {
            state: 'offline',
            last_changed: firestore.FieldValue.serverTimestamp(),
        };
        const isOnlineForFirestore = {
            state: 'online',
            last_changed: firestore.FieldValue.serverTimestamp(),
        };

        // Create a reference to the special '.info/connected' path in 
        // Realtime Database. This path returns `true` when connected
        // and `false` when disconnected.
        database().ref('.info/connected').on('value', function (snapshot) {
            // If we're not currently connected, don't do anything.
            if (snapshot.val() == false) {
                // Instead of simply returning, we'll also set Firestore's state
                // to 'offline'. This ensures that our Firestore cache is aware
                // of the switch to 'offline.'
                userStatusFirestoreRef.set(isOfflineForFirestore);
                return;
            };

            // If we are currently connected, then use the 'onDisconnect()' 
            // method to add a set which will only trigger once this 
            // client has disconnected by closing the app, 
            // losing internet, or any other means.
            userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function () {
                // The promise returned from .onDisconnect().set() will
                // resolve as soon as the server acknowledges the onDisconnect() 
                // request, NOT once we've actually disconnected:
                // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

                // We can now safely set ourselves as 'online' knowing that the
                // server will mark us as offline once we lose connection.
                userStatusDatabaseRef.set(isOnlineForDatabase);

                // We'll also add Firestore set here for when we come online.
                userStatusFirestoreRef.set(isOnlineForFirestore);
            });
        });
    }

    if (activeUser) {
        return (
            <ThemeProvider theme={iuTheme}>
                <UserContext.Provider value={activeUser}>
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
                </UserContext.Provider>
            </ThemeProvider>
        );
    } else {
        return (
            <Login auth={auth} setActiveUser={setActiveUser} />
        )
    }
}