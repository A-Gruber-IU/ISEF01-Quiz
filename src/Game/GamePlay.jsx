import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, getDoc, serverTimestamp as serverTimestampFS } from 'firebase/firestore';
import { Button, Typography, Paper, Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../useFirebase';

export default function GamePlay({ courseId, gameId }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [player1, setPlayer1] = useState(false);
  const [otherPlayerAnswer, setOtherPlayerAnswer] = useState(null);
  const [notEnoughQuestions, setNotEnoughQuestions] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const { auth, firestore } = useFirebase();
  const navigate = useNavigate();
  const currentQuestion = questions[currentQuestionIndex];

  const buttonBackgroundColor = (option) => {
    if (showFeedback) {
      if (option == currentQuestion.correct_answer) {
        return "lightGreen";
      } else if (option == selectedAnswer) {
        return "error";
      } else if (gameData.game_mode === "competition" && option == otherPlayerAnswer) {
        return "ochre";
      } else {
        return "primary";
      }
    } else if (!showFeedback) {
      if (option == selectedAnswer) {
        return "info";
      } else if (gameData.game_mode === "coop" && option == otherPlayerAnswer) {
        return "ochre";
      } else {
        return "primary";
      }
    }
  }


  useEffect(() => {
    async function fetchQuestions() {
      try {
        console.log("courseId", courseId);
        const indexDoc = await getDoc(doc(firestore, `courses/${courseId}/questions`, "index_reviewed"));
        const indexData = indexDoc.data();
        console.log("indexData", indexData);
        const questionIds = indexData.indices;
        console.log("questionIds", questionIds);
        if (indexDoc.exists && questionIds?.length > 0) {
          const numQuestions = 10;
          if (questionIds.length < numQuestions) {
            setNotEnoughQuestions(true);
            return;
          }
          const randomIndices = [];
          while (randomIndices.length < numQuestions) {
            let randomIndex = Math.floor(Math.random() * questionIds.length);
            if (!randomIndices.includes(randomIndex)) {
              randomIndices.push(randomIndex);
            }
          }
          console.log("randomIndices", randomIndices);

          const selectedQuestionIds = randomIndices.map(index => questionIds[index]);
          const questionRefs = selectedQuestionIds.map(id =>
            doc(firestore, `courses/${courseId}/questions`, id)
          );
          const questionDocs = await Promise.all(questionRefs.map(ref => getDoc(ref)));
          const resolvedQuestions = questionDocs.map(doc => ({ id: doc.id, ...doc.data() }));

          setQuestions(resolvedQuestions);
          console.log(resolvedQuestions);

          const gameRef = doc(firestore, 'game_data', gameId);
          await updateDoc(gameRef, { questions: resolvedQuestions });
        } else {
          console.error("Index document not found or empty.");
        }
      } catch (error) {
        console.error("Error fetching questions:", error.message);
      }
    };

    const unsubscribe = onSnapshot(doc(firestore, 'game_data', gameId), async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setGameData(data);
        const isPlayer1 = data.player1?.uid === auth.currentUser?.uid;
        setPlayer1(isPlayer1);

        if (isPlayer1 && !data.questions) {
          await fetchQuestions();
        } else if (data.questions) {
          setQuestions(data.questions);
        }

        if (data.game_mode !== 'single') {
          const otherPlayerAnswers = isPlayer1 ? data.answers_player2 : data.answers_player1;
          setOtherPlayerAnswer(otherPlayerAnswers ? otherPlayerAnswers[currentQuestionIndex] : null);
        }
      } else {
        console.error("Game document does not exist");
      }
    });
    return () => unsubscribe();
  }, [courseId, gameId, currentQuestionIndex, firestore, auth.currentUser.uid]);

  async function handleAnswerSelect(answer) {
    setSelectedAnswer(answer);

    if (gameData.game_mode === 'single' ||
      (gameData.game_mode === 'competition' && otherPlayerAnswer) ||
      (gameData.game_mode === 'coop' && answer === otherPlayerAnswer)) {
      const gameRef = doc(firestore, 'game_data', gameId);
      const answerField = player1 ? 'answers_player1' : 'answers_player2';
      await updateDoc(gameRef, {
        [answerField]: {
          ...gameData[answerField],
          [currentQuestionIndex]: answer
        }
      });
      if (gameData.game_mode === 'coop') {
        await updateDoc(gameRef, {
          [`agreed_answers.${currentQuestionIndex}`]: answer
        });
      }
      setShowFeedback(true);
      if (player1) {
        await updateDoc(gameRef, {
          [`results.${currentQuestionIndex}`]: answer === questions[currentQuestionIndex].correct_answer
        });
      }

      if (currentQuestionIndex === questions.length - 1) {
        setGameFinished(true);
        console.log("Game finished.")
        const gameRef = doc(firestore, 'game_data', gameId);
        await updateDoc(gameRef, { "end_time": serverTimestampFS() });
        const game_dataDoc = await getDoc(gameRef);
        const game_dataData = game_dataDoc.data();
        console.log("game_data: ", game_dataData)
        navigate(`/results/${gameId}`);
      }
    }
  };

  useEffect(() => {
  async function handleCoopAnswer() {
    if (otherPlayerAnswer == selectedAnswer) {
      handleAnswerSelect(selectedAnswer);
    } 
  }
  handleCoopAnswer();
}, [otherPlayerAnswer]);

  async function handleNextQuestion() {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setOtherPlayerAnswer(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      console.log("currentQuestionIndex.", currentQuestionIndex)
    } else if (currentQuestionIndex == questions.length - 1) {
      navigate(`/results/${gameId}`);
    }
  };

  if (!currentQuestion || !gameData) {
    return <Typography>Loading...</Typography>;
  }

  if (notEnoughQuestions) {
    return (
      <p>Es wurden noch nicht ausreichend Fragen für diesen Kurs eingereicht und geprüft.</p>
    )
  }

  if (gameFinished) {
    return (
      <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h6" mt={2}>
          Quiz completed! Navigating to results...
        </Typography>
        <Button variant="contained" onClick={handleNextQuestion} sx={{ mt: 2 }}>
          View Results
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="subtitle2">
        Frage {currentQuestionIndex + 1} von {questions.length}
      </Typography>
      <Typography variant="h5" marginBottom={4} marginTop={1} >
        {currentQuestion.question_text}
      </Typography>
      <Grid container spacing={2}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <Grid size={{ xs: 12, sm: 6 }} key={option}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => !showFeedback ? handleAnswerSelect(option) : null}
              color={buttonBackgroundColor(option)}
            >
              {currentQuestion[`answer_${option.toLowerCase()}`]}
            </Button>
          </Grid>
        ))}
      </Grid>
      {showFeedback && (
        <Box mt={2}>
          <Typography color={selectedAnswer === currentQuestion.correct_answer ? 'green' : 'red'}>
            {selectedAnswer === currentQuestion.correct_answer
              ? 'Richtig!'
              : `Falsche. Die richtige Antwort ist ${currentQuestion.correct_answer}`}
          </Typography>
          <Button variant="contained" onClick={handleNextQuestion} sx={{ mt: 2 }} color='secondary'>
            {currentQuestionIndex < questions.length - 1 ? 'Nächste Frage' : 'Quiz beenden'}
          </Button>
        </Box>
      )}
      {showFeedback && (gameData?.game_mode == "competition") && (
        <Box mt={2}>
          <Typography>
            {otherPlayerAnswer === currentQuestion.correct_answer
              ? 'Dein Gegenspieler hat richtig geantwortet.'
              : `Dein Gegenspieler hat falsch geantwortet (${otherPlayerAnswer}).`}
          </Typography>
          <Button variant="contained" onClick={handleNextQuestion} sx={{ mt: 2 }} color='secondary'>
            {currentQuestionIndex < questions.length - 1 ? 'Nächste Frage' : 'Quiz beenden'}
          </Button>
        </Box>
      )}
    </Paper>
  );
}