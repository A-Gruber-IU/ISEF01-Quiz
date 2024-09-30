import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, getDoc, serverTimestamp as serverTimestampFS } from 'firebase/firestore';
import { Button, Typography, Paper, Box, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../useFirebase';

export default function GamePlay({ courseId, gameId }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [isPlayer1, setIsPlayer1] = useState(false);
  const [otherPlayerAnswer, setOtherPlayerAnswer] = useState(null);
  const [notEnoughQuestions, setNotEnoughQuestions] = useState(false);
  const [waitingForOtherPlayer, setWaitingForOtherPlayer] = useState(false);
  const [otherPlayerWaiting, setOtherPlayerWaiting] = useState(false);
  const { auth, firestore } = useFirebase();
  const navigate = useNavigate();
  const currentQuestion = questions[currentQuestionIndex];
  const gameRef = doc(firestore, 'game_data', gameId);

  console.log("rerender");

  // This useEffect sets up a listener to work with Firestore Database in realtime and fetches the questions to initialize the game
  useEffect(() => {
    // This function is used to fetches random questions and is called inside the snapshot listener only by player1 if there are no questions loaded yet
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

          await updateDoc(gameRef, {
            questions: resolvedQuestions,
            questions_loaded: true,
            player1_ready_for_next: false,
            player2_ready_for_next: false,
            current_question_index: 0,
          });
        } else {
          console.error("Index document not found or empty.");
        }
      } catch (error) {
        console.error("Error fetching questions:", error.message);
      }
    };

    // This is a listener for realtime changes in Firestore Database
    const gameRef = doc(firestore, 'game_data', gameId);
    const unsubscribe = onSnapshot(gameRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setGameData(data);
        const isPlayer1inDB = data.player1?.uid === auth.currentUser?.uid;
        setIsPlayer1(isPlayer1inDB);
        setCurrentQuestionIndex(data.current_question_index);

        // Call function to fetch random questions only by player1 if there are no questions loaded yet
        if (!data.questions_loaded && isPlayer1inDB) {
          await fetchQuestions();
        } else if (data.questions) {
          setQuestions(data.questions);
        }

        // This block sets the readiness status of both players when playing coop or competititon
        if (data.game_mode !== 'single') {
          const otherPlayerAnswers = isPlayer1inDB ? data.answers_player2 : data.answers_player1;
          setOtherPlayerAnswer(otherPlayerAnswers ? otherPlayerAnswers[data.current_question_index] : null);

          const currentPlayerReady = isPlayer1inDB ? data.player1_ready_for_next : data.player2_ready_for_next;
          const otherPlayerReady = isPlayer1inDB ? data.player2_ready_for_next : data.player1_ready_for_next;

          if (currentPlayerReady && !otherPlayerReady) {
            setWaitingForOtherPlayer(true);
          } else if (!currentPlayerReady && otherPlayerReady) {
            setOtherPlayerWaiting(true);
          } else if (currentPlayerReady && otherPlayerReady) {
            setWaitingForOtherPlayer(false);
            setOtherPlayerWaiting(false);
            const nextQuestionIndex = data.current_question_index + 1;
            await updateDoc(gameRef, {
              player1_ready_for_next: false,
              player2_ready_for_next: false,
              current_question_index: nextQuestionIndex,
            });
          } else {
            setWaitingForOtherPlayer(false);
          }
        }
      } else {
        console.error("Game document does not exist");
      }
    });
    return () => unsubscribe();
  }, [courseId, gameId, firestore, auth.currentUser?.uid]);


  // This hook handles changes of the other players answers in coop and competition mode
  useEffect(() => {
    async function handleCoopAnswer() {
      if (otherPlayerAnswer && selectedAnswer && otherPlayerAnswer == selectedAnswer) {
        handleAnswerSelect(selectedAnswer);
      }
    }
    async function handleCompetitionAnswer() {
      if (otherPlayerAnswer && selectedAnswer) {
        handleAnswerSelect(selectedAnswer);
      }
    }
    if (gameData?.game_mode === 'coop') {
      handleCoopAnswer();
    } else if (gameData?.game_mode === 'competition') {
      handleCompetitionAnswer();
    }
  }, [otherPlayerAnswer, selectedAnswer]);

  // This function handles what happens when an answer is chosen. 
  // It will be called either directly by a click event or with a useEffect hook when the other player logs in his answer.
  async function handleAnswerSelect(answer) {
    setSelectedAnswer(answer);
    const answerField = isPlayer1 ? 'answers_player1' : 'answers_player2';
    await updateDoc(gameRef, {
      [answerField]: {
        ...gameData[answerField],
        [currentQuestionIndex]: answer,
      }
    });
    // In single mode, any answer will logged in directly, for competition mode both players need to log in their answer before feedback and in coop mode both anwers need to match
    if (gameData.game_mode === 'single' ||
      (gameData.game_mode === 'competition' && otherPlayerAnswer) ||
      (gameData.game_mode === 'coop' && answer === otherPlayerAnswer)) {
      // In coop, if both answers match they will be logged as agreed answer
      if (gameData.game_mode === 'coop') {
        await updateDoc(gameRef, {
          [`agreed_answers.${currentQuestionIndex}`]: answer
        });
      }
      // After answers are finally logged, the feedback is displayed to reveal the correct answer
      setShowFeedback(true);
      // The result for that answer is logged to the results map
      await updateDoc(gameRef, {
        [`results.${currentQuestionIndex}`]: answer === questions[currentQuestionIndex].correct_answer.toUpperCase()
      });
      // If that was the last question, set a timestamp for evaluation of players' time effectiveness
      if (currentQuestionIndex === questions.length - 1) {
        await updateDoc(gameRef, { "end_time": serverTimestampFS() });
      }
    }
  };

  // This function is called when the user clicks the button after each question, setting the display options and his readiness status
  async function handleNextQuestion() {
    setSelectedAnswer(null);
    setOtherPlayerAnswer(null);
    setShowFeedback(false);
    const readyField = isPlayer1 ? 'player1_ready_for_next' : 'player2_ready_for_next';
    await updateDoc(gameRef,
      {
        [readyField]: true,
      });
    if (currentQuestionIndex == questions.length - 1) {
      navigate(`/results/${gameId}`);
    }
  };

  if (!currentQuestion || !gameData) {
    return <Typography>Lade Spieldaten...</Typography>;
  }

  if (notEnoughQuestions) {
    return (
      <p>Es wurden noch nicht ausreichend Fragen für diesen Kurs eingereicht und geprüft.</p>
    )
  }

  if (gameData?.game_mode !== 'single' && waitingForOtherPlayer) {
    return (
      <Paper elevation={3} sx={{ p: 3, my: 4 }}>
        <Box mt={2} display="flex" alignItems="center" justifyContent={"center"}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography>Warte auf den anderen Spieler...</Typography>
        </Box>
      </Paper>
    )
  }

  // This is used to determine which answer is highlighted in what color, both during the selection and when showing feedback with correct answer, for all game modes 
  const buttonBackgroundColor = (option) => {
    if (showFeedback) {
      if (option == currentQuestion.correct_answer.toLowerCase()) {
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


  return (
    <Paper elevation={3} sx={{ p: 3, my: 4 }}>
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
              onClick={() => !showFeedback ? handleAnswerSelect(option.toLowerCase()) : null}
              color={buttonBackgroundColor(option.toLowerCase())}
            >
              {option}: {currentQuestion[`answer_${option.toLowerCase()}`]}
            </Button>
          </Grid>
        ))}
      </Grid>
      {showFeedback && (
        <Box mt={2}>
          <Typography color={selectedAnswer === currentQuestion.correct_answer.toLowerCase() ? 'green' : 'red'}>
            {selectedAnswer === currentQuestion.correct_answer.toLowerCase()
              ? 'Richtig!'
              : `Falsch. Die richtige Antwort ist ${currentQuestion.correct_answer.toUpperCase()}`}
          </Typography>
          <Button variant="contained" onClick={handleNextQuestion} sx={{ mt: 2 }} color='secondary'>
            {currentQuestionIndex < questions.length - 1 ? 'Nächste Frage' : 'Quiz beenden'}
          </Button>
        </Box>
      )}
      {showFeedback && (gameData?.game_mode == "competition") && (
        <Box mt={2}>
          <Typography>
            {otherPlayerAnswer === currentQuestion.correct_answer.toLowerCase()
              ? 'Dein Gegenspieler hat richtig geantwortet.'
              : `Dein Gegenspieler hat falsch geantwortet (${otherPlayerAnswer}).`}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}