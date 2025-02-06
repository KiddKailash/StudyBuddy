import React, { useState, useContext } from "react";
import axios from "axios";

// MUI Imports
import IconButton from "@mui/material/IconButton";
import PriorityHighRoundedIcon from "@mui/icons-material/PriorityHighRounded";

// Import the new dialog
import RequestFeatureDialog from "./RequestFeatureDialog";

// Import any contexts you need
import { SnackbarContext } from "../../contexts/SnackbarContext";

const RequestFeature = () => {
  const BACKEND = import.meta.env.VITE_DIGITAL_OCEAN_URI;

  // Grab the token from localStorage (or your context)
  const token = localStorage.getItem("token");

  // Snackbar context for success/error
  const { showSnackbar } = useContext(SnackbarContext);

  // Dialog open/close
  const [dialogOpen, setDialogOpen] = useState(false);
  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);

  // Handle form submission from the dialog
  // 'features' is an array: [{ title: "...", description: "..." }, ...]
  const handleSubmit = async (features) => {
    try {
      await axios.post(
        `${BACKEND}/api/feature-request`,
        { features }, // <-- pass array of features
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showSnackbar("Your feature request(s) have been submitted!", "success");
    } catch (error) {
      console.error("Error submitting feature request:", error);
      showSnackbar(
        "Failed to submit feature request(s). Please try again.",
        "error"
      );
    } finally {
      closeDialog();
    }
  };

  return (
    <>
      <IconButton
        onClick={openDialog}
        sx={{
          height: 20,
          width: 20,
          bgcolor: "background.default",
          position: "fixed",
          top: "60px",
          right: "35px",
          zIndex: "100000",
          "&:hover": {
            bgcolor: "background.paper",
          },
        }}
      >
        <PriorityHighRoundedIcon sx={{ fontSize: 15 }} />
      </IconButton>

      <RequestFeatureDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default RequestFeature;
