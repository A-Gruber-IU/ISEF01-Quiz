
// TODO
// Registrierung ist in Demo deaktiviert.
// Registrierung in echter Produktionsumgebung würde Cloude Function voraussetzen, die aktive Kurse mit MyCampus synchronisiert.

import { useState, useEffect, useCallback } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, AuthErrorCodes } from "firebase/auth";
import '@fontsource/source-sans-pro/700.css';
import "../Layout/styles.css";
import Typography from '@mui/material/Typography';
import { TextField, Button, Container, Stack, Alert, Tooltip } from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';

export default function Login({ auth, setActiveUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [validationFeedback, setValidationFeedback] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("User is signed in:", user);
                setActiveUser(user);
            } else {
                console.log("User is signed out.");
            }
        });

        return () => unsubscribe();
    }, [auth, setActiveUser]);



    const isValidEmail = useCallback((email) => {
        const domain = email.split('@')[1];
        return domain === 'iu-study.org';
    }, []);

    const createAccount = useCallback(async () => {
        if (!isValidEmail(email)) {
            setValidationFeedback("Nur Mailadressen von @iu-study.org sind zulässig.");
            return;
        }
        setIsLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // TODO
            // Registrierung der Nutzerdaten im Firestore mit weiteren Daten wie display_name
            setValidationFeedback("Account erfolgreich erstellt!");
        } catch (error) {
            console.error("Error creating account:", error);
            setValidationFeedback("Konnte keinen Account erstellen. Überprüfe deine Daten und versuche es erneut.");
        } finally {
            setIsLoading(false);
        }
    }, [auth, email, password, isValidEmail]);

    const loginEmailPassword = useCallback(async () => {
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setValidationFeedback("Login erfolgreich!");
        } catch (error) {
            console.error("Error logging in:", error);
            if (error.code == AuthErrorCodes.INVALID_PASSWORD || error.code == AuthErrorCodes.USER_DELETED) {
                setValidationFeedback("Falsche Emailadresse oder falsches Passwort.");
            }
        } finally {
            setIsLoading(false);
            console.log(auth);
        }
    }, [auth, email, password]);

    const handleSubmit = useCallback((event) => {
        event.preventDefault();
        loginEmailPassword();
    }, [loginEmailPassword]);

    return (
        <Container>
            <Stack
                component="form"
                onSubmit={handleSubmit}
                spacing={2}
                sx={{
                    mt: "10vh",
                    justifyContent: "flex-end",
                    alignItems: "center",
                }}>
                <Typography
                    variant="h4"
                    noWrap
                    className='iuHeadline2'
                    sx={{
                        fontWeight: 700,
                        marginRight: 5,
                    }}
                >
                    QUIZ APP
                </Typography>
                <TextField
                    required
                    id="outlined-required"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={email !== "" && !isValidEmail(email)}
                    disabled={isLoading}
                />
                <TextField
                    required
                    id="outlined-password-input"
                    label="Passwort"
                    type="password"
                    value={password}
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                />
                <Button type="submit" variant="contained" endIcon={<LoginIcon />} disabled={isLoading}>
                    {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
                </Button>
                <Tooltip title="In der Testversion deaktiviert">
                    <span style={{ display: 'inline-block' }}>
                        <Button disabled={true} variant="contained" endIcon={<HowToRegIcon />} onClick={createAccount}>
                            Registrieren
                        </Button>
                    </span>
                </Tooltip>
                {validationFeedback && (
                    <Alert severity={validationFeedback.includes("erfolgreich") ? "success" : "error"}>
                        {validationFeedback}
                    </Alert>
                )}
            </Stack>
        </Container>
    );
}