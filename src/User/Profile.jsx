import { useState } from 'react';
import { updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { Typography, Paper, TextField, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormHelperText } from '@mui/material';
import Grid from '@mui/material/Grid2';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import '@fontsource/source-sans-pro/400.css';
import "../Layout/styles.css";
import { useFirebase } from '../useFirebase';

export default function Profile() {
    const { auth, firestore } = useFirebase();
    const user = auth.currentUser;
    const [isEditing, setIsEditing] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    if (!user) {
        return (
            <Paper elevation={8} sx={{ py: 2, px: 4, textAlign: "center" }}>
                <Typography variant="body1">Loading...</Typography>
            </Paper>
        );
    }

    const handleEdit = () => {
        setNewDisplayName(user.displayName || '');
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            await updateProfile(user, { displayName: newDisplayName });
            // Update display_name in Firestore
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, { display_name: newDisplayName });
            setIsEditing(false);
        } catch (error) {
            console.error('Nutzername konnte nicht geändert werden:', error);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleClickDialogOpen = () => {
        setDialogOpen(true);
        setPasswordError("");
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setPasswordError("");
    };

    const handlePasswordChange = async (event) => {
        event.preventDefault();
        if (newPassword !== confirmNewPassword) {
            setPasswordError("Neue Passwörter stimmen nicht überein.");
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            handleDialogClose();
        } catch (error) {
            console.error("Fehler beim Ändern des Passworts:", error);
            setPasswordError("Passwort konnte nicht geändert werden. Überprüfen dein aktuelles Passwort und versuch es erneut.");
        }
    };

    // TODO
    // Der Flag "editable" gibt nur die Veränderung in der UI frei. 
    // Um den tatsächlichen Datenzugriff einzuschränken bräuchte es Custom Claims mit der Admin SDK und Cloud Functions (Validierung)
    let profileItems = [
        { label: 'Nutzername', value: user.displayName, editable: true },
        { label: 'Email', value: user.email,editable: false },
        { label: 'Email verifiziert', value: user.emailVerified ? 'Ja' : 'Nein', editable: false },
    ];

    return (
        <Paper elevation={8} sx={{ py: 4, px: 6, textAlign: "left" }}>
            <Typography
                variant="h4"
                noWrap
                className='iuHeadline1'
                sx={{
                    fontWeight: 700,
                    marginBottom: 4,
                }}
            >
                DEIN PROFIL
            </Typography>
            <Grid container spacing={2}>
                {profileItems.map((item) => (
                    <Grid size={12} key={item.label}>
                        <Typography
                            component="div"
                            className='normText'
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                '& > :first-of-type': {
                                    fontWeight: 'bold',
                                    minWidth: '150px',
                                    marginRight: 2,
                                },
                            }}
                        >
                            <span>{item.label}:</span>
                            {item.editable && isEditing ? (
                                <TextField
                                    value={newDisplayName}
                                    onChange={(e) => setNewDisplayName(e.target.value)}
                                    size="small"
                                    sx={{ marginRight: 1 }}
                                />
                            ) : (
                                <span>{item.value}</span>
                            )}
                            {item.editable && (
                                isEditing ? (
                                    <>
                                        <Button onClick={handleSave} startIcon={<CheckIcon />} size="small" sx={{ marginLeft: 1 }} color="success" variant="text">
                                            Speichern
                                        </Button>
                                        <Button onClick={handleCancel} startIcon={<CloseIcon />} size="small" sx={{ marginLeft: 1 }} color="error" variant="text">
                                            Abbruch
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={handleEdit} startIcon={<EditIcon />} size="small" sx={{ marginLeft: 1 }} color="plainBlack" variant="text">
                                        Bearbeiten
                                    </Button>
                                )
                            )}
                        </Typography>
                    </Grid>
                ))}
                <Grid mt={2} size={12} >
                    <Button color="secondary" variant="contained" onClick={handleClickDialogOpen}>
                        Passwort ändern
                    </Button>
                </Grid>
            </Grid>

            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                aria-labelledby="password-change-dialog-title"
            >
                <DialogTitle id="password-change-dialog-title">Passwort ändern</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bitte geben Sie Ihr aktuelles Passwort ein und wählen Sie ein neues Passwort.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="current-password"
                        label="Aktuelles Passwort"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        id="new-password"
                        label="Neues Passwort"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        id="confirm-new-password"
                        label="Neues Passwort bestätigen"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                    {passwordError && (
                        <FormHelperText error>{passwordError}</FormHelperText>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" variant="contained" onClick={handleDialogClose}>Abbrechen</Button>
                    <Button color="secondary" variant="contained" onClick={handlePasswordChange}>Passwort ändern</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}