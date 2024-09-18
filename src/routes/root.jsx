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
            main: '#F6F4F5',
        },
        secondary: {
            main: '#55FF4D',
        },
        tertiary: {
            main: '#D9D9DD',
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
    const db = useMemo(() => getFirestore(app), [app]);

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

    const handleLogout = useCallback(async () => {
        try {
            await signOut(auth);
            setActiveUser(null);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    }, [auth]);

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