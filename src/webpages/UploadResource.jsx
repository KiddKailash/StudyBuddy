import React, { useState, useContext, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate, useParams } from "react-router-dom";
import PropTypes from "prop-types";

// Contexts
import { SnackbarContext } from "../contexts/SnackbarContext";
import { UserContext } from "../contexts/UserContext";

// MUI
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Menu from "@mui/material/Menu";

// MUI Icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const UploadResource = ({ resourceType }) => {
  const {
    isLoggedIn,
    uploads,
    fetchUploads,
    uploadDocumentTranscript,
    createQuiz,
    createSummary,
    createChat,
    createFlashcardsFromUpload,
    setFlashcardSessions,
    setAiChats,
    setSummaries,
    setMultipleChoiceQuizzes,
  } = useContext(UserContext);

  const { folderID } = useParams();
  const { showSnackbar } = useContext(SnackbarContext);

  // If folderID is "null", treat it as null in the DB.
  const convertNullFolderID = folderID === "null" ? null : folderID;

  const navigate = useNavigate();

  // Current selected upload ID from the existing uploads list
  const [selectedUploadId, setSelectedUploadId] = useState("");

  // For managing the selected file before actually uploading
  const [selectedFile, setSelectedFile] = useState(null);

  // Track loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // For "summary" or "chat" resource types that accept a user prompt
  const [userMessage, setUserMessage] = useState("");

  // For dropdown menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Dropzone setup
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

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
  });

  const handleOpenUploadMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUploadMenu = () => {
    // Clear out any selected file if user closes menu without confirming
    setSelectedFile(null);
    setAnchorEl(null);
  };

  // Actually upload the file to "Uploads" (does NOT generate a resource)
  const handleAddDocument = async () => {
    if (!isLoggedIn) {
      showSnackbar("You must be logged in to upload documents.", "error");
      return;
    }

    if (!selectedFile) {
      showSnackbar("No file selected to upload.", "warning");
      return;
    }

    try {
      setIsUploading(true);
      const result = await uploadDocumentTranscript(selectedFile);
      if (result?.id || result?.transcript) {
        showSnackbar("Document uploaded successfully!", "success");
        // Refresh the uploads so the new file appears in the list
        fetchUploads();
        // Clear the selected file
        setSelectedFile(null);
      } else {
        showSnackbar("Upload failed", "error");
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      showSnackbar(
        err?.response?.data?.error || err.message || "Error uploading document",
        "error"
      );
    } finally {
      setIsUploading(false);
      // Close menu after upload
      handleCloseUploadMenu();
    }
  };

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
    try {
      switch (resourceType) {
        case "mcq": {
          const quiz = await createQuiz(selectedUploadId, convertNullFolderID);
          setMultipleChoiceQuizzes((prev) => [...prev, quiz]);
          showSnackbar("Quiz created!", "success");
          navigate(`/${quiz.folderID ?? "null"}/mcq/${quiz.id}`);
          break;
        }
        case "flashcards": {
          const newSession = await createFlashcardsFromUpload(
            selectedUploadId,
            convertNullFolderID
          );
          setFlashcardSessions((prev) => [...prev, newSession]);
          showSnackbar("Flashcards created!", "success");
          navigate(`/${newSession.folderID ?? "null"}/flashcards/${newSession.id}`);
          break;
        }
        case "summary": {
          const sum = await createSummary(
            selectedUploadId,
            userMessage,
            convertNullFolderID
          );
          setSummaries((prev) => [...prev, sum]);
          showSnackbar("Summary created!", "success");
          navigate(`/${sum.folderID ?? "null"}/summary/${sum.id}`);
          break;
        }
        case "chat": {
          const chat = await createChat(
            selectedUploadId,
            userMessage,
            convertNullFolderID
          );
          setAiChats((prev) => [...prev, chat]);
          showSnackbar("Chat created!", "success");
          navigate(`/${chat.folderID ?? "null"}/chat/${chat.id}`);
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
        err?.response?.data?.error || err.message || "Error generating resource",
        "error"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter uploads by folderID
  const filteredUploads = uploads.filter(
    (u) => u.folderID === convertNullFolderID
  );

  return (
    <Stack direction="column" spacing={2}>
      {/* Header and the main "Upload File" button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
        }}
      >
        <Typography variant="h5">Uploaded Documents</Typography>
        <Button
          variant="contained"
          onClick={handleOpenUploadMenu}
          endIcon={<ExpandMoreIcon />}
          disabled={isUploading}
        >
          {isUploading ? <CircularProgress size={24} /> : "Upload File"}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleCloseUploadMenu}
          keepMounted
        >
          <Box
            {...getRootProps()}
            sx={{
              p: 2,
              width: 300,
              textAlign: "center",
              cursor: "pointer",
              border: "1px dashed",
              borderColor: isDragActive ? "primary.main" : "grey.400",
              borderRadius: 2,
              m: 2,
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon color="primary" sx={{ fontSize: 48 }} />
            <Typography>
              {isDragActive
                ? "Drop the file here ..."
                : "Drag & drop or click to select file"}
            </Typography>

            {fileRejections.length > 0 && (
              <Typography color="error" variant="caption">
                Invalid file type or too many files.
              </Typography>
            )}

            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {selectedFile.name}
              </Typography>
            )}
          </Box>

          {/* Confirm Upload button (only shows if a file is selected) */}
          {selectedFile && (
            <Button
              onClick={handleAddDocument}
              variant="contained"
              sx={{ m: 2 }}
              disabled={isUploading}
            >
              {isUploading ? <CircularProgress size={24} /> : "Confirm Upload"}
            </Button>
          )}
        </Menu>
      </Box>

      {/* Scrollable box or a prompt if no uploads exist */}
      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: 1,
          p: 1,
          maxHeight: 150,
          overflowY: "auto",
        }}
      >
        {filteredUploads.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 2 }}>
            <Typography sx={{ mb: 1 }}>
              No documents have been uploaded yet.
            </Typography>
          </Box>
        ) : (
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {filteredUploads.map((u) => (
              <Box
                key={u.id}
                onClick={() => {
                  setSelectedUploadId((prev) =>
                    prev === u.id ? "" : u.id
                  );
                }}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  cursor: "pointer",
                  backgroundColor:
                    selectedUploadId === u.id ? "primary.main" : "grey.300",
                }}
              >
                <Typography>{u.fileName}</Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {/* Optional user prompt for summary/chat */}
      {(resourceType === "chat" || resourceType === "summary") && (
        <TextField
          fullWidth
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          label="Optional Prompt / Question"
        />
      )}

      <Button
        variant="contained"
        color="primary"
        disabled={isGenerating}
        onClick={handleGenerate}
      >
        {isGenerating ? (
          <CircularProgress size={24} />
        ) : (
          `Generate ${resourceType.toUpperCase()}`
        )}
      </Button>
    </Stack>
  );
};

UploadResource.propTypes = {
  resourceType: PropTypes.string.isRequired,
};

export default UploadResource;
