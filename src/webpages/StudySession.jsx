import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

// MUI Component Imports
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

const StudySession = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [error, setError] = useState("");
  const { createFlashcardSession } = useContext(UserContext);
  const navigate = useNavigate();

  const handleUrlChange = (event) => {
    setYoutubeUrl(event.target.value);
  };

  const handleFetchAndGenerate = async () => {
    if (!youtubeUrl.trim()) {
      alert("Please enter a YouTube URL.");
      return;
    }

    setLoadingTranscript(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User is not authenticated.");

      const transcriptResponse = await axios.get(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/transcript`,
        {
          params: { url: youtubeUrl },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const generatedFlashcards = await generateFlashcards(
        transcriptResponse.data.transcript
      );

      const sessionName = `Session ${new Date().toLocaleString()}`;
      const newSession = await createFlashcardSession(sessionName, generatedFlashcards);

      if (newSession) navigate(`/flashcards/${newSession.id}`);
      else throw new Error("Failed to create flashcard session.");
    } catch (err) {
      console.error("Error:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "An error occurred while fetching transcript or generating flashcards."
      );
    } finally {
      setLoadingTranscript(false);
    }
  };

  const generateFlashcards = async (transcriptText) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User is not authenticated.");

    const response = await axios.post(
      `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/openai/generate-flashcards`,
      { transcript: transcriptText },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.flashcards;
  };

  return (
    <Container maxWidth="md" sx={{ mt: "auto", mb: "auto" }}>
      <Box sx={{ display: "flex", mt: 10, mb: 2 }}>
        <TextField
          fullWidth
          label="YouTube Video URL"
          variant="outlined"
          value={youtubeUrl}
          onChange={handleUrlChange}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleFetchAndGenerate}
          disabled={loadingTranscript}
          sx={{ ml: 2 }}
        >
          {loadingTranscript ? <CircularProgress size={24} /> : "Create Flashcards"}
        </Button>
      </Box>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Container>
  );
};

export default StudySession;
