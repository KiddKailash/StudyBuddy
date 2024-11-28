import React from "react";
import PropTypes from "prop-types";

// MUI Component Imports
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

// MUI Icon Imports
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";

/**
 * DropdownMenu component for session actions like delete, rename, and print.
 *
 * @param {object} props - Component props.
 * @param {HTMLElement} props.anchorEl - The element that the menu should be anchored to.
 * @param {boolean} props.isOpen - Indicates if the menu is open.
 * @param {function} props.onClose - Function to close the menu.
 * @param {function} props.onDeleteClick - Function to handle delete action.
 * @param {function} props.onRenameClick - Function to handle rename action.
 * @param {function} props.onPrintClick - Function to handle print action.
 * @param {function} props.t - Translation function.
 * @returns {JSX.Element} The SessionMenu component.
 */
const DropdownMenu = ({
  anchorEl,
  isOpen,
  onClose,
  onDeleteClick,
  onRenameClick,
  onPrintClick,
  t,
}) => (
  <Menu
    anchorEl={anchorEl}
    open={isOpen}
    onClose={onClose}
    anchorOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
  >
    <MenuItem onClick={onDeleteClick} color="error">
      <DeleteRoundedIcon fontSize="small" sx={{ mr: 1 }} />
      {t("delete")}
    </MenuItem>
    <MenuItem onClick={onRenameClick}>
      <EditRoundedIcon fontSize="small" sx={{ mr: 1 }} />
      {t("rename")}
    </MenuItem>
    <MenuItem onClick={onPrintClick}>
      <PrintRoundedIcon fontSize="small" sx={{ mr: 1 }} />
      {t("print")}
    </MenuItem>
  </Menu>
);

DropdownMenu.propTypes = {
  anchorEl: PropTypes.any,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  onRenameClick: PropTypes.func.isRequired,
  onPrintClick: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default DropdownMenu;
