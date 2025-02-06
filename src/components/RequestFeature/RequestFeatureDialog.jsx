import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
  Stack,
  IconButton,
  Divider,
  Box,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

/**
 * RequestFeatureDialog component for submitting multiple feature requests.
 *
 * @param {object}   props
 * @param {boolean}  props.open - If true, the dialog is displayed.
 * @param {function} props.onClose - Function to close the dialog.
 * @param {function} props.onSubmit - Function called when submitting the requests (an array).
 * @param {function} [props.t] - Optional translation function.
 */
const RequestFeatureDialog = ({ open, onClose, onSubmit, t }) => {
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
    onSubmit(features);
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
          p: 2
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: "1.5rem" }}>
        {t ? t("request_feature") : "Have Your Say!"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <DialogContentText sx={{ color: "text.secondary" }}>
            {t
              ? t("request_feature_prompt")
              : "We would love to hear from you. Tell us what feature you would like to use, and we will get to building it."}
          </DialogContentText>

          {features.map((feature, index) => (
            <Box key={index}>
              {index > 0 && <Divider sx={{ mb: 2 }} />}{" "}
              {/* Show Divider only for the second feature and beyond */}
              <Stack direction="row" spacing={1}>
                <TextField
                  label={t ? `${t("feature_title")}` : "Feature Title"}
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={feature.title}
                  onChange={(e) =>
                    handleFeatureChange(index, "title", e.target.value)
                  }
                  sx={{ borderRadius: "8px"}}
                />
                {features.length > 1 && (
                  <IconButton
                    onClick={() => removeFeatureRequest(index)}
                    color="error"
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                )}
              </Stack>
              <TextField
                label={t ? `${t("feature_description")}` : `Description`}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                size="small"
                value={feature.description}
                onChange={(e) =>
                  handleFeatureChange(index, "description", e.target.value)
                }
                sx={{ mt: 1, borderRadius: "8px" }}
              />
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
          {t ? t("cancel") : "Cancel"}
        </Button>
        <Button onClick={handleSubmit} variant="text">
          {t ? t("submit") : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

RequestFeatureDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  t: PropTypes.func,
};

export default RequestFeatureDialog;
