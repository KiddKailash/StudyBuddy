import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import axios from "axios";

// MUI
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";

const MCQSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(UserContext);

  // Local states: quiz data, loading, and error
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // On mount or whenever `id` changes, fetch the quiz by ID
  useEffect(() => {
    if (!isLoggedIn) {
      // If not logged in, redirect or set an error
      setErrorMessage("You must be logged in to view this quiz.");
      setLoading(false);
      return;
    }

    const fetchQuizById = async () => {
      try {
        setLoading(true);
        const localToken = localStorage.getItem("token");
        if (!localToken) {
          setErrorMessage("No access token found. Please log in again.");
          setLoading(false);
          return;
        }

        const BACKEND = import.meta.env.VITE_DIGITAL_OCEAN_URI;
        const response = await axios.get(
          `${BACKEND}/api/multiple-choice-quizzes/${id}`,
          { headers: { Authorization: `Bearer ${localToken}` } }
        );

        // The quiz data is typically in response.data.data
        // depending on how your backend returns it:
        // { data: { title, questionsJSON } }
        const fetchedQuiz = response.data.data;
        setQuiz(fetchedQuiz);
      } catch (error) {
        console.error("Error fetching MCQ quiz:", error);
        setErrorMessage(
          error.response?.data?.error ||
            "Error fetching quiz. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuizById();
  }, [id, isLoggedIn]);

  // If still loading, show spinner
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "80%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If an error occurred or quiz not found, display message
  if (errorMessage || !quiz) {
    return (
      <Container
        maxWidth="md"
        sx={{ mt: 1, mb: 2, transition: "all 0.3s ease-in-out" }}
      >
        <Typography color="error" gutterBottom>
          {errorMessage || "Quiz not found."}
        </Typography>
        <Typography
          sx={{ textDecoration: "underline", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Go back home
        </Typography>
      </Container>
    );
  }

  // Otherwise, display the quiz
  return (
    <Container
      maxWidth="md"
      sx={{ mt: 1, mb: 2, transition: "all 0.3s ease-in-out", textAlign: 'left' }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{ textAlign: "left", fontWeight: 600, mb: 2, mt: 2 }}
      >
        {quiz.studySession}
      </Typography>

      {quiz.questionsJSON?.map((q, index) => (
        <Box key={index} sx={{ my: 2 }}>
          <Typography>
            {index + 1}. {q.question}
          </Typography>
          {q.options?.map((option, idx) => (
            <Typography key={idx}>
              {String.fromCharCode(65 + idx)}. {option}
            </Typography>
          ))}
        </Box>
      ))}
    </Container>
  );
};

export default MCQSession;
