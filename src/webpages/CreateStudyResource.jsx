import React, { useState } from "react";

// MUI
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import { useTheme } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";

// Icons
import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";
import LocalLibraryRoundedIcon from "@mui/icons-material/LocalLibraryRounded";
import ViewCarouselRoundedIcon from "@mui/icons-material/ViewCarouselRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";

// Child component
import UploadResource from "./UploadResource";

const CreateStudyResource = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState(null);

  const cardStyle = {
    bgcolor: theme.palette.background.default,
    borderRadius: 2,
    p: 2,
    textAlign: "left",
    cursor: "pointer",
    minHeight: 120,
    "&:hover": {
      color: theme.palette.primary.main,
      border: 1,
      borderColor: theme.palette.primary.main,
    },
  };

  const handleOpenDialog = (resourceType) => {
    setSelectedResourceType(resourceType);
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
    setSelectedResourceType(null);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2, textAlign: "left" }}>
      <Typography
        variant="body2"
        color="text.secondary.dark"
        sx={{ fontWeight: 600, ml: 2, mb: 1 }}
      >
        New Study Resource
      </Typography>

      <Box
        sx={{
          bgcolor: theme.palette.background.default,
          p: 4,
          borderRadius: 4,
          mb: 4,
        }}
      >
        {/* Studying section */}
        <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
          Studying
        </Typography>
        <Grid container spacing={2} mb={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={cardStyle} onClick={() => handleOpenDialog("mcq")}>
              <CheckBoxRoundedIcon />
              <Typography variant="subtitle1">Practice quiz (MCQ)</Typography>
              <Typography variant="body2" color="text.secondary">
                Test your knowledge
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={cardStyle} onClick={() => handleOpenDialog("flashcards")}>
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

        {/* Homework section */}
        <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
          Homework
        </Typography>
        <Grid container spacing={2} mb={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={cardStyle}>
              <NotesRoundedIcon />
              <Typography variant="subtitle1">Proofread</Typography>
              <Typography variant="body2" color="text.secondary">
                Improve your writing
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={cardStyle} onClick={() => handleOpenDialog("chat")}>
              <VideocamRoundedIcon />
              <Typography variant="subtitle1">AI Chat</Typography>
              <Typography variant="body2" color="text.secondary">
                Ask questions about your document
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary.dark"
        sx={{ fontWeight: 600, ml: 2, mb: 1 }}
      >
        Recent Study Resources
      </Typography>
      <Box
        sx={{
          bgcolor: theme.palette.background.default,
          p: 5,
          borderRadius: 5,
          mb: 4,
        }}
      >
        {/* e.g. show recently generated resources */}
      </Box>

      {/* ------------- DIALOG ------------- */}
      <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <Box sx={{ p: 2 }}>
          <DialogTitle variant="h6" sx={{ fontWeight: 600 }}>
            Create a {selectedResourceType}
          </DialogTitle>
          <DialogContent>
            {selectedResourceType && (
              <UploadResource resourceType={selectedResourceType} />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="error">
              Cancel
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
};

export default CreateStudyResource;
