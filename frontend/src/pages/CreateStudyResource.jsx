import React, { useState, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Local Imports
import UploadResource from "./UploadResource";
import PageWrapper from "../components/PageWrapper";

// Contexts
import UserContext from "../contexts/User";

// MUI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";

// MUI Icons
import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";
import ViewCarouselRoundedIcon from "@mui/icons-material/ViewCarouselRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

const CreateStudyResource = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState(null);
  const [generateState, setGenerateState] = useState({
    canGenerate: false,
    isGenerating: false,
    selectedUploadId: null,
    resourceType: null
  });
  const generateRef = useRef(null);

  // Get current folderID from URL params, default to "null" for unorganized
  const currentFolderID = params.folderID || "null";
  // Convert "null" string to null for comparison with resource folderIDs
  const normalizedFolderID = currentFolderID === "null" ? null : currentFolderID;

  const {
    flashcardSessions = [],
    multipleChoiceQuizzes = [],
    summaries = [],
    aiChats = [],
  } = useContext(UserContext);

  // Helper function: for each resource, use updatedDate if it exists; otherwise, fallback to createdAt.
  const getResourceTimestamp = (resource) =>
    resource.updatedDate
      ? new Date(resource.updatedDate)
      : new Date(resource.createdAt);

  // Helper function to check if resource belongs to current folder
  const isInCurrentFolder = (resource) => {
    const resourceFolderID = resource.folderID || null;
    return resourceFolderID === normalizedFolderID;
  };

  // Filter resources by current folder, then add resource type
  const flashcardsArr = (flashcardSessions || []).filter(isInCurrentFolder);
  const mcqArr = (multipleChoiceQuizzes || []).filter(isInCurrentFolder);
  const summariesArr = (summaries || []).filter(isInCurrentFolder);
  const aiChatsArr = (aiChats || []).filter(isInCurrentFolder);

  // Combine all the filtered resources with their type added.
  const allResources = [
    ...flashcardsArr.map((item) => ({ ...item, resourceType: "flashcards" })),
    ...mcqArr.map((item) => ({ ...item, resourceType: "mcq" })),
    ...summariesArr.map((item) => ({ ...item, resourceType: "summary" })),
    ...aiChatsArr.map((item) => ({ ...item, resourceType: "chat" })),
  ];

  // Sort resources by the most recent timestamp (updatedDate when available, or createdAt otherwise)
  const sortedResources = allResources.sort(
    (a, b) => getResourceTimestamp(b) - getResourceTimestamp(a)
  );

  // Grab the top three most recent resources.
  const mostRecentResources = sortedResources.slice(0, 3);

  const cardStyle = {
    bgcolor: theme.palette.background.default,
    borderRadius: 2,
    p: 2,
    textAlign: "left",
    cursor: "pointer",
    minHeight: 120,
    display: "flex",
    flexDirection: "column",
    flex: 1,
    "&:hover": {
      color: theme.palette.primary.main,
    },
  };

  const handleOpenDialog = (resourceType) => {
    setSelectedResourceType(resourceType);
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
    setSelectedResourceType(null);
    setGenerateState({
      canGenerate: false,
      isGenerating: false,
      selectedUploadId: null,
      resourceType: null
    });
  };

  const handleGenerate = () => {
    if (generateRef.current) {
      generateRef.current();
    }
  };

  const handleGenerateStateChange = (state) => {
    if (typeof state === 'boolean') {
      // Handle legacy boolean parameter for isGenerating
      setGenerateState(prev => ({ ...prev, isGenerating: state }));
    } else {
      // Handle full state object
      setGenerateState(state);
    }
  };

  return (
    <PageWrapper>
      <Stack direction="column" spacing={4} sx={{ mt: 2 }}>
        <Typography variant="h3">What are you studying?</Typography>
        

        <Box>
          <Typography
            variant="body2"
            color="text.secondary.dark"
            sx={{
              fontWeight: 600,
              ml: 2,
              mb: 1,
              flex: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <AddRoundedIcon sx={{ mr: 1 }} />
            New Study Resource
          </Typography>

          <Box
            sx={{
              bgcolor: theme.palette.background.paper,
              p: 4,
              borderRadius: 4,
            }}
          >
            {/* Studying section */}
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
              Studying
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={cardStyle} onClick={() => handleOpenDialog("mcq")}>
                  <CheckBoxRoundedIcon />
                  <Typography variant="subtitle1">
                    Practice quiz (MCQ)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Test your knowledge
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={cardStyle}
                  onClick={() => handleOpenDialog("flashcards")}
                >
                  <ViewCarouselRoundedIcon />
                  <Typography variant="subtitle1">Flashcards</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bite-sized studying
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={cardStyle} onClick={() => handleOpenDialog("summary")}>
                  <AutoStoriesRoundedIcon />
                  <Typography variant="subtitle1">Summarise</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Read any document in seconds
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>


          <Box>
            <Typography
              variant="body2"
              color="text.secondary.dark"
              sx={{
                fontWeight: 600,
                ml: 2,
                mb: 1,
                flex: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              <RestoreRoundedIcon sx={{ mr: 1 }} />
              Recent Study Resources
            </Typography>
            <Box
              sx={{
                bgcolor: theme.palette.background.paper,
                p: 4,
                borderRadius: 4,
              }}
            >
                    {allResources.length > 0 ? (
              <Stack direction="row" spacing={2}>
                {mostRecentResources.map((resource) => (
                  <Box
                    key={resource.id}
                    sx={cardStyle}
                    onClick={() =>
                      navigate(
                        `/${currentFolderID}/${resource.resourceType}/${resource.id}`
                      )
                    }
                  >
                    <RestoreRoundedIcon />
                    <Typography variant="subtitle1">
                      {resource.studySession}
                    </Typography>
                    <div style={{ flexGrow: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {resource.resourceType.toUpperCase()}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent study resources in this folder
              </Typography>
            )}
            </Box>
          </Box>
      </Stack>

      

      {/* ------------- DIALOG ------------- */}
      <Dialog
        open={open}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            p: 2,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <DialogContent>
            {selectedResourceType && (
              <UploadResource 
                resourceType={selectedResourceType}
                folderID={currentFolderID}
                onGenerate={generateRef}
                onGenerateStateChange={handleGenerateStateChange}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="error" disabled={generateState.isGenerating}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              variant="contained"
              disabled={!generateState.canGenerate || generateState.isGenerating}
              startIcon={generateState.isGenerating ? <CircularProgress size={20} /> : null}
            >
              {generateState.isGenerating ? (
                "Generating..."
              ) : (
                `Generate ${
                  selectedResourceType === "mcq"
                    ? "Quiz"
                    : selectedResourceType?.charAt(0).toUpperCase() + selectedResourceType?.slice(1)
                }`
              )}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </PageWrapper>
  );
};

export default CreateStudyResource;
