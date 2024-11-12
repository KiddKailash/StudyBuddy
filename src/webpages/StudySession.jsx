import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

// MUI Component Imports
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";

// MUI Icon Imports
import UploadFileIcon from "@mui/icons-material/UploadFile";
import YouTubeIcon from "@mui/icons-material/YouTube";
import ContentCutIcon from '@mui/icons-material/ContentCut';

const StudySession = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [error, setError] = useState("");
  const { createFlashcardSession } = useContext(UserContext);
  const navigate = useNavigate();

  // State for Tabs
  const [tabValue, setTabValue] = useState(0); // 0: YouTube, 1: Upload, 2: Paste Text

  // Handle Tab Change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError("");
    // Reset inputs when switching tabs
    setYoutubeUrl("");
    setSelectedFile(null);
    setPastedText("");
  };

  // Handle File Selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFetchAndGenerate = async () => {
    setLoadingTranscript(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User is not authenticated.");

      let transcriptText = "";

      if (tabValue === 0) {
        // YouTube URL Tab
        if (!youtubeUrl.trim()) {
          alert("Please enter a YouTube URL.");
          setLoadingTranscript(false);
          return;
        }

        const transcriptResponse = await axios.get(
          `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/transcript`,
          {
            params: { url: youtubeUrl },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        transcriptText = transcriptResponse.data.transcript;
      } else if (tabValue === 1) {
        // File Upload Tab
        if (!selectedFile) {
          alert("Please select a Word or PDF file.");
          setLoadingTranscript(false);
          return;
        }

        // Validate file type
        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
        ];
        if (!allowedTypes.includes(selectedFile.type)) {
          alert("Please upload a valid Word, PDF, or TXT file.");
          setLoadingTranscript(false);
          return;
        }

        // Prepare FormData
        const formData = new FormData();
        formData.append("file", selectedFile);

        const transcriptResponse = await axios.post(
          `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        transcriptText = transcriptResponse.data.transcript;
      } else if (tabValue === 2) {
        // Paste Text Tab
        if (!pastedText.trim()) {
          alert("Please paste or enter some text.");
          setLoadingTranscript(false);
          return;
        }
        transcriptText = pastedText.trim();
      }

      // Generate Flashcards
      const generatedFlashcards = await generateFlashcards(transcriptText);

      // Create a new study session
      const sessionName = `Session ${new Date().toLocaleString()}`;
      const newSession = await createFlashcardSession(
        sessionName,
        generatedFlashcards
      );

      if (newSession) navigate(`/flashcards/${newSession.id}`);
      else throw new Error("Failed to create flashcard session.");
    } catch (err) {
      console.error("Error:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "An error occurred while processing your request."
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
    <Container maxWidth="md" sx={{ mt: "auto", mb: "auto", pt: 10 }}>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab
          icon={<YouTubeIcon />}
          label="YouTube Video"
          id="tab-0"
          aria-controls="tabpanel-0"
        />
        <Tab
          icon={<UploadFileIcon />}
          label="Upload Document"
          id="tab-1"
          aria-controls="tabpanel-1"
        />
        <Tab
          icon={<ContentCutIcon />}
          label="Paste Text"
          id="tab-2"
          aria-controls="tabpanel-2"
        />
      </Tabs>

      {tabValue === 0 && (
        <Box>
          <TextField
            fullWidth
            label="YouTube Video URL"
            variant="outlined"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            sx={{ mb: 2 }}
          />
        </Box>
      )}

      {tabValue === 1 && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            color="primary"
          >
            {selectedFile ? selectedFile.name : "Choose a Word or PDF Document"}
            <input
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
            />
          </Button>
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <TextField
            fullWidth
            label="Paste Your Text Here"
            variant="outlined"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            multiline
            rows={10}
            sx={{ mb: 2 }}
          />
        </Box>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleFetchAndGenerate}
        disabled={loadingTranscript}
        fullWidth
        sx={{ height: 56 }}
      >
        {loadingTranscript ? (
          <CircularProgress color="inherit" size={24} />
        ) : (
          "Create Flashcards"
        )}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
};

export default StudySession;
