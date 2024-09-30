import React from "react";
import { Box, Typography, Divider, Paper } from "@mui/material";

const QuestionDisplay = ({ questionText, answers, correctAnswer }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      {/* Paper for the question and answers */}
      <Paper
        elevation={3}
        sx={{
          padding: 3,
          width: "100%",
          maxWidth: 600,
        }}
      >
        {/* Display the question */}
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 2,
          }}
        >
          {questionText}
        </Typography>

        {/* Divider for better visual separation */}
        <Divider sx={{ marginBottom: 2 }} />

        {/* Display the answers */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {answers.map((answer, index) => (
            <Typography
              key={index}
              variant="body1"
              sx={{
                padding: 1,
                backgroundColor:
                  answer === correctAnswer ? "lightgreen" : "lightgrey",
                borderRadius: 1,
                textAlign: "center",
              }}
            >
              {answer}
            </Typography>
          ))}
        </Box>

        {/* Divider and correct answer display */}
        <Divider sx={{ marginY: 2 }} />
        <Typography
          variant="body2"
          sx={{ fontStyle: "italic", textAlign: "center" }}
        >
          Richtige Antwort: {correctAnswer}
        </Typography>
      </Paper>
    </Box>
  );
};

export default QuestionDisplay;
