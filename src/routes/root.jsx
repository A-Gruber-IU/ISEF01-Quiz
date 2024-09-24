import { Outlet, useNavigation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Container } from '@mui/material';
import BottomNav from '../Layout/BottomNav';
import TopNav from '../Layout/TopNav';
import Login from '../User/Login';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { connectAuthEmulator, signOut } from "firebase/auth";
import { connectFirestoreEmulator, getDoc, doc } from "firebase/firestore";
import { connectDatabaseEmulator, ref as databaseRef, remove } from "firebase/database";
import { connectStorageEmulator } from 'firebase/storage';

import { useFirebase } from '../useFirebase';

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
    const { auth, app, firestore, database, storage } = useFirebase();

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
    }, [app, auth]);

    useEffect(() => {
        console.log("New activeUser:", activeUser);
    }, [activeUser]);

    // Logout-Funktion wird für Logout-Button im Drawer-Menü an TopNav-Komponente übergeben
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