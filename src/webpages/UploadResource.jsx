import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PropTypes from "prop-types";

// Contexts
import { SnackbarContext } from "../contexts/SnackbarContext";
import { UserContext } from "../contexts/UserContext";

// Dropzone
import { useDropzone } from "react-dropzone";

// MUI Components
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";

// MUI Icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

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

  // For “summary” or “chat” resource types that accept a user prompt
  const [userMessage, setUserMessage] = useState("");

  // On mount, fetch existing uploads if logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchUploads().catch((err) =>
        console.error("Error fetching uploads:", err)
      );
    }
  }, [isLoggedIn, fetchUploads]);

  // Dropzone setup
  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop: (acceptedFiles) => {
        if (acceptedFiles && acceptedFiles[0]) {
          setSelectedFile(acceptedFiles[0]);
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

  // Handle uploading a new file to “Uploads” (does NOT generate a resource)
  const handleAddDocument = async () => {
    if (!isLoggedIn) {
      showSnackbar("You must be logged in to upload documents.", "error");
      return;
    }
    if (!selectedFile) {
      showSnackbar("Please select a file first.", "warning");
      return;
    }
    try {
      setIsUploading(true);
      const result = await uploadDocumentTranscript(selectedFile);
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
        <Typography variant="h5" sx={{ mt: 2 }}>
          Uploaded Documents
        </Typography>

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
            {uploads.map((u) => (
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
                      ? "primary.light"
                      : "background.paper",
                }}
              >
                <Typography>{u.fileName}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider />

        <Typography variant="h6">Add Document to Uploads</Typography>
        <Box
          {...getRootProps()}
          sx={{
            p: 3,
            textAlign: "center",
            backgroundColor: isDragActive ? "grey.200" : "background.paper",
            border: "2px dashed",
            borderColor: isDragActive ? "primary.main" : "grey.400",
            cursor: "pointer",
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon color="primary" sx={{ fontSize: 48 }} />
          {selectedFile ? (
            <Typography>{selectedFile.name}</Typography>
          ) : (
            <Typography>Drag &amp; drop or click to select file</Typography>
          )}
        </Box>
        {fileRejections.length > 0 && (
          <Typography color="error">
            Invalid file type or too many files.
          </Typography>
        )}

        <Button
          variant="contained"
          onClick={handleAddDocument}
          disabled={isUploading || !selectedFile}
        >
          {isUploading ? <CircularProgress size={24} /> : "Add to Uploads"}
        </Button>

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
