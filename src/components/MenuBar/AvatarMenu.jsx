// src/components/MenuBar/AvatarMenu.jsx
import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import SettingsIcon from "@mui/icons-material/Settings";
import { SnackbarContext } from "../../contexts/SnackbarContext";
import { getAvatarColor, getUserInitials } from "./menubarUtils";

/**
 * AvatarMenu component handles the user avatar and dropdown menu.
 *
 * @param {object} props - Component props.
 * @param {object} props.user - User object containing user details.
 * @param {function} props.onLogout - Function to handle user logout.
 * @returns {JSX.Element} - The rendered AvatarMenu component.
 */
const AvatarMenu = ({ user, onLogout }) => {
  const theme = useTheme();
  const { showSnackbar } = useContext(SnackbarContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  /**
   * Opens the avatar menu.
   * @param {object} event - The click event.
   */
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Closes the avatar menu.
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        onClick={handleMenuOpen}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={open ? "account-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <Avatar
          sx={{
            bgcolor: getAvatarColor(user.email, theme),
            color: "#ffffff",
          }}
        >
          {getUserInitials(user)}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem component={Link} to="/settings">
          <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={onLogout}>
          <Typography variant="inherit" color="error">
            Log Out
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

AvatarMenu.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    accountType: PropTypes.string,
  }).isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default AvatarMenu;
