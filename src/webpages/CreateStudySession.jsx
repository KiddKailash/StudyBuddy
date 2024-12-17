import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import queryString from "query-string";

import { UserContext } from "../contexts/UserContext";
import { SnackbarContext } from "../contexts/SnackbarContext";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FilterDramaRoundedIcon from "@mui/icons-material/FilterDramaRounded";

import { useTranslation, Trans } from "react-i18next";
import NotionIntegration from "../components/NotionIntegration";
import { redirectToStripeCheckout } from "../utils/redirectToStripeCheckout";

const CreateStudySession = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [notionText, setNotionText] = useState("");
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const {
    user,
    isLoggedIn,
    flashcardSessions,
    setFlashcardSessions,
    localSessions,
    createLocalSession,
  } = useContext(UserContext);

  const accountType = user?.accountType || "free";
  const { showSnackbar } = useContext(SnackbarContext);

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Dropzone
  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop: (acceptedFiles) => setSelectedFile(acceptedFiles[0]),
      accept: {
        "application/pdf": [".pdf"],
        "application/msword": [".doc"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
        "text/plain": [".txt"],
      },
      maxFiles: 1,
    });

  useEffect(() => {
    const { tab } = queryString.parse(location.search);
    setTabValue(Number(tab) || 0);
  }, [location.search]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedFile(null);
    setPastedText("");
    setNotionText("");
    navigate(`?tab=${newValue}`, { replace: true });
  };

  const handleFetchAndGenerate = async () => {
    // For logged-in free users, enforce 2-sessions limit
    if (isLoggedIn && accountType === "free" && flashcardSessions.length >= 2) {
      showSnackbar(t("max_sessions_reached"), "info");
      return;
    }
    setLoadingTranscript(true);

    try {
      let transcriptText = "";
      const token = localStorage.getItem("token");

      // Step 1: gather transcript
      if (tabValue === 0) {
        if (!selectedFile) {
          showSnackbar(t("please_select_file"), "error");
          setLoadingTranscript(false);
          return;
        }
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

        const formData = new FormData();
        formData.append("file", selectedFile);

        if (!token) {
          // Public route for file upload
          const resp = await axios.post(
            `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/upload-public`,
            formData
          );
          transcriptText = resp.data.transcript;
        } else {
          // Logged-in route for file upload
          const resp = await axios.post(
            `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/upload`,
            formData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          transcriptText = resp.data.transcript;
        }
      } else if (tabValue === 1) {
        if (!pastedText.trim()) {
          showSnackbar(t("please_paste_text"), "error");
          setLoadingTranscript(false);
          return;
        }
        transcriptText = pastedText.trim();
      } else if (tabValue === 2) {
        if (!notionText.trim()) {
          showSnackbar(t("notion_content_empty"), "error");
          setLoadingTranscript(false);
          return;
        }
        transcriptText = notionText.trim();
      }

      // Step 2: Generate flashcards (both public and private routes now return the same data format: [sessionName, flashcardsArray])
      let generatedData = [];
      if (!token) {
        const resp = await axios.post(
          `${
            import.meta.env.VITE_LOCAL_BACKEND_URL
          }/api/openai/generate-flashcards-public`,
          { transcript: transcriptText }
        );
        // 'resp.data.flashcards' is the entire 2-element array: [sessionName, [...flashcards]]
        generatedData = resp.data.flashcards;
      } else {
        const resp = await axios.post(
          `${
            import.meta.env.VITE_LOCAL_BACKEND_URL
          }/api/openai/generate-flashcards`,
          { transcript: transcriptText },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        generatedData = resp.data.flashcards;
      }

      // Step 3: Create a session in DB if logged in, or local if not
      const sessionName = generatedData[0];
      const flashcardsArray = generatedData[1];

      if (!token) {
        // free-tier local session
        const sessionId = window.crypto.randomUUID();
        const newSession = {
          id: sessionId,
          studySession: sessionName,
          flashcardsJSON: flashcardsArray,
          transcript: transcriptText,
          createdDate: new Date(),
        };
        createLocalSession(newSession);
        navigate(`/flashcards-local/${sessionId}`);
      } else {
        // DB-based session
        const dbResp = await axios.post(
          `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/flashcards`,
          {
            sessionName,
            studyCards: flashcardsArray, // <--- Just the flashcards array
            transcript: transcriptText,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const createdSession = dbResp.data.flashcard;
        setFlashcardSessions((prev) => [...prev, createdSession]);
        navigate(`/flashcards/${createdSession.id}`);
      }

      showSnackbar(t("flashcards_created_success"), "success");
    } catch (err) {
      console.error("Error generating session:", err);
      showSnackbar(
        err.response?.data?.error ||
          err.message ||
          t("error_processing_request"),
        "error"
      );
    } finally {
      setLoadingTranscript(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ pt: { xs: 6.5, sm: 10 } }}>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          mb: 3,
          "& .MuiTab-root": { outline: "none" },
        }}
      >
        <Tab icon={<UploadFileIcon />} label={t("upload_document")} />
        <Tab icon={<ContentCutIcon />} label={t("paste_text")} />
        <Tab icon={<FilterDramaRoundedIcon />} label={t("notion")} />
      </Tabs>

      {tabValue === 0 && (
        <Box sx={{ mb: 2 }}>
          <Paper
            variant="outlined"
            {...getRootProps()}
            sx={{
              padding: 4,
              textAlign: "center",
              backgroundColor: isDragActive ? "grey.200" : "background.paper",
              borderColor: isDragActive ? "primary.main" : "grey.400",
              cursor: "pointer",
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 48, color: "primary.main" }} />
            {selectedFile ? (
              <Typography variant="body1" color="textSecondary">
                {selectedFile.name}
              </Typography>
            ) : (
              <Typography variant="body1" color="textSecondary">
                {t("drag_drop_or_click")}
              </Typography>
            )}
          </Paper>
          {fileRejections.length > 0 && (
            <Typography color="error" sx={{ mt: 2 }}>
              {t("invalid_file_type")}
            </Typography>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <TextField
          fullWidth
          label={t("paste_your_text_here")}
          variant="outlined"
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          multiline
          rows={7}
          sx={{ mb: 2 }}
        />
      )}

      {tabValue === 2 && <NotionIntegration />}

      <Button
        variant="contained"
        color="primary"
        onClick={handleFetchAndGenerate}
        disabled={
          loadingTranscript ||
          (isLoggedIn &&
            accountType === "free" &&
            flashcardSessions.length >= 2)
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

      {isLoggedIn &&
        accountType === "free" &&
        flashcardSessions.length >= 2 && (
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

export default CreateStudySession;
