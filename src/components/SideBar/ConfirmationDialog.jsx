import React from "react";
import PropTypes from "prop-types";

// MUI Component Imports
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

/**
 * ConfirmationDialog component for confirming delete or rename actions.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.open - Indicates if the dialog is open.
 * @param {string} props.type - The type of action ('delete' or 'rename').
 * @param {function} props.onClose - Function to close the dialog.
 * @param {function} props.onConfirm - Function to confirm the action.
 * @param {string} props.newSessionName - The new session name (for rename action).
 * @param {function} props.setNewSessionName - Function to set the new session name.
 * @param {function} props.t - Translation function.
 * @returns {JSX.Element} The ConfirmationDialog component.
 */
const ConfirmationDialog = ({
  open,
  type,
  onClose,
  onConfirm,
  newSessionName,
  setNewSessionName,
  t,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby="confirm-dialog-title"
    sx={{ textAlign: "center" }}
  >
    <DialogTitle id="confirm-dialog-title">
      {type === "delete"
        ? t("delete_study_session")
        : t("rename_study_session")}
    </DialogTitle>
    <DialogContent>
      <DialogContentText>
        {type === "delete" ? t("delete_confirmation") : t("rename_prompt")}
      </DialogContentText>
      {type === "rename" && (
        <TextField
          autoFocus
          margin="dense"
          label={t("new_session_name")}
          type="text"
          fullWidth
          variant="outlined"
          value={newSessionName}
          onChange={(e) => setNewSessionName(e.target.value)}
        />
      )}
    </DialogContent>
    <DialogActions
      sx={{
        justifyContent: "center",
      }}
    >
      <Button onClick={onClose} color="primary">
        {t("cancel")}
      </Button>
      <Button
        onClick={onConfirm}
        color={type === "delete" ? "error" : "primary"}
      >
        {type === "delete" ? t("delete") : t("rename")}
      </Button>
    </DialogActions>
  </Dialog>
);

ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  newSessionName: PropTypes.string,
  setNewSessionName: PropTypes.func,
  t: PropTypes.func.isRequired,
};

export default ConfirmationDialog;
