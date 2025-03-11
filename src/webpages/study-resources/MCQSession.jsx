import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// MUI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

// MUI Icons
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

// Contexts
import { UserContext } from "../../contexts/UserContext";
import PageWrapper from "../../components/PageWrapper";

const MCQSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(UserContext);

  // Quiz state
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Which question is currently displayed
  const [currentIndex, setCurrentIndex] = useState(0);
  // userAnswers[i] = index of the selected option for question i (or null if not selected yet)
  const [userAnswers, setUserAnswers] = useState([]);

  // ----------------------------
  // 1) FETCH QUIZ
  // ----------------------------
  useEffect(() => {
    if (!isLoggedIn) {
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
        const fetchedQuiz = response.data.data;
        setQuiz(fetchedQuiz);

        // Initialize userAnswers array with null for each question
        if (fetchedQuiz?.questionsJSON) {
          setUserAnswers(Array(fetchedQuiz.questionsJSON.length).fill(null));
        }
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

  // Loading / Error states
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (errorMessage || !quiz) {
    return (
      <>
        <Typography color="error" gutterBottom>
          {errorMessage || "Quiz not found."}
        </Typography>
        <Typography
          sx={{ textDecoration: "underline", cursor: "pointer" }}
          onClick={() => navigate("/create")}
        >
          Go back home
        </Typography>
      </>
    );
  }

  // ----------------------------
  // 2) QUESTIONS + USER SELECTION
  // ----------------------------
  const questionsArray = quiz.questionsJSON || [];
  const currentQ = questionsArray[currentIndex];
  const selectedIdx = userAnswers[currentIndex];

  // When user clicks an option
  const handleSelectOption = (qIndex, optionIndex) => {
    // If already answered, do not allow changes
    if (userAnswers[qIndex] !== null) return;

    const updated = [...userAnswers];
    updated[qIndex] = optionIndex;
    setUserAnswers(updated);
  };

  // Convert selectedIdx -> letter, then compare to correct answer
  let isCorrect = false;
  if (selectedIdx !== null) {
    const selectedLetter = String.fromCharCode(65 + selectedIdx);
    isCorrect = selectedLetter === currentQ.answer;
  }

  // Navigation
  const handleNext = () => {
    if (currentIndex < questionsArray.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // ----------------------------
  // 3) SIDEBAR ICONS
  // ----------------------------
  // For each question, determine which icon to show:
  // - Unanswered => RadioButtonUncheckedIcon
  // - Correct => CheckCircleRoundedIcon
  // - Incorrect => CancelRoundedIcon
  const getSidebarIcon = (questionIndex) => {
    const answerIdx = userAnswers[questionIndex];
    if (answerIdx === null) {
      return (
        <RadioButtonUncheckedIcon
          fontSize="small"
          sx={{ color: "text.disabled" }}
        />
      );
    }
    // If answered, check correctness
    const letter = String.fromCharCode(65 + answerIdx);
    const correct = letter === questionsArray[questionIndex].answer;
    return correct ? (
      <CheckCircleRoundedIcon fontSize="small" color="success" />
    ) : (
      <CancelRoundedIcon fontSize="small" color="error" />
    );
  };

  // ----------------------------
  // 4) LAYOUT WITH LEFT SIDEBAR + MAIN CONTENT
  // ----------------------------
  return (
    <Box sx={{ display: "flex", height: "100%", flexGrow: 1 }}>
      {/* Left Sidebar: question list */}
      <Box
        sx={{
          maxWidth: 180,
          py: 3.5,
          px: 1.5,
          borderRight: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          {quiz.studySession}
        </Typography>
        {questionsArray.map((q, i) => {
          const isActive = i === currentIndex;
          return (
            <Box
              key={i}
              onClick={() => setCurrentIndex(i)}
              sx={{
                p: 1,
                mb: 1,
                borderRadius: 1,
                cursor: "pointer",
                color: isActive ? "text.primary" : "text.secondary",
                bgcolor: isActive ? "background.default" : "transparent",
                "&:hover": {
                  bgcolor: isActive ? "background.default" : "background.paper",
                },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                {getSidebarIcon(i)}
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: isActive ? 600 : 400 }}
                >
                  Question {i + 1}
                </Typography>
              </Stack>
            </Box>
          );
        })}
      </Box>

      <PageWrapper>
        {/* Main Content Area */}
        {/* Question Title */}
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          {currentQ.question}
        </Typography>

        {/* Options */}
        {currentQ.options.map((option, i) => {
          const isSelected = selectedIdx === i;
          // Determine border color or background highlight
          let borderColor = "transparent";
          if (selectedIdx !== null && isSelected) {
            borderColor = isCorrect ? "success.light" : "error.light";
          }

          return (
            <Box
              key={i}
              onClick={() => handleSelectOption(currentIndex, i)}
              sx={{
                border: "2px solid",
                borderColor,
                bgcolor: "background.paper",
                borderRadius: 2,
                p: 1.5,
                my: 1,
                cursor: selectedIdx === null ? "pointer" : "default",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                {/* Icon if selected */}
                {selectedIdx !== null &&
                  isSelected &&
                  (isCorrect ? (
                    <CheckCircleRoundedIcon fontSize="small" color="success" />
                  ) : (
                    <CancelRoundedIcon fontSize="small" color="error" />
                  ))}
                <Typography variant="body1">
                  {String.fromCharCode(65 + i)}. {option}
                </Typography>
              </Stack>
            </Box>
          );
        })}

        {/* Feedback/Explanation */}
        {selectedIdx !== null && !isCorrect && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              border: "2px solid",
              borderColor: "error.light",
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Explanation
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {currentQ.explanation}
            </Typography>
          </Box>
        )}

        {/* Bottom Navigation */}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          sx={{ mt: 4 }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowLeftIcon />}
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            endIcon={<ArrowRightIcon />}
            onClick={handleNext}
            disabled={currentIndex === questionsArray.length - 1}
          >
            Next
          </Button>
        </Stack>
      </PageWrapper>
    </Box>
  );
};

export default MCQSession;
