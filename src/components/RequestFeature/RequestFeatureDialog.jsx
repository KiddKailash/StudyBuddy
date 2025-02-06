import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

// MUI imports
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const RequestFeatureDialog = ({ open, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [features, setFeatures] = useState([{ title: "", description: "" }]);

  // Update a feature field (title or description)
  const handleFeatureChange = (index, field, value) => {
    const updated = [...features];
    updated[index][field] = value;
    setFeatures(updated);
  };

  // Add a new feature row
  const addFeatureRequest = () => {
    setFeatures([...features, { title: "", description: "" }]);
  };

  // Remove a feature row
  const removeFeatureRequest = (index) => {
    const updated = features.filter((_, i) => i !== index);
    setFeatures(updated);
  };

  // Submit the features
  const handleSubmit = () => {
    // 1) Filter out rows where BOTH title and description are empty
    const filteredFeatures = features.filter(
      (f) => f.title.trim() !== "" || f.description.trim() !== ""
    );

    // 2) If none remain after filtering, do nothing (leave dialog open)
    if (filteredFeatures.length === 0) {
      // Optionally show an error or visual feedback here
      return;
    }

    // 3) Pass only non-empty pairs up to the parent
    onSubmit(filteredFeatures);

    // 4) Close the dialog and reset the form fields
    onClose();
    setFeatures([{ title: "", description: "" }]);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="request-feature-dialog-title"
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: "12px",
          p: 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: "1.5rem" }}>
        {t("request_feature")}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <DialogContentText sx={{ color: "text.secondary" }}>
            {t("request_feature_prompt_I")}
          </DialogContentText>
          <DialogContentText sx={{ color: "text.secondary" }}>
            {t("request_feature_prompt_II")}
          </DialogContentText>

          {features.map((feature, index) => (
            <Box key={index}>
              {index > 0 && <Divider sx={{ mb: 2 }} />}

              {/* Container for both Title & Description */}
              <Box
                sx={{
                  position: "relative",
                  ".delete-button": {
                    display: "inline-flex",
                  },
                }}
              >
                <TextField
                  label={t("feature_title")}
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={feature.title}
                  onChange={(e) =>
                    handleFeatureChange(index, "title", e.target.value)
                  }
                  sx={{ mb: 1, borderRadius: "8px" }}
                />

                <TextField
                  label={t("feature_description")}
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  size="small"
                  value={feature.description}
                  onChange={(e) =>
                    handleFeatureChange(index, "description", e.target.value)
                  }
                  sx={{ borderRadius: "8px" }}
                />

                {features.length > 1 && (
                  <IconButton
                    className="delete-button"
                    onClick={() => removeFeatureRequest(index)}
                    sx={{
                      display: "none",
                      position: "absolute",
                      top: 0,
                      right: 0,
                    }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                )}
              </Box>
            </Box>
          ))}
        </Stack>

        <Box sx={{ textAlign: "left", mt: 2 }}>
          <IconButton onClick={addFeatureRequest}>
            <AddRoundedIcon />
          </IconButton>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button onClick={onClose} variant="text">
          {t("cancel")}
        </Button>
        <Button onClick={handleSubmit} variant="text">
          {t("submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

RequestFeatureDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default RequestFeatureDialog;
