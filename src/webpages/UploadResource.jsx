import React, { useState, useContext } from "react";
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
// import MenuItem from "@mui/material/MenuItem";

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
  } = useContext(UserContext);

  const { folderID } = useParams();
  const { showSnackbar } = useContext(SnackbarContext);

  const convertNullFolderID = folderID === "null" ? null : folderID;

  const navigate = useNavigate();

  // Current selected upload ID from the existing uploads list
  const [selectedUploadId, setSelectedUploadId] = useState("");

  // For managing dropzone selected file
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
  const { getRootProps, getInputProps, fileRejections } =
    useDropzone({
      onDrop: (acceptedFiles) => {
        if (acceptedFiles && acceptedFiles[0]) {
          setSelectedFile(acceptedFiles[0]);
          handleAddDocument(acceptedFiles[0]);
        }
      },
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
    setAnchorEl(null);
  };

  // Handle uploading a new file to "Uploads" (does NOT generate a resource)
  const handleAddDocument = async (fileToUpload = null) => {
    if (!isLoggedIn) {
      showSnackbar("You must be logged in to upload documents.", "error");
      return;
    }
    
    const fileToProcess = fileToUpload || selectedFile;
    
    if (!fileToProcess) {
      showSnackbar("Please select a file first.", "warning");
      return;
    }
    
    try {
      setIsUploading(true);
      const result = await uploadDocumentTranscript(fileToProcess);
      if (result?.id) {
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
          navigate(`/${quiz.folderID}/mcq/${quiz.id}`);
          break;
        }
        case "flashcards": {
          const newSession = await createFlashcardsFromUpload(selectedUploadId, convertNullFolderID);
          showSnackbar("Flashcards created!", "success");
          navigate(`/${newSession.folderID}/flashcards/${newSession.id}`);
          break;
        }
        case "summary": {
          const sum = await createSummary(selectedUploadId, userMessage, convertNullFolderID);
          showSnackbar("Summary created!", "success");
          navigate(`/${sum.folderID}/summary/${sum.id}`);
          break;
        }
        case "chat": {
          const chat = await createChat(selectedUploadId, userMessage, convertNullFolderID);
          showSnackbar("Chat created!", "success");
          navigate(`/${chat.folderID}/chat/${chat.id}`);
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
        err.response?.data?.error || err.message || "Error generating resource",
        "error"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Stack direction="column" spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="h5">
            Uploaded Documents
          </Typography>
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
          >
            <Box
              {...getRootProps()}
              sx={{
                p: 2,
                width: 300,
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon color="primary" sx={{ fontSize: 48 }} />
              <Typography>Drag & drop or click to select file</Typography>
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
          </Menu>
        </Box>

        {/* Scrollable box for existing uploads */}
        <Box
          sx={{
            border: "1px solid #ccc",
            borderRadius: 1,
            p: 1,
            maxHeight: 150,
            overflowY: "scroll",
          }}
        >
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {uploads.filter((u)=>u.folderID === convertNullFolderID).map((u) => (
              <Box
                key={u.id}
                onClick={() => {
                  setSelectedUploadId((prev) => (prev === u.id ? "" : u.id));
                }}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  cursor: "pointer",
                  backgroundColor:
                    selectedUploadId === u.id
                      ? "primary.main"
                      : "grey.300",
                }}
              >
                <Typography>{u.fileName}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {(resourceType === "chat" || resourceType === "summary") && (
          <TextField
            fullWidth
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            label="Optional Prompt / Question"
          />
        )}

        <Divider />

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
    </>
  );
};

UploadResource.propTypes = {
  resourceType: PropTypes.string.isRequired,
};

export default UploadResource;
