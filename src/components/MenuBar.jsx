// src/components/MenuBar.jsx
import React from "react";
import PropTypes from "prop-types";
import { ThemeToggleButton } from "./ColourTheme";
import MenuItem from "./MenuItem";

// ================================
// MUI Component Imports
// ================================
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

/**
 * MenuBar component renders the top navigation bar of the application.
 *
 * @param {Object} props - Component props.
 * @param {Function} props.setIsLoggedIn - Function to update the login state.
 * @param {Object} props.user - User information object.
 * @return {JSX.Element} - The rendered MenuBar component.
 */
function MenuBar({ setIsLoggedIn, user }) {
  const theme = useTheme(); // Access the current theme settings

  /**
   * Handles the logout process.
   * - Removes the JWT token and user data from localStorage.
   * - Updates the login state.
   * - Optionally, notifies the user.
   */
  const handleLogout = () => {
    // Remove the token and user from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Update the login state
    setIsLoggedIn(false);

    // Optionally, you can show a confirmation message
    alert("You have been logged out successfully.");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        component="nav"
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.secondary,
          zIndex: theme.zIndex.drawer + 1,
          // Apply centralized transition from theme
          transition: theme.transitions.backgroundAndText,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            minHeight: "64px",
            padding: "0 24px",
          }}
        >
          {/* Left side menu items */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <MenuItem link="/" name="Home" />
            <MenuItem link="/Settings" name="Settings" />
          </Box>
          {/* Right side: Subscription status, Theme toggle, and Logout button */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {user && (
              <Typography variant="body1" sx={{ mr: 2 }}>
                {user.accountType === "free"
                  ? "Free User"
                  : `${user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1)} User`}
              </Typography>
            )}
            <ThemeToggleButton />
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{ ml: 2 }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      {/* Main content area */}
      <Box component="main" sx={{ padding: 3, mt: "64px" }}>
        {/* Your main content will go here */}
      </Box>
    </Box>
  );
}

MenuBar.propTypes = {
  setIsLoggedIn: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string,
    email: PropTypes.string,
    accountType: PropTypes.string,
  }),
};

MenuBar.defaultProps = {
  user: null,
};

export default MenuBar;
