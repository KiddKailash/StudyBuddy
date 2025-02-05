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
import VideoCameraFrontIcon from "@mui/icons-material/VideoCameraFront";

import { useTranslation, Trans } from "react-i18next";

const CreateStudySession = () => {
  const BACKEND = import.meta.env.VITE_DIGITAL_OCEAN_URI;

  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const {
    user,
    isLoggedIn,
    flashcardSessions,
    setFlashcardSessions,
    localSessions,
    createLocalSession,
    MAX_EPHEMERAL_SESSIONS,
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
    navigate(`?tab=${newValue}`, { replace: true });
  };

  const handleFetchAndGenerate = async () => {
    // If the selected tab is Notion (2) or Video (3), just show "Coming soon 🚧"
    if (tabValue === 2 || tabValue === 3) {
      showSnackbar(t("feature_under_development"), "info");
      return;
    }

    // For logged-in free users, enforce 2-sessions limit
    if (isLoggedIn && accountType === "free" && flashcardSessions.length >= 2) {
      showSnackbar(t("max_sessions_reached"), "info");
      return;
    }

    // For unauthenticated users, enforce MAX_EPHEMERAL_SESSIONS limit
    if (!isLoggedIn && localSessions.length >= MAX_EPHEMERAL_SESSIONS) {
      showSnackbar(t("max_sessions_reached"), "warning");
      return;
    }

    setLoadingTranscript(true);

    try {
      let transcriptText = "";
      const token = localStorage.getItem("token");

      // Step 1: gather transcript
      if (tabValue === 0) {
        // File upload
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
            `${BACKEND}/api/upload-public`,
            formData
          );
          transcriptText = resp.data.transcript;
        } else {
          // Logged-in route for file upload
          const resp = await axios.post(`${BACKEND}/api/upload`, formData, {
            headers: { Authorization: `Bearer ${token}` },
          });
          transcriptText = resp.data.transcript;
        }
      } else if (tabValue === 1) {
        // Pasted text
        if (!pastedText.trim()) {
          showSnackbar(t("please_paste_text"), "error");
          setLoadingTranscript(false);
          return;
        }
        transcriptText = pastedText.trim();
      }

      // Step 2: Generate flashcards
      let generatedData = [];
      if (!token) {
        const resp = await axios.post(
          `${BACKEND}/api/openai/generate-flashcards-public`,
          { transcript: transcriptText }
        );
        generatedData = resp.data.flashcards;
      } else {
        const resp = await axios.post(
          `${BACKEND}/api/openai/generate-flashcards`,
          { transcript: transcriptText },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        generatedData = resp.data.flashcards;
      }

      // Step 3: Create a session
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
          `${BACKEND}/api/flashcards`,
          {
            sessionName,
            studyCards: flashcardsArray,
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
    <Container
      maxWidth="md"
      sx={{ pt: { xs: 6.5, sm: 10, md: 16 }, textAlign: "center" }}
    >
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
        <Tab icon={<VideoCameraFrontIcon />} label={t("video")} />
      </Tabs>

      {/* Tab 0: Upload Document */}
      {tabValue === 0 && (
        <Box sx={{ mb: 1 }}>
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

      {/* Tab 1: Paste Text */}
      {tabValue === 1 && (
        <TextField
          fullWidth
          label={t("paste_your_text_here")}
          variant="outlined"
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          multiline
          rows={7}
          sx={{ mb: 1, backgroundColor: "background.paper" }}
        />
      )}

      {/* Tab 2: Notion (Coming soon) */}
      {tabValue === 2 && (
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h6">{t("coming_soon")}</Typography>
        </Paper>
      )}

      {/* Tab 3: Video (Coming soon) */}
      {tabValue === 3 && (
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="h6">{t("coming_soon")}</Typography>
        </Paper>
      )}

      <Button
        variant="outlined"
        color="primary"
        onClick={handleFetchAndGenerate}
        disabled={
          loadingTranscript ||
          (isLoggedIn &&
            accountType === "free" &&
            flashcardSessions.length >= 2) ||
          (!isLoggedIn && localSessions.length >= MAX_EPHEMERAL_SESSIONS)
        }
        fullWidth
        sx={{ height: 56, mt: 2 }}
      >
        {loadingTranscript ? (
          <CircularProgress color="inherit" size={24} />
        ) : (
          t("create_flashcards")
        )}
      </Button>

      {/* Inform unauthenticated users about max ephemeral sessions */}
      {!isLoggedIn && localSessions.length >= MAX_EPHEMERAL_SESSIONS && (
        <>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
            {t("max_ephemeral_sessions_reached_message")}
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
            <Trans i18nKey="upgrade_to_create_more">
              <Link
                component="span"
                variant="body1"
                onClick={() => navigate("/checkout")}
              >
                {t("upgrade_your_account")}
              </Link>
            </Trans>
          </Typography>
        </>
      )}

      {/* Inform authenticated free users about max DB sessions */}
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
                  onClick={() => navigate("/checkout")}
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
