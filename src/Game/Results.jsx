import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '../useFirebase';
import { Typography, Paper, Box, List, ListItem, ListItemText, Divider } from '@mui/material';
import Grid from '@mui/material/Grid2';

export default function Results() {
  const { gameId } = useParams();
  const { firestore, auth } = useFirebase();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);

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
    return <Typography>Loading results...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!gameData) {
    return <Typography>No game data available</Typography>;
  }

  const { questions, answers_player1, answers_player2, game_mode, player1, player2 } = gameData;

  const isPlayer1 = auth.currentUser.uid === player1.uid;
  const currentPlayerAnswers = isPlayer1 ? answers_player1 : answers_player2;
  const otherPlayerAnswers = isPlayer1 ? answers_player2 : answers_player1;

  const correctAnswers = questions.reduce((count, question, index) => {
    return count + (currentPlayerAnswers[index] === question.correct_answer ? 1 : 0);
  }, 0);

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h4" gutterBottom>Quiz Results</Typography>
      <Box mb={3}>
        <Typography variant="h6">
          Correct Answers: {correctAnswers} out of {questions.length}
        </Typography>
        <Typography variant="h6">
          Time Taken: {minutes}m {seconds}s
        </Typography>
      </Box>
      <List>
        {questions.map((question, index) => (
          <>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={
                  <Typography variant="h6">
                    Question {index + 1}: {question.question_text}
                  </Typography>
                }
                secondary={
                  <Grid container spacing={2} mt={1}>
                    {['A', 'B', 'C', 'D'].map((option) => (
                      <Grid xs={12} sm={6} key={option}>
                        <Box
                          sx={{
                            p: 1,
                            border: '1px solid',
                            borderColor: 'grey.300',
                            borderRadius: 1,
                            backgroundColor: 
                              option === question.correct_answer
                                ? 'success.light'
                                : option === currentPlayerAnswers[index]
                                ? 'error.light'
                                : 'inherit',
                          }}
                        >
                          <Typography
                            variant="body2"
                            color={
                              option === question.correct_answer || option === currentPlayerAnswers[index]
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
            {game_mode === 'competition' && (
              <Box ml={4} mb={2}>
                <Typography variant="body2">
                  Your answer: {currentPlayerAnswers[index] || 'Not answered'}
                </Typography>
                <Typography variant="body2">
                  Opponent&#39;s answer: {otherPlayerAnswers[index] || 'Not answered'}
                </Typography>
              </Box>
            )}
            {index < questions.length - 1 && <Divider component="li" />}
          </>
        ))}
      </List>
    </Paper>
  );
}