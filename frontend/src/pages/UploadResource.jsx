import React, { useState, useContext, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate, useParams } from "react-router-dom";
import PropTypes from "prop-types";

// Contexts
import { SnackbarContext } from "../contexts/Snackbar";
import { UserContext } from "../contexts/User";

// MUI
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";

// MUI Icons
import CloudUploadIcon from "@mui/icons-material/FileUploadOutlined";

// Styled components for file upload
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const UploadBox = styled(Box)(({ theme }) => ({
  border: `0.5px solid ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(3),
  textAlign: "center",
  backgroundColor: theme.palette.background.default,
  marginBottom: theme.spacing(2),
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const UploadResource = ({ 
  resourceType, 
  folderID: propFolderID = null, 
  onGenerate,
  onGenerateStateChange 
}) => {
  const {
    isLoggedIn,
    uploads,
    fetchUploads,
    uploadDocumentTranscript,
    createQuiz,
    createSummary,
    createChat,
    createFlashcardsFromUpload,
  } = useContext(UserContext);

  const paramsObj = useParams();
  const { folderID: paramsFolderID } = paramsObj;
  const { showSnackbar } = useContext(SnackbarContext);

  // Use folderID prop if provided, otherwise use from URL params
  const folderID = propFolderID || paramsFolderID || "null";

  // If folderID is "null", treat it as null in the DB.
  const convertNullFolderID = folderID === "null" ? null : folderID;

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Current selected upload ID from the existing uploads list
  const [selectedUploadId, setSelectedUploadId] = useState("");

  // For managing the selected file before actually uploading
  const [selectedFile, setSelectedFile] = useState(null);

  // Track loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingUploads, setIsLoadingUploads] = useState(false);

  // For "summary" or "chat" resource types that accept a user prompt
  const [userMessage, setUserMessage] = useState("");

  // Fetch uploads on component mount and auto-select the most recent one
  useEffect(() => {
    if (isLoggedIn) {
      setIsLoadingUploads(true);
      fetchUploads()
        .then((uploads) => {
          // Auto-select the most recent upload if none is selected
          if (uploads && uploads.length > 0 && !selectedUploadId) {
            const filteredForFolder = uploads.filter((u) => {
              const uploadFolderID =
                u.folderID === undefined || u.folderID === "undefined"
                  ? null
                  : u.folderID;
              return (
                (uploadFolderID === null && convertNullFolderID === null) ||
                uploadFolderID === convertNullFolderID ||
                (uploadFolderID === null && convertNullFolderID === "null") ||
                (uploadFolderID === "null" && convertNullFolderID === null)
              );
            });

            if (filteredForFolder.length > 0) {
              // Sort by upload date and select the most recent
              const sortedUploads = filteredForFolder.sort(
                (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
              );
              setSelectedUploadId(sortedUploads[0].id);
            }
          }
        })
        .catch((err) => {
          console.error("Error fetching uploads:", err);
          showSnackbar("Failed to load your uploaded documents", "error");
        })
        .finally(() => {
          setIsLoadingUploads(false);
        });
    }
  }, [isLoggedIn, convertNullFolderID]);

  // File handling functions - automatically upload when selected
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      await handleAutoUpload(files[0]);
    }
  };

    const handleAutoUpload = async (file) => {
    if (!isLoggedIn) {
      showSnackbar("You must be logged in to upload documents.", "error");
      return;
    }

    try {
      setIsUploading(true);
      setSelectedFile(file); // Show the file being uploaded
      
      const result = await uploadDocumentTranscript(file, convertNullFolderID);
      if (result?.id || result?.transcript) {
        showSnackbar("Document uploaded successfully!", "success");
        
        // Refresh uploads and auto-select the new upload
        const refreshedUploads = await fetchUploads();
        if (result.id && refreshedUploads) {
          setSelectedUploadId(result.id);
        }
        setSelectedFile(null); // Clear the preview file
      } else {
        showSnackbar("Upload failed", "error");
        setSelectedFile(null);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      showSnackbar(
        err?.response?.data?.error || err.message || "Error uploading document",
        "error"
      );
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Dropzone setup - automatically upload when dropped
  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        await handleAutoUpload(acceptedFiles[0]);
      }
    },
    [isLoggedIn, convertNullFolderID]
  );

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      await handleAutoUpload(files[0]);
    }
  };

  const {
    getRootProps,
    getInputProps,
    fileRejections,
    isDragActive,
    acceptedFiles,
  } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    noClick: true, // We'll handle clicks manually
  });

  // Generate the resource from the selected Upload
  const handleGenerate = async () => {
    if (!isLoggedIn) {
      showSnackbar("You must be logged in to generate resources.", "error");
      return;
    }
    if (!selectedUploadId) {
      showSnackbar("Please select an uploaded document first.", "warning");
      return;
    }

    setIsGenerating(true);
    onGenerateStateChange?.(true);
    
    try {
      switch (resourceType) {
        case "mcq": {
          const quiz = await createQuiz(selectedUploadId, convertNullFolderID);
          showSnackbar("Quiz created!", "success");
          navigate(`/${folderID}/mcq/${quiz.id}`);
          break;
        }
        case "flashcards": {
          const newSession = await createFlashcardsFromUpload(
            selectedUploadId,
            convertNullFolderID
          );
          showSnackbar("Flashcards created!", "success");
          navigate(`/${folderID}/flashcards/${newSession.id}`);
          break;
        }
        case "summary": {
          const sum = await createSummary(
            selectedUploadId,
            userMessage,
            convertNullFolderID
          );
          showSnackbar("Summary created!", "success");
          navigate(`/${folderID}/summary/${sum.id}`);
          break;
        }
        case "chat": {
          const chat = await createChat(
            selectedUploadId,
            userMessage,
            convertNullFolderID
          );
          showSnackbar("Chat created!", "success");
          navigate(`/${folderID}/chat/${chat.id}`);
          break;
        }
        default:
          showSnackbar(
            `Resource type '${resourceType}' not implemented`,
            "error"
          );
          break;
      }
    } catch (err) {
      console.error("Error generating resource:", err);
      showSnackbar(
        err?.response?.data?.error ||
          err.message ||
          "Error generating resource",
        "error"
      );
    } finally {
      setIsGenerating(false);
      onGenerateStateChange?.(false);
    }
  };

  // Expose the generate function to parent
  React.useEffect(() => {
    if (onGenerate) {
      onGenerate.current = handleGenerate;
    }
  }, [handleGenerate, onGenerate]);

  // Notify parent about button state
  React.useEffect(() => {
    const canGenerate = !isGenerating && selectedUploadId && isLoggedIn;
    onGenerateStateChange?.({
      canGenerate,
      isGenerating,
      selectedUploadId,
      resourceType
    });
  }, [isGenerating, selectedUploadId, isLoggedIn, resourceType]);

  const filteredUploads = uploads.filter((u) => {
    const uploadFolderID =
      u.folderID === undefined || u.folderID === "undefined"
        ? null
        : u.folderID;
    const isMatch =
      // Both are null
      (uploadFolderID === null && convertNullFolderID === null) ||
      // Both are the same value
      uploadFolderID === convertNullFolderID ||
      // One is null and one is "null" string
      (uploadFolderID === null && convertNullFolderID === "null") ||
      (uploadFolderID === "null" && convertNullFolderID === null);

    return isMatch;
  });

  return (
    <Stack direction="column" spacing={3} sx={{ mt: 2 }}>
      {/* Header */}
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{
          fontSize: isMobile ? "1.25rem" : "1.5rem",
          fontWeight: "bold",
        }}
      >
        Upload Documents
      </Typography>

      <Typography variant="subtitle1" color="text.secondary">
        Upload your study materials to generate{" "}
        {resourceType === "mcq"
          ? "multiple choice quizzes"
          : resourceType === "flashcards"
          ? "flashcards"
          : resourceType === "summary"
          ? "summaries"
          : "AI chat sessions"}
        .
      </Typography>

      {/* File upload area */}
      <UploadBox
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() =>
          !isUploading && document.getElementById("file-input").click()
        }
        sx={{
          py: { md: 6, xs: 4 },
          minHeight: isMobile ? 120 : "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          opacity: isUploading ? 0.7 : 1,
          pointerEvents: isUploading ? "none" : "auto",
        }}
      >
        {isUploading ? (
          <>
            <CircularProgress size={isMobile ? 40 : 60} color="primary" />
            <Typography
              variant={isMobile ? "body1" : "h6"}
              color="primary"
              sx={{ textAlign: "center" }}
            >
              <strong>Uploading...</strong>
            </Typography>
            {selectedFile && (
              <Typography variant="caption" color="text.secondary">
                {selectedFile.name}
              </Typography>
            )}
          </>
        ) : (
          <>
            <CloudUploadIcon
              color="primary"
              sx={{ fontSize: { md: 60, xs: 40 } }}
            />
            <Typography
              variant={isMobile ? "body1" : "h6"}
              color="primary"
              sx={{ textAlign: "center" }}
            >
              <strong>Choose a file</strong> or drag it here
            </Typography>{" "}
          </>
        )}
        <VisuallyHiddenInput
          id="file-input"
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.docx,.doc,.txt"
          disabled={isUploading}
        />
      </UploadBox>

      {/* File rejections */}
      {fileRejections.length > 0 && (
        <Alert severity="error">
          Invalid file type. Please upload PDF, Word, or text files only.
        </Alert>
      )}

      {/* Current document status */}
      {selectedUploadId && filteredUploads.length > 0 && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Ready to generate!</strong> Using:{" "}
            {filteredUploads.find((u) => u.id === selectedUploadId)?.fileName}
          </Typography>
        </Alert>
      )}      

      {/* Optional user prompt for summary/chat */}
      {(resourceType === "chat" || resourceType === "summary") && (
        <TextField
          fullWidth
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          label="Optional Prompt / Question"
          multiline
          rows={3}
          placeholder="Enter your specific question or prompt here..."
          variant="outlined"
        />
      )}
    </Stack>
  );
};

UploadResource.propTypes = {
  resourceType: PropTypes.string.isRequired,
  folderID: PropTypes.string,
  onGenerate: PropTypes.object, // React ref object
  onGenerateStateChange: PropTypes.func,
};

export default UploadResource;
