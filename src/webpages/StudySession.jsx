import React, { useState } from "react";
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  Alert,
} from "@mui/material";
import Flashcard from "../components/FlashCard";
import { useNavigate } from 'react-router-dom';

const StudySession = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleUrlChange = (event) => {
    setYoutubeUrl(event.target.value);
  };

  const generateSessionName = () => {
    const now = new Date();
    return `Session ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  };

  const handleFetchAndGenerate = async () => {
    if (!youtubeUrl.trim()) {
      alert("Please enter a YouTube URL.");
      return;
    }

    setLoadingTranscript(true);
    setError("");
    setSuccessMessage("");
    setTranscript("");
    setFlashcards([]);

    try {
      // Fetch Transcript
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User is not authenticated.");
      }

      const transcriptResponse = await axios.get(`${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/transcript`, {
        params: { url: youtubeUrl },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTranscript(transcriptResponse.data.transcript);

      // Generate Flashcards via OpenAI
      const generatedFlashcards = await generateFlashcards(transcriptResponse.data.transcript);
      setFlashcards(generatedFlashcards);
      setSuccessMessage("Flashcards generated successfully!");

      // Automatically Save Flashcards
      const sessionName = generateSessionName();
      await saveFlashcards(sessionName, generatedFlashcards);
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

  const saveFlashcards = async (sessionName, flashcardsToSave) => {
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User is not authenticated.");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/flashcards`,
        {
          sessionName, // This will be mapped to StudySession in backend
          studyCards: flashcardsToSave, // This will be mapped to FlashcardsJSON in backend
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Flashcards saved successfully!");

      // Redirect to the newly created flashcard session
      navigate(`/flashcards/${response.data.flashcard.id}`);
    } catch (err) {
      console.error("Error saving flashcards:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "An error occurred while saving flashcards."
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * Generates flashcards using OpenAI API.
   * Assumes you have a backend endpoint to handle OpenAI requests securely.
   */
  const generateFlashcards = async (transcriptText) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User is not authenticated.");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/openai/generate-flashcards`,
        { transcript: transcriptText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.flashcards; // Assumes backend returns { flashcards: [...] }
    } catch (err) {
      console.error("Error generating flashcards via OpenAI:", err);
      throw err;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 'auto', mb: 'auto' }}>

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
          disabled={loadingTranscript || saving}
          sx={{ ml: 2 }}
        >
          {loadingTranscript || saving ? <CircularProgress size={24} /> : "Create Flashcards"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {flashcards.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Generated Flashcards:</Typography>
          <List>
            {flashcards.map((card, index) => (
              <ListItem key={index} sx={{ mb: 1, bgcolor: "#f9f9f9", borderRadius: 1 }}>
                <Flashcard question={card.question} answer={card.answer} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Container>
  );
};

StudySession.propTypes = {};

export default StudySession;
