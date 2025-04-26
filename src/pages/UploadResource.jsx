import React, { useState, useContext, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate, useParams } from "react-router-dom";
import PropTypes from "prop-types";

// Contexts
import { SnackbarContext } from "../contexts/SnackbarContext";
import { UserContext } from "../contexts/User";

// MUI
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Menu from "@mui/material/Menu";

// MUI Icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const UploadResource = ({ resourceType, folderID: propFolderID = null }) => {
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

  const paramsObj = useParams();
  const { folderID: paramsFolderID } = paramsObj;
  const { showSnackbar } = useContext(SnackbarContext);

  // Use folderID prop if provided, otherwise use from URL params
  const folderID = propFolderID || paramsFolderID || "null";

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
  const [isLoadingUploads, setIsLoadingUploads] = useState(false);

  // For "summary" or "chat" resource types that accept a user prompt
  const [userMessage, setUserMessage] = useState("");

  // For dropdown menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Fetch uploads on component mount
  useEffect(() => {
    if (isLoggedIn) {
      setIsLoadingUploads(true);
      fetchUploads()
        .then(() => {
          console.log("Uploads fetched successfully");
        })
        .catch(err => {
          console.error("Error fetching uploads:", err);
          showSnackbar("Failed to load your uploaded documents", "error");
        })
        .finally(() => {
          setIsLoadingUploads(false);
        });
    }
  }, [isLoggedIn]);

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
      console.log("Uploading document with folderID:", convertNullFolderID);
      const result = await uploadDocumentTranscript(selectedFile, convertNullFolderID);
      if (result?.id || result?.transcript) {
        showSnackbar("Document uploaded successfully!", "success");
        // Refresh the uploads so the new file appears in the list
        await fetchUploads();
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
          navigate(`/${folderID}/mcq/${quiz.id}`);
          break;
        }
        case "flashcards": {
          const newSession = await createFlashcardsFromUpload(
            selectedUploadId,
            convertNullFolderID
          );
          setFlashcardSessions((prev) => [...prev, newSession]);
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
          setSummaries((prev) => [...prev, sum]);
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
          setAiChats((prev) => [...prev, chat]);
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
        err?.response?.data?.error || err.message || "Error generating resource",
        "error"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter uploads by folderID
  console.log("All uploads:", uploads);
  console.log("Current folderID:", folderID);
  console.log("Converted folderID for comparison:", convertNullFolderID);
  
  const filteredUploads = uploads.filter((u) => {
    const uploadFolderID = u.folderID === undefined || u.folderID === "undefined" ? null : u.folderID;
    const isMatch = 
      // Both are null
      (uploadFolderID === null && convertNullFolderID === null) ||
      // Both are the same value
      (uploadFolderID === convertNullFolderID) ||
      // One is null and one is "null" string
      (uploadFolderID === null && convertNullFolderID === "null") ||
      (uploadFolderID === "null" && convertNullFolderID === null);
    
    console.log(`Upload ${u.id} (${u.fileName}) has folderID: ${u.folderID} (normalized: ${uploadFolderID}), match: ${isMatch}`);
    return isMatch;
  });

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
        {isLoadingUploads ? (
          <Box sx={{ textAlign: "center", p: 2 }}>
            <CircularProgress size={24} />
            <Typography sx={{ mt: 1 }}>Loading your documents...</Typography>
          </Box>
        ) : filteredUploads.length === 0 ? (
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
                  color: selectedUploadId === u.id ? "white" : "inherit",
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
        disabled={isGenerating || !selectedUploadId}
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
  folderID: PropTypes.string,
};

export default UploadResource;
