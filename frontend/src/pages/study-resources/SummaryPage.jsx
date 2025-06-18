import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Contexts
import { UserContext } from "../../contexts/User";

// Local Imports
import PageWrapper from "../../components/PageWrapper";
import DocumentChat from "../../components/DocumentChat";

// Services
import { fetchUploads } from "../../services/uploadService";

// MUI
import {
  Typography,
  Box,
  CircularProgress,
  Paper,
  Divider,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  Chat as ChatIcon,
  Article as SummaryIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";

const SummaryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, summaries, dataLoading, folders } = useContext(UserContext);

  // Local state
  const [summary, setSummary] = useState(null);
  const [upload, setUpload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [chatExpanded, setChatExpanded] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setErrorMessage("You must be logged in to view this summary.");
      setLoading(false);
      return;
    }

    if (!dataLoading) {
      fetchSummaryAndDocument();
    }
  }, [id, isLoggedIn, summaries, dataLoading]);

  const fetchSummaryAndDocument = async () => {
    setLoading(true);
    try {
      // Get summary from context
      const fetchedSummary = summaries.find(s => s.id === id);
      if (!fetchedSummary) {
        setErrorMessage("Summary not found.");
        return;
      }
      setSummary(fetchedSummary);

      // Get the original document
      if (fetchedSummary.uploadId) {
        try {
          const uploads = await fetchUploads();
          const relatedUpload = uploads.find(u => u.id === fetchedSummary.uploadId);
          setUpload(relatedUpload);
        } catch (error) {
          console.error("Error fetching upload:", error);
          // Don't set error message here as summary can still be displayed
        }
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
      setErrorMessage("Error fetching summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFolderName = (folderId) => {
    if (!folderId) return "Uncategorized";
    const folder = folders.find(f => f.id === folderId);
    return folder ? folder.folderName : "Unknown Folder";
  };

  const formatDate = (date) => {
    if (!date) return "Unknown date";
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Invalid date";
    }
  };

  if (loading || dataLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (errorMessage || !summary) {
    return (
      <PageWrapper>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <DescriptionIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
          <Typography variant="h5" color="error" gutterBottom>
            {errorMessage || "Summary not found"}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The summary you're looking for doesn't exist or you don't have permission to view it.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/create")}
          >
            Go Back Home
          </Button>
        </Box>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton
              onClick={() => navigate("/create")}
              sx={{ mr: 2 }}
              size="large"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ flex: 1 }}>
              {summary.studySession || "Summary"}
            </Typography>
          </Box>

          {/* Meta Information */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
            <Chip
              icon={<FolderIcon />}
              label={getFolderName(summary.folderID)}
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<ScheduleIcon />}
              label={formatDate(summary.createdDate)}
              variant="outlined"
              size="small"
            />
            {upload && (
              <Chip
                icon={<DescriptionIcon />}
                label={upload.fileName}
                variant="outlined"
                size="small"
                color="primary"
              />
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Summary Content */}
          <Grid item xs={12} lg={chatExpanded ? 6 : 12}>
            <Card elevation={2} sx={{ height: "fit-content" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <SummaryIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h5">
                    Summary
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                    fontSize: "1.1rem"
                  }}
                >
                  {summary.summary}
                </Typography>

                {/* Document Details Accordion */}
                {upload && (
                  <Accordion sx={{ mt: 3 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <DescriptionIcon />
                        Document Details
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            File Name
                          </Typography>
                          <Typography variant="body2">
                            {upload.fileName}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            File Type
                          </Typography>
                          <Typography variant="body2">
                            {upload.fileType || "Unknown"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Uploaded
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(upload.uploadedAt)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Document Length
                          </Typography>
                          <Typography variant="body2">
                            {upload.transcript ? `${upload.transcript.length.toLocaleString()} characters` : "Unknown"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Chat Section */}
          <Grid item xs={12} lg={chatExpanded ? 6 : 12}>
            <Card elevation={2}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <ChatIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Chat with Document
                    </Typography>
                  </Box>
                  {!chatExpanded && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setChatExpanded(true)}
                    >
                      Expand Chat
                    </Button>
                  )}
                  {chatExpanded && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setChatExpanded(false)}
                    >
                      Collapse
                    </Button>
                  )}
                </Box>
                <Divider />
                
                {summary.uploadId ? (
                  <DocumentChat 
                    summaryId={summary.id} 
                    documentTitle={upload?.fileName}
                  />
                ) : (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <ChatIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      Document chat is not available for this summary.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      The original document could not be found.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageWrapper>
  );
};

export default SummaryPage;
