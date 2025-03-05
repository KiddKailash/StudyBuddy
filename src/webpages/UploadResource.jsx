import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SnackbarContext } from "../contexts/SnackbarContext";
import { useDropzone } from "react-dropzone";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { UserContext } from "../contexts/UserContext";
import PropTypes from "prop-types";

// MUI
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";

const UploadResource = ({ resourceType }) => {
  const {
    isLoggedIn,
    uploads,
    fetchUploads,
    uploadDocumentTranscript,
    createUploadFromText,
    getWebsiteTranscript,
    createQuiz,
    createSummary,
    createChat,
    // IMPORTANT: the newly added function for generating flashcards from an upload
    createFlashcardsFromUpload,
  } = useContext(UserContext);

  const { showSnackbar } = useContext(SnackbarContext);

  const [existingMode, setExistingMode] = useState(true);
  const [selectedUploadId, setSelectedUploadId] = useState("");
  const [loading, setLoading] = useState(false);
  const [userMessage, setUserMessage] = useState("");

  // For "new upload"
  const [tabValue, setTabValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const navigate = useNavigate();

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
    if (isLoggedIn) {
      fetchUploads().catch((err) =>
        console.error("Error fetching uploads:", err)
      );
    }
  }, [isLoggedIn, fetchUploads]);

  const handleGenerate = async () => {
    if (!isLoggedIn) {
      showSnackbar(
        "You must be logged in to create resources referencing an upload!",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      let uploadId = "";
      if (existingMode) {
        // Use existing upload
        if (!selectedUploadId) {
          showSnackbar("Please select an existing upload", "warning");
          setLoading(false);
          return;
        }
        uploadId = selectedUploadId;
      } else {
        // Create a new upload
        if (tabValue === 0) {
          // File
          if (!selectedFile) {
            showSnackbar("Please select a file", "warning");
            setLoading(false);
            return;
          }
          const uploadData = await uploadDocumentTranscript(selectedFile);
          if (!uploadData.id) {
            showSnackbar("Upload failed", "error");
            setLoading(false);
            return;
          }
          uploadId = uploadData.id;
        } else if (tabValue === 1) {
          // Pasted text
          if (!pastedText.trim()) {
            showSnackbar("Please paste text first", "warning");
            setLoading(false);
            return;
          }
          const newUpload = await createUploadFromText(
            pastedText.trim(),
            "Pasted Text"
          );
          if (!newUpload.id) {
            showSnackbar("Upload failed", "error");
            setLoading(false);
            return;
          }
          uploadId = newUpload.id;
        } else if (tabValue === 2) {
          // Website
          if (!websiteUrl.trim()) {
            showSnackbar("Enter a website URL", "warning");
            setLoading(false);
            return;
          }
          const rawTranscript = await getWebsiteTranscript(websiteUrl.trim());
          const newUpload = await createUploadFromText(
            rawTranscript,
            `Website: ${websiteUrl}`
          );
          if (!newUpload.id) {
            showSnackbar("Upload from website failed", "error");
            setLoading(false);
            return;
          }
          uploadId = newUpload.id;
        } else {
          showSnackbar("Notion or other not implemented", "warning");
          setLoading(false);
          return;
        }
      }

      // Now we have an uploadId => create the resource
      switch (resourceType) {
        case "mcq": {
          // Generate a MCQ from the chosen upload
          // and navigate to /mcq/:id
          const quiz = await createQuiz(uploadId);
          navigate(`/mcq/${quiz.id}`);
          break;
        }

        case "flashcards": {
          // Generate flashcards from the chosen upload
          // and navigate to /flashcards/:id
          const newSession = await createFlashcardsFromUpload(uploadId);
          showSnackbar(`Flashcards created!`, "success");
          navigate(`/flashcards/${newSession.id}`);
          break;
        }

        case "summary": {
          // Generate a summary from the chosen upload
          // and navigate to /summary/:id
          const sum = await createSummary(uploadId, userMessage);
          showSnackbar(`Summary created!`, "success");
          navigate(`/summary/${sum.id}`);
          break;
        }

        case "chat": {
          // Generate a chat from the chosen upload
          // and navigate to /chat/:id
          const chat = await createChat(uploadId, userMessage);
          showSnackbar(`Chat created!`, "success");
          navigate(`/chat/${chat.id}`);
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
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h6" sx={{ mb: 2 }}>
        Create {resourceType.toUpperCase()} from an Upload
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button
          variant={existingMode ? "contained" : "outlined"}
          onClick={() => setExistingMode(true)}
          sx={{ mr: 2 }}
        >
          Use Existing Upload
        </Button>
        <Button
          variant={!existingMode ? "contained" : "outlined"}
          onClick={() => setExistingMode(false)}
        >
          Upload New
        </Button>
      </Box>

      {existingMode ? (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Upload</InputLabel>
          <Select
            value={selectedUploadId || ""}
            label="Select an Upload"
            onChange={(e) => setSelectedUploadId(e.target.value)}
          >
            {uploads.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.fileName} (ID: {u.id})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Upload File" />
            <Tab label="Paste Text" />
            <Tab label="Website" />
            {/* <Tab label="Notion" /> */}
          </Tabs>
          {tabValue === 0 && (
            <Box sx={{ mt: 2 }}>
              <Paper
                variant="outlined"
                {...getRootProps()}
                sx={{
                  padding: 4,
                  textAlign: "center",
                  backgroundColor: isDragActive
                    ? "grey.200"
                    : "background.paper",
                  borderColor: isDragActive ? "primary.main" : "grey.400",
                  cursor: "pointer",
                }}
              >
                <input {...getInputProps()} />
                <CloudUploadIcon sx={{ fontSize: 48 }} />
                {selectedFile ? (
                  <Typography>{selectedFile.name}</Typography>
                ) : (
                  <Typography>Drag & Drop or click to upload</Typography>
                )}
              </Paper>
              {fileRejections.length > 0 && (
                <Typography color="error">Invalid file type.</Typography>
              )}
            </Box>
          )}
          {tabValue === 1 && (
            <TextField
              fullWidth
              multiline
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              label="Paste Text Here"
              sx={{ mt: 2 }}
            />
          )}
          {tabValue === 2 && (
            <TextField
              fullWidth
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              label="Website URL"
              sx={{ mt: 2 }}
            />
          )}
          {tabValue === 3 && (
            <Typography sx={{ mt: 2 }}>Notion feature coming soon</Typography>
          )}
        </>
      )}
      {(resourceType === "chat" || resourceType === "summary") && (
        <TextField
          fullWidth
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          label="Ask a question"
          sx={{ mt: 2 }}
        />
      )}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3 }}
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          `Generate ${resourceType.toUpperCase()}`
        )}
      </Button>
    </Container>
  );
};

UploadResource.propTypes = {
  resourceType: PropTypes.string.isRequired,
};

export default UploadResource;
