import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref as databaseRef, onValue, remove, get, set } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { useFirebase } from '../useFirebase';
import PrivateChat from './PrivateChat';
import { useActiveCourse } from '../useActiveCourse';

export default function GameLobby({ gameType, gameId }) {
  const navigate = useNavigate();
  const { database, firestore, auth } = useFirebase();
  const [gameData, setGameData] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const activeUser = auth.currentUser;

  const { activeCourse } = useActiveCourse(activeUser.uid);

  // TODO
  // Erase data from realtime database public lobby when entering private game lobby after other user has entered

  useEffect(() => {
    const gameRef = databaseRef(database, `private_lobbies/${gameId}`);

    const fetchInitialData = async () => {
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
      } else {
        setAlert("Der andere Spieler hat das Spiel verlassen.");
        setTimeout(() => navigate('/'), 20000);
      }
    }, (err) => {
      console.error("Error setting up game listener:", err);
      setError("Fehler beim Aktualisieren des Spielstatus.");
    });

    return () => unsubscribe();
  }, [gameId, database, firestore, auth, navigate]);

  const handleExit = async () => {
    try {
      await remove(databaseRef(database, `private_lobbies/${gameId}`));
      const userStatusRef = databaseRef(database, `lobbies/${activeCourse.id}/${activeUser.uid}`);
      const defaultStatuses = {
        online: true,
        coop: false,
        competition: false,
        matchingUserId: null,
        gameId: null
      };
      await set(userStatusRef, defaultStatuses);
      navigate('/');
    } catch (err) {
      console.error("Error exiting game:", err);
      setError("Fehler beim Verlassen des Spiels.");
    }
  };

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