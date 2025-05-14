import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";

// Components
import RequestFeatureDialog from "./RequestFeatureDialog";

// MUI Components
import IconButton from "@mui/material/IconButton";
import BiotechRoundedIcon from "@mui/icons-material/BiotechRounded";

// Contexts
import { SnackbarContext } from "../../contexts/Snackbar";
import { UserContext } from "../../contexts/User";

const RequestFeature = () => {
  // Snackbar context for success/error
  const { showSnackbar } = useContext(SnackbarContext);
  const { t } = useTranslation();

  // Bring in the new requestFeature function from context
  const { requestFeature } = useContext(UserContext);

  // Dialog open/close
  const [dialogOpen, setDialogOpen] = useState(false);
  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);

  // Handle form submission from the dialog
  // 'features' is an array of objects: [{ title: "...", description: "..." }, ...]
  const handleSubmit = async (features) => {
    try {
      await requestFeature(features);
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
        size="large"
        sx={{
          "&:hover": {
            color: "primary.main",
          },
        }}
      >
        <BiotechRoundedIcon />
      </IconButton>

      <RequestFeatureDialog open={dialogOpen} onClose={closeDialog} onSubmit={handleSubmit} />
    </>
  );
};

export default RequestFeature;
