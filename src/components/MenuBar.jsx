import React, { useContext } from "react";
import { ThemeToggleButton } from "../contexts/ThemeProvider";
import MenuItem from "./MenuItem";
import { UserContext } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

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
 * @return {JSX.Element} - The rendered MenuBar component.
 */
function MenuBar() {
  const { user, setIsLoggedIn, resetUserContext } = useContext(UserContext);
  const navigate = useNavigate();
  const theme = useTheme(); // Access the current theme settings

  /**
   * Handles the logout process.
   * - Removes the JWT token and user data from localStorage.
   * - Updates the login state.
   * - Optionally, notifies the user.
   */
  const handleLogout = () => {
    resetUserContext(); // Clears user data and resets login state
    navigate("/login"); // Redirects to login page
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
            <MenuItem link="/upgrade" name="Upgrade" />
            {/* Add more menu items as needed */}
          </Box>
          {/* Right side: Subscription status, Theme toggle, and Logout button */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {user && (
              <Typography variant="body1" sx={{ mr: 2 }}>
                {user.accountType === "free"
                  ? "Free User"
                  : `${
                      user.accountType.charAt(0).toUpperCase() +
                      user.accountType.slice(1)
                    } User`}
              </Typography>
            )}
            <ThemeToggleButton />
            <Button variant="contained" sx={{ ml: 2 }} onClick={handleLogout}>
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

export default MenuBar;
