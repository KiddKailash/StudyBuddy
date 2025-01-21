import React, { createContext, useContext, useReducer, useMemo } from "react";
import PropTypes from "prop-types";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";

// Create a context to track the current theme mode (light/dark)
const ThemeContext = createContext();

// Hook for any component to read or toggle the current theme
export function useThemeContext() {
  return useContext(ThemeContext);
}

// Reducer function to switch between light and dark mode
const themeReducer = (mode) => (mode === "light" ? "dark" : "light");

// Helper function to detect the user's preferred color scheme
function getSystemPreference() {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light"; // Fallback if matchMedia not available
}

export default function ThemeProvider({ children }) {
  // Initialize with system preference
  const [mode, dispatch] = useReducer(themeReducer, getSystemPreference());

  // Create a Material UI theme object based on the current mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          background: {
            default: mode === "light" ? "#ffffff" : "#0D0D0D", // Default background color
            paper: mode === "light" ? "#f5f5f5" : "#1e1e1e",   // Paper background color
          },
        },
        // You can customize transitions/spacings/typography/etc. as needed
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, dispatch }}>
      <MuiThemeProvider theme={theme}>
        {/* Normalizes and applies MUI baseline styles */}
        <CssBaseline />
        {/* Smooth background and text transitions */}
        <GlobalStyles
          styles={{
            "*": {
              transition: "background-color 0.1s ease, color 0.1s ease",
            },
            "html, body": {
              height: "100%",
              margin: 0,
              padding: 0,
            },
            "#root": {
              height: "100%",
            },
          }}
        />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
