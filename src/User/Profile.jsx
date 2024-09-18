import { useState, useContext } from 'react';
import { UserContext } from '../User/UserContext';
import { Typography, Paper, TextField, Button, Snackbar } from '@mui/material';
import Grid from '@mui/material/Grid2';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { updateProfile } from 'firebase/auth';
import '@fontsource/source-sans-pro/400.css';
import "../Layout/styles.css";

export default function Profile() {
    const user = useContext(UserContext);
    const [isEditing, setIsEditing] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

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
            setIsEditing(false);
            setSnackbarMessage('Display name updated successfully!');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error updating display name:', error);
            setSnackbarMessage('Failed to update display name. Please try again.');
            setSnackbarOpen(true);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    let profileItems = [
        { 
            label: 'Nutzername', 
            value: user.displayName,
            editable: true
        },
        { label: 'Email', value: user.email },
        { label: 'Email verifiziert', value: user.emailVerified ? 'Ja' : 'Nein' },
        { label: 'Letzte Anmeldung', value: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString('de-DE') : 'Unbekannt' },
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
                {profileItems.map((item, index) => (
                    <Grid size={12} key={index}>
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
                                        <Button onClick={handleSave} startIcon={<CheckIcon color='success' />} size="small" sx={{ marginLeft: 1 }}>
                                            Save
                                        </Button>
                                        <Button onClick={handleCancel} startIcon={<CloseIcon color='warning' />} size="small" sx={{ marginLeft: 1 }}>
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <Button color='plainBlack' onClick={handleEdit} startIcon={<EditIcon color='plainBlack' />} size="small" sx={{ marginLeft: 1 }}>
                                        Bearbeiten
                                    </Button>
                                )
                            )}
                        </Typography>
                    </Grid>
                ))}
            </Grid>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </Paper>
    );
}