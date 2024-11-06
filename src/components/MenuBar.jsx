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

/**
 * MenuBar component renders the top navigation bar of the application.
 *
 * @return {JSX.Element} - The rendered MenuBar component.
 */
function MenuBar() {
  const theme = useTheme(); // Access the current theme settings

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
            <MenuItem link="/" name="StoryPath" />
            <MenuItem link="/Projects" name="Projects" />
          </Box>
          {/* Theme toggle button on the right */}
          <ThemeToggleButton />
        </Toolbar>
      </AppBar>
      {/* Main content area */}
      <Box component="main" sx={{ padding: 3 }}></Box>
    </Box>
  );
}

MenuBar.propTypes = {
  window: PropTypes.func,
};

export default MenuBar;
