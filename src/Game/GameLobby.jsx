import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useBeforeUnload } from 'react-router-dom';
import { ref as databaseRef, onValue, get } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { useFirebase } from '../useFirebase';
import PrivateChat from './PrivateChat';
import { useActiveCourse } from '../useActiveCourse';
import { useUserStatuses } from '../useUserStatuses';

export default function GameLobby({ gameType, gameId }) {
  const navigate = useNavigate();
  const { database, firestore, auth } = useFirebase();
  const [gameData, setGameData] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
          setTimeout(() => navigate('/'), 20000);
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
        if (data.onlyOneUserLeft) {
          setAlert("Der andere Spieler hat das Spiel verlassen.");
        }
      } else {
        setAlert("Das Spiel wurde beendet.");
        setTimeout(() => navigate('/'), 20000);
      }
    }, (err) => {
      console.error("Error setting up game listener:", err);
      setError("Fehler beim Aktualisieren des Spielstatus.");
    });

    return () => {
      unsubscribe();
      // Remove exitPrivateLobby from here
    };
  }, [gameId, database, firestore, auth, navigate]);

  const handleExit = useCallback(async () => {
    try {
      await exitPrivateLobby(gameId);
      navigate('/');
    } catch (err) {
      console.error("Error exiting game:", err);
      setError("Fehler beim Verlassen des Spiels.");
    }
  }, [exitPrivateLobby, gameId, navigate]);

  useBeforeUnload(handleExit);

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
      <Button sx={{ mt: 2 }} variant="contained" color="secondary" onClick={handleExit}>
        Spiel verlassen
      </Button>
    </Box>
  );
}