import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { SnackbarContext } from "../contexts/SnackbarContext";
import { redirectToStripeCheckout } from "../utils/redirectToStripeCheckout";

// MUI Component Imports
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

// MUI Icon Imports
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ContentCutIcon from "@mui/icons-material/ContentCut";

// Import the useTranslation hook and Trans component
import { useTranslation, Trans } from 'react-i18next';

const StudySession = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  const { user, flashcardSessions, setFlashcardSessions } = useContext(UserContext);
  const accountType = user?.accountType || "free";

  const { showSnackbar } = useContext(SnackbarContext);
  const navigate = useNavigate();

  // Initialize the translation function
  const { t } = useTranslation();

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
      showSnackbar(t("max_sessions_reached"), "info");
      return;
    }

    setLoadingTranscript(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("user_not_authenticated"));

      let transcriptText = "";

      if (tabValue === 0) {
        // File Upload Tab
        if (!selectedFile) {
          showSnackbar(t("please_select_file"), "error");
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
          showSnackbar(t("invalid_file_type"), "error");
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
          showSnackbar(t("please_paste_text"), "error");
          setLoadingTranscript(false);
          return;
        }
        transcriptText = pastedText.trim();
      }

      // Generate Flashcards
      const generatedFlashcards = await generateFlashcards(transcriptText);

      // Create a new study session with transcript
      const sessionName = `${t("session")} ${new Date().toLocaleString()}`;
      const newSession = await createFlashcardSession(
        sessionName,
        generatedFlashcards,
        transcriptText // Include transcript
      );

      if (newSession) {
        setFlashcardSessions((prev) => [...prev, newSession]);
        navigate(`/flashcards/${newSession.id}`);
        showSnackbar(t("flashcards_created_success"), "success");
      } else {
        throw new Error(t("failed_to_create_session"));
      }
    } catch (err) {
      console.error("Error:", err);
      showSnackbar(
        err.response?.data?.error || err.message || t("error_processing_request"),
        "error"
      );
    } finally {
      setLoadingTranscript(false);
    }
  };

  const generateFlashcards = async (transcriptText) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error(t("user_not_authenticated"));

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
    if (!token) throw new Error(t("user_not_authenticated"));

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
          label={t("upload_document")}
          id="tab-0"
          aria-controls="tabpanel-0"
        />
        <Tab
          icon={<ContentCutIcon />}
          label={t("paste_text")}
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
            {selectedFile ? selectedFile.name : t("choose_document")}
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
            label={t("paste_your_text_here")}
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
          t("create_flashcards")
        )}
      </Button>

      {accountType === "free" && flashcardSessions.length >= 2 && (
        <>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
            {t("max_sessions_reached_message")}
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
            <Trans i18nKey="upgrade_to_create_more">
              <Link
                component="button"
                variant="body1"
                onClick={() => redirectToStripeCheckout("paid", showSnackbar)}
              >
                {t("upgrade_your_account")}
              </Link>
            </Trans>
          </Typography>
        </>
      )}
    </Container>
  );
};

export default StudySession;
