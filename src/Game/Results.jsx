import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '../useFirebase';
import { Typography, Paper, Box, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { remove, set, ref as databaseRef } from 'firebase/database';
import { useActiveCourse } from '../User/useActiveCourse';

export default function Results() {
  const { gameId } = useParams();
  const { firestore, database, auth } = useFirebase();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const navigate = useNavigate();
  const { activeCourse } = useActiveCourse();


  const exitPrivateLobby = useCallback(
    (privateLobbyId) => {
      const defaultStatuses = {
        online: true,
        coop: false,
        competition: false,
        matching_user_id: null,
        game_id: null,
      };
      if (!privateLobbyId) return;
      // Remove private lobby
      const privateLobbyRef = databaseRef(database, `private_lobbies/${privateLobbyId}`);
      remove(privateLobbyRef).catch((error) =>
        console.error("Error removing private lobby:", error)
      );
      // Reset user status
      const userStatusRef = databaseRef(database, `lobbies/${activeCourse?.id}/${auth.currentUser.uid}`);
      set(userStatusRef, defaultStatuses).catch((error) =>
        console.error("Error resetting user status:", error)
      );
    },
    [database, activeCourse?.id, auth?.currentUser?.uid]
  );

  const handleExit = useCallback(async () => {
    try {
      exitPrivateLobby(gameId);
      navigate('/');
    } catch (err) {
      console.error("Error exiting game:", err);
      setError("Fehler beim Verlassen des Spiels.");
    }
  }, [exitPrivateLobby, gameId, navigate]);

  useEffect(() => {
    async function fetchGameData() {
      try {
        const gameRef = doc(firestore, 'game_data', gameId);
        const gameDoc = await getDoc(gameRef);
        if (gameDoc.exists()) {
          setGameData(gameDoc.data());
          console.log("gameData: ", gameDoc.data())
          let end_time = gameDoc.data().end_time;
          console.log("end_time", end_time)
          let start_time = gameDoc.data().start_time;
          console.log("start_time", start_time)
          let timeTaken = end_time.toDate().getTime() - start_time.toDate().getTime();
          console.log("timeTaken", timeTaken)
          setMinutes(Math.floor(timeTaken / 60000));
          setSeconds(((timeTaken % 60000) / 1000).toFixed(0));
        } else {
          setError('Game not found');
        }
      } catch (err) {
        setError('Error fetching game data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchGameData();
  }, [gameId, firestore]);

  if (loading) {
    return <Typography>Lade Ergebnisse...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!gameData) {
    return <Typography>Spieldaten konnten nicht geladen werden.</Typography>;
  }

  const { questions, answers_player1, answers_player2, game_mode, player1 } = gameData;

  const isPlayer1 = auth.currentUser.uid === player1.uid;
  const currentPlayerAnswers = isPlayer1 ? answers_player1 : answers_player2;
  const otherPlayerAnswers = isPlayer1 ? answers_player2 : answers_player1;
  const gameMode = game_mode;

  const correctAnswers = questions.reduce((count, question, index) => {
    return count + (currentPlayerAnswers[index].toLowerCase() === question.correct_answer.toLowerCase() ? 1 : 0);
  }, 0);

  const correctAnswersOpponent = questions.reduce((count, question, index) => {
    if (gameMode != "single") {
      return count + (otherPlayerAnswers[index].toLowerCase() === question.correct_answer.toLowerCase() ? 1 : 0);
    } else {
      return 0
    }
  }, 0);

  console.log("correctAnswers", correctAnswers);
  console.log("questions", questions);
  console.log("currentPlayerAnswers", currentPlayerAnswers);

  if (gameData) {
    return (
      <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', my: 4 }}>
        <Grid size={{ xs: 12 }} sx={{ mb: 3 }} container spacing={2}>
        {gameMode === 'single' && (
            <Grid size={{ xs: 12 }} >
              <Typography
              variant="h5"
              noWrap
              gutterBottom
              className='iuHeadline1'
              sx={{
                fontWeight: 700
              }}
            >
              DEIN ERGEBNIS
            </Typography>
            </Grid>
          )}
          {(gameMode === 'competition' && correctAnswers > correctAnswersOpponent) && (
            <Grid size={{ xs: 12 }} >
              <Typography
              variant="h5"
              noWrap
              gutterBottom
              className='iuHeadline2'
              sx={{
                fontWeight: 700
              }}
            >
              GLÜCKWUNSCH, GEWONNEN!
            </Typography>
            </Grid>
          )}
          {(gameMode === 'competition' && correctAnswers < correctAnswersOpponent) && (
            <Grid size={{ xs: 12 }} >
              <Typography
              variant="h5"
              noWrap
              gutterBottom
              className='iuHeadline1'
              sx={{
                fontWeight: 700
              }}
            >
              DER LERNERFOLG ZÄHLT!
            </Typography>
            </Grid>
          )}
          {gameMode !== 'competition' && (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 3 }} >
                <Typography variant="h6">
                  Korrekte Antworten
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 9 }} >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {correctAnswers} von {questions.length}
                </Typography>
              </Grid>
            </>
          )}
          {gameMode === 'competition' && (
            <>
              <Grid size={{ xs: 12 }} >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Korrekte Antworten
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }} >
                <Typography variant="h6">
                  Du:
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 9 }} >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {correctAnswers} von {questions.length}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="h6">
                  Gegenspieler:
                </Typography>
              </Grid><Grid size={{ xs: 12, sm: 6, md: 9 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {correctAnswersOpponent} von {questions.length}
                </Typography>
              </Grid>
            </>
          )}
          <Grid>
            <Typography variant="h6">
              Das Spiel dauerte {minutes} {(minutes == 1) ? "Minute" : "Minuten"} {seconds} {(seconds == 1) ? "Sekunde" : "Sekunden"}.
            </Typography>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12 }} >
          <Button variant="contained" color="secondary" onClick={handleExit}>
            Spiel verlassen
          </Button>
        </Grid>

        <List>
          {gameData?.questions.map((question, index) => (
            <>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Typography variant="h6">
                      Frage {index + 1}: {question.question_text}
                    </Typography>
                  }
                  secondary={
                    <Grid container spacing={2} mt={1}>
                      {['A', 'B', 'C', 'D'].map((option) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={option}>
                          <Box
                            sx={{
                              p: 1,
                              border: '1px solid',
                              borderColor: 'grey.300',
                              borderRadius: 1,
                              backgroundColor:
                                option === question.correct_answer.toUpperCase()
                                  ? 'success.light'
                                  : option === currentPlayerAnswers[index].toUpperCase()
                                    ? 'error.light'
                                    : 'inherit',
                            }}
                          >
                            <Typography
                              variant="body2"
                              color={
                                option === question.correct_answer.toUpperCase() || option === currentPlayerAnswers[index].toUpperCase()
                                  ? 'white'
                                  : 'inherit'
                              }
                            >
                              {option}: {question[`answer_${option.toLowerCase()}`]}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  }
                />
              </ListItem>
              {gameData?.game_mode === 'competition' && (
                <Box ml={4} mb={2}>
                  <Typography variant="body2">
                    Richtige Antwort: {question.correct_answer.toUpperCase()}
                  </Typography>
                  <Typography variant="body2">
                    Deine Antwort: {currentPlayerAnswers[index].toUpperCase() || 'keine Antwort'}
                  </Typography>
                  <Typography variant="body2">
                    Antwort deines Gegners: {otherPlayerAnswers[index].toUpperCase() || 'keine Antwort'}
                  </Typography>
                </Box>
              )}
              {index < questions.length - 1 && <Divider sx={{ my: 3 }} />}
            </>
          ))}
        </List>
      </Paper>
    );
  }
}