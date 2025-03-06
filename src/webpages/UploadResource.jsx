import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SnackbarContext } from "../contexts/SnackbarContext";
import { useDropzone } from "react-dropzone";
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
    createUploadFromText,
    getWebsiteTranscript,
    createQuiz,
    createSummary,
    createChat,
    createFlashcardsFromUpload,
  } = useContext(UserContext);
  const { showSnackbar } = useContext(SnackbarContext);

  // Instead of a dropdown, we'll allow selection by clicking a box.
  // For now, we'll allow a single selection. To allow multiple, change this state to an array.
  const [selectedUploadId, setSelectedUploadId] = useState("");
  const [loading, setLoading] = useState(false);
  const [userMessage, setUserMessage] = useState("");

  // For new uploads (via file, pasted text, or website)
  const [tabValue, setTabValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const navigate = useNavigate();

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

  useEffect(() => {
    if (isLoggedIn) {
      fetchUploads().catch((err) => console.error("Error fetching uploads:", err));
    }
  }, [isLoggedIn, fetchUploads]);

  const handleGenerate = async () => {
    if (!isLoggedIn) {
      showSnackbar("You must be logged in to create resources referencing an upload!", "error");
      return;
    }

    setLoading(true);
    try {
      let uploadId = "";
      // If a file is selected from the existing uploads box, use that.
      if (selectedUploadId) {
        uploadId = selectedUploadId;
      } else {
        // Otherwise, use the new upload tab logic.
        if (tabValue === 0) {
          // File upload
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
          const newUpload = await createUploadFromText(pastedText.trim(), "Pasted Text");
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
          const newUpload = await createUploadFromText(rawTranscript, `Website: ${websiteUrl}`);
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

      // Now we have an uploadId. Create the requested resource.
      switch (resourceType) {
        case "mcq": {
          const quiz = await createQuiz(uploadId);
          navigate(`/mcq/${quiz.id}`);
          break;
        }
        case "flashcards": {
          const newSession = await createFlashcardsFromUpload(uploadId);
          showSnackbar("Flashcards created!", "success");
          navigate(`/flashcards/${newSession.id}`);
          break;
        }
        case "summary": {
          const sum = await createSummary(uploadId, userMessage);
          showSnackbar("Summary created!", "success");
          navigate(`/summary/${sum.id}`);
          break;
        }
        case "chat": {
          const chat = await createChat(uploadId, userMessage);
          showSnackbar("Chat created!", "success");
          navigate(`/chat/${chat.id}`);
          break;
        }
        default:
          showSnackbar(`Resource type '${resourceType}' not implemented`, "error");
          break;
      }
    } catch (err) {
      console.error("Error generating resource:", err);
      showSnackbar(err.response?.data?.error || err.message || "Error generating resource", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Stack direction="column" spacing={2}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 2, fontWeight: 600 }}>
          Choose file
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
          <Stack direction="row" spacing={2}>
          {uploads.map((u) => (
            <Paper
              key={u.id}
              onClick={() => {
                // Toggle selection: if already selected, deselect; otherwise, select.
                setSelectedUploadId((prev) => (prev === u.id ? "" : u.id));
              }}
              sx={{
                p: 1,
                mb: 1,
                cursor: "pointer",
                backgroundColor: selectedUploadId === u.id ? "primary.light" : "background.paper",
              }}
            >
              
              <Typography>{u.fileName}</Typography>
            </Paper>
          ))}
          </Stack>
        </Box>

        <Divider />

        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Upload File" />
          <Tab label="Paste Text" />
          <Tab label="Website" />
          {/* <Tab label="Notion" /> */}
        </Tabs>

        {tabValue === 0 && (
          <Box>
            <Paper
              variant="outlined"
              {...getRootProps()}
              sx={{
                p: 4,
                textAlign: "center",
                backgroundColor: isDragActive ? "grey.200" : "background.paper",
                borderColor: isDragActive ? "primary.main" : "grey.400",
                cursor: "pointer",
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon color="primary" sx={{ fontSize: 48 }} />
              {selectedFile ? (
                <Typography>{selectedFile.name}</Typography>
              ) : (
                <Typography>Upload</Typography>
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
            rows={5}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            label="Paste Text Here"
          />
        )}
        {tabValue === 2 && (
          <TextField
            fullWidth
            multiline
            rows={5}
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            label="Website URL"
          />
        )}
        {tabValue === 3 && <Typography>Notion feature coming soon</Typography>}
        {(resourceType === "chat" || resourceType === "summary") && (
          <TextField
            fullWidth
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            label="Ask a question"
          />
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : `Generate ${resourceType.toUpperCase()}`}
        </Button>
      </Stack>
    </Container>
  );
};

UploadResource.propTypes = {
  resourceType: PropTypes.string.isRequired,
};

export default UploadResource;
