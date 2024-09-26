import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useBeforeUnload } from 'react-router-dom';
import { ref as databaseRef, onValue, get } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import { Box, Typography, Button, Alert, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useFirebase } from '../useFirebase';
import PrivateChat from './PrivateChat';
import { useActiveCourse } from '../User/useActiveCourse';
import { useUserStatuses } from '../User/useUserStatuses';

export default function GameLobby({ gameType, gameId }) {
  const navigate = useNavigate();
  const { database, firestore, auth } = useFirebase();
  const [gameData, setGameData] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const activeUser = auth.currentUser;

  const { activeCourse } = useActiveCourse(activeUser?.uid);
  const { exitPrivateLobby } = useUserStatuses(activeCourse?.id);

  useEffect(() => {
    const gameRef = databaseRef(database, `private_lobbies/${gameId}`);

    async function fetchInitialData() {
      try {
        const snapshot = await get(gameRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setGameData(data);

          const otherUserId = data.users.find(id => id !== auth.currentUser.uid);
          const userDocRef = doc(firestore, 'users', otherUserId);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setOtherUser(userDocSnap.data());
          } else {
            setError("Fehler beim Matching mit anderem Spieler.");
          }
        } else {
          setAlert("Das Spiel existiert nicht mehr.");
        }
      } catch (err) {
        console.error("Error fetching initial game data:", err);
        setError("Fehler beim Laden des Spiels.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    const unsubscribe = onValue(gameRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setGameData(data);
      } else {
        setAlert("Der andere Spieler hat das Spiel beendet.");
      }
    }, (err) => {
      console.error("Error setting up game listener:", err);
      setError("Fehler beim Aktualisieren des Spielstatus.");
    });

    return () => {
      unsubscribe();
    };
  }, [gameId, database, firestore, auth, navigate]);

  const handleExit = useCallback(async () => {
    try {
      exitPrivateLobby(gameId);
      navigate('/');
    } catch (err) {
      console.error("Error exiting game:", err);
      setError("Fehler beim Verlassen des Spiels.");
    }
  }, [exitPrivateLobby, gameId, navigate]);

  const openExitDialog = useCallback(() => {
    setIsExitDialogOpen(true);
  }, []);

  const closeExitDialog = useCallback(() => {
    setIsExitDialogOpen(false);
  }, []);

  const confirmExit = useCallback(() => {
    closeExitDialog();
    handleExit();
  }, [closeExitDialog, handleExit]);

  useBeforeUnload(
    useCallback((event) => {
        event.preventDefault();
        setIsExitDialogOpen(true);
    }, [])
  );


  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" color="primary" onClick={() => navigate('/')}>
          Zurück zur Startseite
        </Button>
      </Box>
    );
  }

  if (!gameData || !otherUser) {
    return (
      <Box>
        <Typography>Fehler beim Laden des Spiels.</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/')}>
          Zurück zur Startseite
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {alert && <Alert severity="info">{alert}</Alert>}
      <Typography variant="h6">
        {gameType === "coop" ? "Coop-Spiel mit" : "Competition gegen"} {otherUser.display_name}
      </Typography>
      <PrivateChat chatId={gameId} />
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
    </Box>
  );
}