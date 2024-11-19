import React, { useContext } from "react";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import ThemeToggleButton from '../contexts/ThemeProvider';

// MUI Component Imports
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

// Context
import { UserContext } from "../contexts/UserContext";
import MenuItem from "./MenuItem";

/**
 * MenuBar component renders the top navigation bar of the application.
 *
 * @param {function} handleDrawerToggle - Function to toggle the sidebar drawer.
 * @return {JSX.Element} - The rendered MenuBar component.
 */
function MenuBar({ handleDrawerToggle }) {
  const { user, resetUserContext, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const theme = useTheme(); // Access the current theme settings

  /**
   * Handles the logout process.
   * - Removes the JWT token and user data from localStorage.
   * - Updates the login state.
   * - Redirects to the login page.
   */
  const handleLogout = () => {
    resetUserContext(); // Clears user data and resets login state
    navigate("/login"); // Redirects to login page
  };

  /**
   * Handles account type display based on user's subscription status.
   *
   * @returns {string} - The formatted account type string.
   */
  const getAccountTypeDisplay = () => {
    if (!user || !user.accountType) return "";
    // Capitalize the first letter and append 'User'
    return `${user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1)} User`;
  };

  return (
    <AppBar
      component="nav"
      position="fixed"
      sx={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.secondary,
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.backgroundAndText,
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        {/* Menu Icon for Mobile */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Left side menu items */}
        <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center" }}>
          <MenuItem link="/upgrade" name="Upgrade" />
          <ThemeToggleButton />
          {/* Add more menu items as needed */}
        </Box>

        {/* Right side: Subscription status and Logout button */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {user && (
            <Typography variant="body1" sx={{ mr: 2 }}>
              {getAccountTypeDisplay()}
            </Typography>
          )}
          <Button variant="contained" sx={{ ml: 2 }} onClick={handleLogout}>
            Log Out
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

MenuBar.propTypes = {
  handleDrawerToggle: PropTypes.func.isRequired, // Function to toggle the drawer
};

export default MenuBar;
