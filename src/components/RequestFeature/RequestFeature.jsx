import React, { useState, useContext } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

// MUI Imports
import IconButton from "@mui/material/IconButton";
import PriorityHighRoundedIcon from "@mui/icons-material/PriorityHighRounded";

// Import the new dialog
import RequestFeatureDialog from "./RequestFeatureDialog";

// Import any contexts you need
import { SnackbarContext } from "../../contexts/SnackbarContext";

const RequestFeature = () => {
  const BACKEND = import.meta.env.VITE_DIGITAL_OCEAN_URI;
  const token = localStorage.getItem("token");

  // Snackbar context for success/error
  const { showSnackbar } = useContext(SnackbarContext);

  // i18n
  const { t } = useTranslation();

  // Dialog open/close
  const [dialogOpen, setDialogOpen] = useState(false);
  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);

  // Handle form submission from the dialog (the dialog will already be closed)
  // 'features' is an array of objects: [{ title: "...", description: "..." }, ...]
  const handleSubmit = async (features) => {
    try {
      await axios.post(
        `${BACKEND}/api/feature-request`,
        { features },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showSnackbar(t("success_message"), "success");
    } catch (error) {
      console.error("Error submitting feature request:", error);
      showSnackbar(t("error_message"), "error");
    }
    // The dialog is already closed from the child side, so do nothing else here
  };

  return (
    <>
      <IconButton
        onClick={openDialog}
        sx={{
          height: 20,
          width: 20,
          bgcolor: "background.default",
          position: "static",
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
