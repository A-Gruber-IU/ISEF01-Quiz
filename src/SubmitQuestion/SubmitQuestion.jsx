import React, { useEffect, useState } from "react";

//CSS
import "./submitquestion.css";

//Material UI Imports
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";

import { useFirebase } from "../useFirebase";
import { addDoc, collection, doc, getDocs } from "firebase/firestore";

const SubmitQuestion = () => {
  const [question, setQuestion] = useState("");
  const [answerA, setAnswerA] = useState("");
  const [answerB, setAnswerB] = useState("");
  const [answerC, setAnswerC] = useState("");
  const [answerD, setAnswerD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  const { auth, firestore } = useFirebase();

  const userID = auth?.currentUser?.uid;

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      if (selectedCourse) {
        console.log(selectedCourse);
        const coursesRef = doc(firestore, "courses", selectedCourse);
        const questionRef = collection(coursesRef, "questions");
        const questionDoc = await addDoc(questionRef, {
          authorId: userID,
          reviewed: false,
          question_text: question,
          answer_a: answerA,
          answer_b: answerB,
          answer_c: answerC,
          answer_d: answerD,
          correct_answer: correctAnswer,
          reviewerID: "",
        });

        setQuestion("");
        setAnswerA("");
        setAnswerB("");
        setAnswerC("");
        setAnswerD("");
        setCorrectAnswer("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCourses = async () => {
    const coursesRef = collection(firestore, "courses");
    const coursesDoc = await getDocs(coursesRef);
    if (!coursesDoc.empty) {
      const myCourses = [];
      for (const course of coursesDoc.docs) {
        myCourses.push({ ...course.data(), id: course.id });
      }
      setCourses(myCourses);
      console.log(myCourses);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [firestore]);

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
      <form onSubmit={handleAddQuestion} className="form-container">
        <TextField
          sx={{ marginBottom: 2 }}
          required
          label="Enter a question"
          variant="outlined"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
          }}
        />
        <TextField
          sx={{ marginBottom: 2 }}
          label="Answer A"
          variant="outlined"
          required
          value={answerA}
          onChange={(e) => {
            setAnswerA(e.target.value);
          }}
        />
        <TextField
          sx={{ marginBottom: 2 }}
          required
          label="Answer B"
          variant="outlined"
          value={answerB}
          onChange={(e) => {
            setAnswerB(e.target.value);
          }}
        />
        <TextField
          sx={{ marginBottom: 2 }}
          required
          label="Answer C"
          variant="outlined"
          value={answerC}
          onChange={(e) => {
            setAnswerC(e.target.value);
          }}
        />
        <TextField
          sx={{ marginBottom: 2 }}
          required
          label="Answer D"
          variant="outlined"
          value={answerD}
          onChange={(e) => {
            setAnswerD(e.target.value);
          }}
        />
        <FormControl required fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel id="selectedCourse">
            Wähle einen Kurs für deine Frage
          </InputLabel>
          <Select
            labelId="selectedCourse"
            id="selectedCourse"
            value={selectedCourse}
            label="Wähle einen Kurs für deine Frage"
            onChange={(e) => setSelectedCourse(e.target.value)}
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

        <FormControl required fullWidth sx={{ marginBottom: 2 }}>
          <InputLabel>Option wählen</InputLabel>
          <Select
            labelId="correctAnswer"
            id="correctAnswer"
            value={correctAnswer}
            label="Wähle die richtige Antwort"
            onChange={(e) => setCorrectAnswer(e.target.value)}
          >
            <MenuItem value={"A"}>Antwort A</MenuItem>
            <MenuItem value={"B"}>Antwort B</MenuItem>
            <MenuItem value={"C"}>Antwort C</MenuItem>
            <MenuItem value={"D"}>Antwort D</MenuItem>
          </Select>
        </FormControl>
        <Button
          type="submit" // Wichtig: Button als Submit-Button festlegen
          variant="contained"
          color="primary"
        >
          Frage hinzufügen
        </Button>
      </form>
    </div>
  );
};

export default SubmitQuestion;
