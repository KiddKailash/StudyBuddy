import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { SnackbarContext } from "../contexts/SnackbarContext";

// MUI Component Imports
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";

// MUI Icon Imports
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ContentCutIcon from "@mui/icons-material/ContentCut";

const StudySession = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  const { user, flashcardSessions, setFlashcardSessions } =
    useContext(UserContext); // Include flashcardSessions
  const accountType = user?.accountType || "free";

  const { showSnackbar } = useContext(SnackbarContext);
  const navigate = useNavigate();

  // State for Tabs
  const [tabValue, setTabValue] = useState(0); // 0: Upload Document, 1: Paste Text

  // Handle Tab Change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset inputs when switching tabs
    setSelectedFile(null);
    setPastedText("");
  };

  // Handle File Selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFetchAndGenerate = async () => {
    // Check for session limit
    if (accountType === "free" && flashcardSessions.length >= 2) {
      showSnackbar(
        "You have reached the maximum number of study sessions allowed for free accounts. Please upgrade to create more sessions.",
        "info"
      );
      return;
    }

    setLoadingTranscript(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User is not authenticated.");

      let transcriptText = "";

      if (tabValue === 0) {
        // File Upload Tab
        if (!selectedFile) {
          showSnackbar("Please select a Word or PDF file.", "error");
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
          showSnackbar(
            "Please upload a valid Word, PDF, or TXT file.",
            "error"
          );
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
      } else if (tabValue === 1) {
        // Paste Text Tab
        if (!pastedText.trim()) {
          showSnackbar("Please paste or enter some text.", "error");
          setLoadingTranscript(false);
          return;
        }
        transcriptText = pastedText.trim();
      }

      // Generate Flashcards
      const generatedFlashcards = await generateFlashcards(transcriptText);

      // Create a new study session with transcript
      const sessionName = `Session ${new Date().toLocaleString()}`;
      const newSession = await createFlashcardSession(
        sessionName,
        generatedFlashcards,
        transcriptText // Include transcript
      );

      if (newSession) {
        setFlashcardSessions((prev) => [...prev, newSession]);
        navigate(`/flashcards/${newSession.id}`);
        showSnackbar("Flashcards created successfully.", "success");
      } else {
        throw new Error("Failed to create flashcard session.");
      }
    } catch (err) {
      console.error("Error:", err);
      showSnackbar(
        err.response?.data?.error ||
          err.message ||
          "An error occurred while processing your request.",
        "error"
      );
    } finally {
      setLoadingTranscript(false);
    }
  };

  const generateFlashcards = async (transcriptText) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User is not authenticated.");

    const response = await axios.post(
      `${
        import.meta.env.VITE_LOCAL_BACKEND_URL
      }/api/openai/generate-flashcards`,
      { transcript: transcriptText },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.flashcards;
  };

  /**
   * Creates a new flashcard session.
   *
   * @param {string} sessionName - The name of the session.
   * @param {Array} studyCards - The generated flashcards.
   * @param {string} transcriptText - The transcript used to generate flashcards.
   * @returns {Object} The newly created session.
   */
  const createFlashcardSession = async (
    sessionName,
    studyCards,
    transcriptText
  ) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User is not authenticated.");

    const response = await axios.post(
      `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/flashcards`,
      {
        sessionName,
        studyCards,
        transcript: transcriptText, // Include transcript
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.flashcard;
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
          icon={<UploadFileIcon />}
          label="Upload Document"
          id="tab-0"
          aria-controls="tabpanel-0"
        />
        <Tab
          icon={<ContentCutIcon />}
          label="Paste Text"
          id="tab-1"
          aria-controls="tabpanel-1"
        />
      </Tabs>

      {tabValue === 0 && (
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

      {tabValue === 1 && (
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
        disabled={
          loadingTranscript ||
          (accountType === "free" && flashcardSessions.length >= 2)
        }
        fullWidth
        sx={{ height: 56 }}
      >
        {loadingTranscript ? (
          <CircularProgress color="inherit" size={24} />
        ) : (
          "Create Flashcards"
        )}
      </Button>
      
      {accountType === "free" && flashcardSessions.length >= 2 && (
        <>
          <Typography variant="body1" color="textSecondary" sx={{mt: 2}}>
            You have reached the maximum number of study sessions allowed for a
            free account.
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
            <Link to="/upgrade">Upgrade the account</Link> to create more
            sessions.
          </Typography>
        </>
      )}
    </Container>
  );
};

export default StudySession;
