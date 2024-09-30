import React from "react";
import { Typography, Button, Box } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Link } from "react-router-dom";

const ReviewedAllQuestionsScreen = ({ handleGoBack }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "40px",
        textAlign: "center",
        gap: 2,
      }}
    >
      <CheckCircleOutlineIcon color="success" sx={{ fontSize: 100 }} />
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        Du hast alle übermittelten Fragen überprüft!
      </Typography>
      <Typography variant="subtitle1">
        Es gibt keine weiteren Fragen, die auf eine Überprüfung warten.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        to="/"
        sx={{ marginTop: 3 }}
      >
        Zurück zur Startseite
      </Button>
    </Box>
  );
};

export default ReviewedAllQuestionsScreen;
