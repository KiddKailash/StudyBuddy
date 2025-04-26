import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import PropTypes from "prop-types";

// Contexts
import { UserContext } from "../contexts/UserContext";
import { SnackbarContext } from "../contexts/SnackbarContext";

// MUI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

// MUI Icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Translation
import { useTranslation } from "react-i18next";

const UploadFile = ({ open, onClose, folderID }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [uploadsLoaded, setUploadsLoaded] = useState(false);
  
  const {
    user,
    isLoggedIn,
    flashcardSessions,
    setFlashcardSessions,
    localSessions,
    createLocalSession,
    MAX_EPHEMERAL_SESSIONS,
    uploadDocumentTranscript,
    generateFlashcardsFromTranscript,
    createDBStudySession,
    fetchUploads,
  } = useContext(UserContext);
  
  const accountType = user?.accountType || "free";
  const { showSnackbar } = useContext(SnackbarContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop: (acceptedFiles) => setSelectedFile(acceptedFiles[0]),
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
  });

  // Only fetch uploads once when dialog opens
  useEffect(() => {
    if (open && isLoggedIn && !uploadsLoaded) {
      console.log("UploadFile: Fetching uploads once");
      fetchUploads()
        .then(() => {
          setUploadsLoaded(true);
        })
        .catch(err => {
          console.error("Error fetching uploads:", err);
        });
    }
    
    // Reset the flag when dialog closes
    if (!open) {
      setUploadsLoaded(false);
    }
  }, [open, isLoggedIn, fetchUploads, uploadsLoaded]);

  const handleUpload = async () => {
    // Enforce session limits
    if (isLoggedIn && accountType === "free" && flashcardSessions.length >= 2) {
      showSnackbar(t("max_sessions_reached"), "info");
      return;
    }
    if (!isLoggedIn && localSessions.length >= MAX_EPHEMERAL_SESSIONS) {
      showSnackbar(t("max_sessions_reached"), "warning");
      return;
    }

    if (!selectedFile) {
      showSnackbar(t("please_select_file"), "error");
      return;
    }

    setLoadingTranscript(true);
    try {
      // Check file type
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

      // Convert folderID from string "null" to actual null if needed
      const convertedFolderID = folderID === "null" ? null : folderID;
      console.log("UploadFile: Uploading with folderID:", convertedFolderID);

      // 1) Upload and get transcript text
      const transcriptText = await uploadDocumentTranscript(selectedFile, convertedFolderID);

      // 2) Generate flashcards from transcript
      const generatedData = await generateFlashcardsFromTranscript(transcriptText);
      const sessionName = generatedData[0];
      const flashcardsArray = generatedData[1];

      // 3) Create a session (local ephemeral or DB-based)
      const token = localStorage.getItem("token");
      if (!token) {
        const sessionId = window.crypto.randomUUID();
        const newSession = {
          id: sessionId,
          studySession: sessionName,
          flashcardsJSON: flashcardsArray,
          transcript: transcriptText,
          createdDate: new Date(),
        };
        createLocalSession(newSession);
        onClose();
        navigate(`/flashcards-local/${sessionId}`);
      } else {
        const createdSession = await createDBStudySession(
          sessionName, 
          flashcardsArray, 
          transcriptText,
          folderID === "null" ? null : folderID
        );
        setFlashcardSessions((prev) => [...prev, createdSession]);
        onClose();
        navigate(`/${folderID}/flashcards/${createdSession.id}`);
      }
      showSnackbar(t("flashcards_created_success"), "success");
    } catch (err) {
      console.error("Error generating session:", err);
      showSnackbar(
        err?.response?.data?.error ||
          err.message ||
          t("error_processing_request"),
        "error"
      );
    } finally {
      setLoadingTranscript(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          p: 2,
        },
      }}
    >
      <DialogTitle>Upload Document</DialogTitle>
      <DialogContent>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={
            !selectedFile || 
            loadingTranscript ||
            (isLoggedIn &&
              accountType === "free" &&
              flashcardSessions.length >= 2) ||
            (!isLoggedIn && localSessions.length >= MAX_EPHEMERAL_SESSIONS)
          }
        >
          {loadingTranscript ? (
            <CircularProgress color="inherit" size={24} />
          ) : (
            "Upload"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

UploadFile.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  folderID: PropTypes.string,
};

UploadFile.defaultProps = {
  folderID: "null",
};

export default UploadFile; 