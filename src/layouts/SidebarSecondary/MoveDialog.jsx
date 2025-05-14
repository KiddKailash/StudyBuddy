import React from "react";
import PropTypes from "prop-types";

// MUI
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

/**
 * MoveDialog component for moving a session to a different folder.
 */
const MoveDialog = ({
  open,
  onClose,
  onConfirm,
  folders,
  selectedFolderId,
  setSelectedFolderId,
  t,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby="move-dialog-title"
    sx={{ textAlign: "center" }}
    PaperProps={{
      sx: {
        borderRadius: "12px",
        p: 2,
      },
    }}
  >
    <DialogTitle id="move-dialog-title">
      {t("move_study_session")}
    </DialogTitle>
    <DialogContent>
      <DialogContentText>
        {t("move_prompt")}
      </DialogContentText>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel id="folder-select-label">{t("select_folder")}</InputLabel>
        <Select
          labelId="folder-select-label"
          id="folder-select"
          value={selectedFolderId}
          label={t("select_folder")}
          onChange={(e) => setSelectedFolderId(e.target.value)}
        >
          <MenuItem value="null">{t("unfoldered")}</MenuItem>
          {folders.map((folder) => (
            <MenuItem key={folder.id} value={folder.id}>
              {folder.folderName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </DialogContent>
    <DialogActions
      sx={{
        justifyContent: "center",
      }}
    >
      <Button onClick={onClose} color="primary">
        {t("cancel")}
      </Button>
      <Button onClick={onConfirm} color="primary">
        {t("move")}
      </Button>
    </DialogActions>
  </Dialog>
);

MoveDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  folders: PropTypes.array.isRequired,
  selectedFolderId: PropTypes.string,
  setSelectedFolderId: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default MoveDialog; 