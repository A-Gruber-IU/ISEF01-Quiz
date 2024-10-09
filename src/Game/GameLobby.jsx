import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref as databaseRef, onValue, get, remove, set } from 'firebase/database';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { Box, Typography, Button, Alert, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useFirebase } from '../useFirebase';
import PrivateChat from './PrivateChat';
import { useActiveCourse } from '../User/useActiveCourse';
import GamePlay from './GamePlay';

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
  const { activeCourse } = useActiveCourse();

  useEffect(() => {
    const privateLobbyRef = databaseRef(database, `private_lobbies/${gameId}`);

    async function fetchInitialData() {
      try {
        const snapshot = await get(privateLobbyRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setGameData(data);
          let otherUserId = null;
          if (data.user1 == activeUser.uid || data.user2 != activeUser.uid) {
            otherUserId = data.user2;
            console.log("You are player 1.")
          } else if (data.user2 == activeUser.uid || data.user1 != activeUser.uid) {
            otherUserId = data.user1;
            console.log("You are player 2.")
          } else {
            setError("Fehler. Anderer Spieler konnte nicht gefunden werden.");
          }
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

    const unsubscribe = onValue(privateLobbyRef, async (snapshot) => {
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
  }, [gameId, database, firestore, auth, navigate, activeUser.uid]);

  const exitPrivateLobby = useCallback(
    (privateLobbyId) => {
      const defaultStatuses = { online: true, coop: false, competition: false, matching_user_id: null, game_id: null };
      if (!privateLobbyId) return;
      // Remove private lobby
      const privateLobbyRef = databaseRef(database, `private_lobbies/${privateLobbyId}`);
      remove(privateLobbyRef).catch((error) =>
        console.error("Error removing private lobby:", error)
      );
      // Reset user status
      const userStatusRef = databaseRef(database, `lobbies/${activeCourse?.id}/${activeUser.uid}`);
      set(userStatusRef, defaultStatuses).catch((error) =>
        console.error("Error resetting user status:", error)
      );
    },
    [database, activeCourse?.id, activeUser?.uid]
  );

  const handleExit = useCallback(async () => {
    try {
      exitPrivateLobby(gameId);
      const gameRef = doc(firestore, 'game_data', gameId);
      const docSnap = await getDoc(gameRef);
      if (docSnap.exists()) {
        await deleteDoc(gameRef);
      }
      navigate('/');
    } catch (err) {
      console.error("Error exiting game:", err);
      setError("Fehler beim Verlassen des Spiels.");
    }
  }, [exitPrivateLobby, firestore, gameId, navigate]);

  const openExitDialog = useCallback(() => {
    if (alert == "Der andere Spieler hat das Spiel beendet.") {
      handleExit();
    } else {
      setIsExitDialogOpen(true);
    }
  }, [alert, handleExit]);
  
  const closeExitDialog = useCallback(() => {
    setIsExitDialogOpen(false);
  }, []);

  const confirmExit = useCallback(() => {
    closeExitDialog();
    handleExit();
  }, [closeExitDialog, handleExit]);


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
      <GamePlay gameId={gameId} courseId={activeCourse?.id} />
      <PrivateChat chatId={gameId} />
      <Button sx={{ mt: 2 }} variant="contained" color="warning" onClick={openExitDialog}>
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