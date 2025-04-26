import React from "react";
import PropTypes from "prop-types";

// MUI
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

// MUI Icons
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DriveFileMoveRoundedIcon from "@mui/icons-material/DriveFileMoveRounded";

/**
 * DropdownMenu for session actions: delete, rename, etc.
 */
const DropdownMenu = ({
  anchorEl,
  isOpen,
  onClose,
  onDeleteClick,
  onRenameClick,
  onMoveClick,
  t,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={isOpen}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <MenuItem onClick={onDeleteClick} color="error">
        <DeleteRoundedIcon fontSize="small" sx={{ mr: 1 }} />
        {t("delete")}
      </MenuItem>
      <MenuItem onClick={onRenameClick}>
        <EditRoundedIcon fontSize="small" sx={{ mr: 1 }} />
        {t("rename")}
      </MenuItem>
      <MenuItem onClick={onMoveClick}>
        <DriveFileMoveRoundedIcon fontSize="small" sx={{ mr: 1 }} />
        {t("move")}
      </MenuItem>
    </Menu>
  );
};

DropdownMenu.propTypes = {
  anchorEl: PropTypes.any,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  onRenameClick: PropTypes.func.isRequired,
  onMoveClick: PropTypes.func.isRequired,
  onPrintClick: PropTypes.func,
  t: PropTypes.func.isRequired,
};

export default DropdownMenu;
