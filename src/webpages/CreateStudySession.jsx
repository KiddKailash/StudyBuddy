import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
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
import Paper from "@mui/material/Paper";

// MUI Icon Imports
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import NoteIcon from "@mui/icons-material/Note";

// Import the useTranslation hook and Trans component
import { useTranslation, Trans } from "react-i18next";

const StudySession = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0: Upload, 1: Paste, 2: Notion
  const [notionAuthorized, setNotionAuthorized] = useState(false);
  const [notionPageContent, setNotionPageContent] = useState("");

  const { user, flashcardSessions, setFlashcardSessions } = useContext(UserContext);
  const accountType = user?.accountType || "free";
  const { showSnackbar } = useContext(SnackbarContext);
  const navigate = useNavigate();

  // Initialize the translation function
  const { t } = useTranslation();

  // Check authorization with Notion on component mount or user change
  useEffect(() => {
    // Example: Check if user has already authorized Notion
    // Your backend might provide an endpoint like `/api/notion/is-authorized`
    const checkNotionAuthorization = async () => {
      const token = localStorage.getItem("token");
      if (!token) return; // user not logged in
      try {
        const response = await axios.get(`${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/notion/is-authorized`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotionAuthorized(response.data.authorized);
      } catch (err) {
        console.error("Error checking Notion authorization:", err);
      }
    };

    checkNotionAuthorization();
  }, [user]);

  // Handle Tab Change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset inputs when switching tabs
    setSelectedFile(null);
    setPastedText("");
    setNotionPageContent("");
  };

  // Handle File Selection
  const handleFileChange = (acceptedFiles) => {
    setSelectedFile(acceptedFiles[0]);
  };

  const handleNotionAuthorization = async () => {
    // Get the authorization URL from the backend
    const token = localStorage.getItem("token");
    if (!token) {
      showSnackbar(t("user_not_authenticated"), "error");
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/notion/auth-url`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const authUrl = response.data.url;
      // Redirect the user to the Notion OAuth URL
      window.location.href = authUrl;
    } catch (err) {
      console.error("Error getting Notion auth URL:", err);
      showSnackbar(t("error_processing_request"), "error");
    }
  };

  const fetchNotionPageContent = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showSnackbar(t("user_not_authenticated"), "error");
      return;
    }

    try {
      // For simplicity, let's say we have a single page ID stored or we prompt the user to set it somewhere else
      const response = await axios.get(`${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/notion/page-content`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotionPageContent(response.data.content);
      showSnackbar(t("notion_content_fetched"), "success");
    } catch (err) {
      console.error("Error fetching Notion page content:", err);
      showSnackbar(t("error_processing_request"), "error");
    }
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
      } else if (tabValue === 2) {
        // Notion Tab
        if (!notionAuthorized) {
          showSnackbar(t("notion_not_authorized"), "error");
          setLoadingTranscript(false);
          return;
        }
        if (!notionPageContent.trim()) {
          showSnackbar(t("no_notion_content"), "error");
          setLoadingTranscript(false);
          return;
        }
        transcriptText = notionPageContent.trim();
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
        err.response?.data?.error ||
          err.message ||
          t("error_processing_request"),
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

  // React Dropzone setup
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles,
    fileRejections,
  } = useDropzone({
    onDrop: handleFileChange,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
  });

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 6.5, sm: 10 } }}>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          mb: 3,
          "& .MuiTab-root": {
            outline: "none", // Removes focus outline for tabs
          },
        }}
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
        <Tab
          icon={<NoteIcon />}
          label={t("notion_page")}
          id="tab-2"
          aria-controls="tabpanel-2"
        />
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
        <Box>
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
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          {!notionAuthorized ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNotionAuthorization}
              fullWidth
              sx={{ mb: 2 }}
            >
              {t("authorize_notion")}
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                color="primary"
                onClick={fetchNotionPageContent}
                fullWidth
                sx={{ mb: 2 }}
              >
                {t("fetch_notion_content")}
              </Button>
              {notionPageContent && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {t("notion_content_preview")}
                  </Typography>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body1">
                      {notionPageContent.length > 200
                        ? notionPageContent.substring(0, 200) + "..."
                        : notionPageContent}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </>
          )}
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
