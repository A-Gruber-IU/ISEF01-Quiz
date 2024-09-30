import React, { useEffect, useState } from "react";
import "./reviewquestion.css";
import {
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  Box,
  ButtonGroup,
} from "@mui/material";
import { useFirebase } from "../useFirebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";
import QuestionDisplay from "./QuestionDisplay";
import ReviewedAllQuestionsScreen from "./ReviewedAllQuestionsScreen";

const ReviewQuestion = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const { auth, firestore } = useFirebase();
  const [currentQuestion, setCurrentQuestion] = useState([]);
  const user = auth.currentUser;
  console.log(user?.uid);
  console.log(currentQuestion, "Current Question");
  console.log(questions, "All Question");
  console.log(courses, "courses");

  const fetchCourses = async () => {
    try {
      const coursesRef = collection(firestore, "courses");
      const coursesDoc = await getDocs(coursesRef);

      const allCourses = [];
      for (const courseDoc of coursesDoc.docs) {
        allCourses.push({ ...courseDoc.data(), id: courseDoc.id });
      }
      setCourses(allCourses);
    } catch (error) {
      toast.error(error.code.replace(/[/-]/g, " "));
      console.log(error);
    }
  };

  const handleFetchQuestions = async (e) => {
    setSelectedCourse(e.target.value);
    try {
      const queryForQuestionsForReview = query(
        collection(doc(firestore, "courses", e.target.value), "questions"),
        where("reviewed", "!=", true)
      );
      const questionsDocs = await getDocs(queryForQuestionsForReview);
      if (!questionsDocs.empty) {
        const questions = [];
        for (const question of questionsDocs.docs) {
          questions.push({ ...question.data(), id: question.id });
        }
        setQuestions(questions);
        setCurrentQuestion([questions[currentPage]]);
      }
    } catch (error) {
      toast.error(error.code.replace(/[/-]/g, " "));
      console.log(error);
    }
  };

  const handleApproveQuestion = async () => {
    try {
      const questionRef = doc(
        firestore,
        "courses",
        selectedCourse,
        "questions",
        currentQuestion[0].id
      );
      await updateDoc(questionRef, {
        reviewed: true,
        reviewerID: user?.uid,
      });
      const filteredQuestions = questions.filter(
        (element, index) => index !== currentPage
      );

      if (currentPage === 0 && filteredQuestions.length === 0) {
        setCurrentQuestion([]);
      } else if (currentPage === 0 && filteredQuestions.length > 0) {
        setCurrentQuestion([filteredQuestions[0]]);
      } else if (currentPage !== 0 && filteredQuestions.length > 0) {
        setCurrentQuestion([questions[currentPage - 1]]);
        setCurrentPage((prev) => prev - 1);
      }
      setQuestions(filteredQuestions);
    } catch (error) {
      toast.error(error.code.replace(/[/-]/g, " "));
      console.log(error);
    }
  };

  const handleDeclineQuestion = async () => {
    try {
      const questionRef = doc(
        firestore,
        "courses",
        selectedCourse,
        "questions",
        currentQuestion[0].id
      );
      await deleteDoc(questionRef);

      const filteredQuestions = questions.filter(
        (_, index) => index !== currentPage
      );

      if (currentPage != 0 && questions.length > 1) {
        setCurrentQuestion([questions[currentPage - 1]]);
        setCurrentPage((prev) => prev - 1);
      } else if (currentPage === 0 && questions.length > 1) {
        setCurrentQuestion([filteredQuestions[0]]);
      } else {
        setCurrentQuestion([]);
      }
      setQuestions(filteredQuestions);
    } catch (error) {
      toast.error(error.code.replace(/[/-]/g, " "));
      console.log(error);
    }
  };

  const handleGoToNextQuestion = () => {
    if (currentPage < questions.length - 1) {
      setCurrentQuestion([questions[currentPage + 1]]);
      setCurrentPage((prev) => prev + 1);
    } else {
      toast.error("Du bist bei der letzten Frage angekommen");
    }
  };

  const handleGoToPreviousQuestion = () => {
    if (currentPage != 0) {
      setCurrentQuestion([questions[currentPage - 1]]);
      setCurrentPage((prev) => prev - 1);
    } else {
      toast.error("Du bist bei der ersten Frage angekommen");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="container">
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          marginTop: 3,
          marginBottom: 2,
          fontWeight: 600,
        }}
      >
        SCHICKE UNS EINE FRAGE.
      </Typography>
      <FormControl required fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel id="selectedCourse">
          Wähle einen Kurs für deine Frage
        </InputLabel>
        <Select
          labelId="selectedCourse"
          id="selectedCourse"
          value={selectedCourse || ""}
          label="Wähle einen Kurs für deine Frage"
          onChange={handleFetchQuestions}
        >
          {courses.map((course) => {
            return (
              <MenuItem value={course?.id} key={course?.id}>
                {course?.long_name}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      {selectedCourse ? (
        <>
          {currentQuestion.map((question) => {
            {
              console.log(question);
            }
            return (
              <>
                <QuestionDisplay
                  questionText={question?.question_text}
                  answers={[
                    `Antwort A: ${question?.answer_a}`,
                    `Antwort B: ${question?.answer_b}`,
                    `Antwort C: ${question?.answer_c}`,
                    `Antwort D: ${question?.answer_d}`,
                  ]}
                  correctAnswer={question?.correct_answer || "Keine Antwort"}
                />
                ;
                <ButtonGroup
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    sx={{
                      fontWeight: "bold", // Fetterer Text
                      backgroundColor: "#ffffff", // Weißer Hintergrund
                      color: "#333333", // Dunkle Schrift
                      border: "1px solid #333333", // Dünner dunkler Rand
                      "&:hover": {
                        backgroundColor: "#f0f0f0", // Leicht grauer Hintergrund beim Hover
                      },
                    }}
                    variant="outlined"
                    onClick={handleGoToPreviousQuestion}
                  >
                    Zurück
                  </Button>
                  <Button
                    sx={{
                      fontWeight: "bold", // Fetterer Text
                      backgroundColor: "#ffffff", // Weißer Hintergrund
                      color: "#333333", // Dunkle Schrift
                      border: "1px solid #333333", // Dünner dunkler Rand
                      "&:hover": {
                        backgroundColor: "#f0f0f0", // Leicht grauer Hintergrund beim Hover
                      },
                    }}
                    variant="outlined"
                    onClick={handleGoToNextQuestion}
                  >
                    Weiter
                  </Button>
                </ButtonGroup>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 2,
                    gap: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleApproveQuestion}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeclineQuestion}
                  >
                    Not Approve
                  </Button>
                </Box>
                ;
              </>
            );
          })}
        </>
      ) : (
        <div></div>
      )}
      {selectedCourse && questions.length === 0 && (
        <ReviewedAllQuestionsScreen />
      )}
    </div>
  );
};

export default ReviewQuestion;
