import React, { createContext, useContext, useReducer, useMemo } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";

import PropTypes from "prop-types";

// Create a context to track the current theme mode (light/dark)
const ThemeContext = createContext();

// Hook for any component to read or toggle the current theme
export function useThemeContext() {
  return useContext(ThemeContext);
}

// Reducer function to switch between light and dark mode
const themeReducer = (mode) => (mode === "light" ? "dark" : "light");

export default function ThemeProvider({ children }) {
  // Manage the mode state with React's useReducer
  const [mode, dispatch] = useReducer(themeReducer, "light");

  // Create a Material UI theme object based on the current mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
        // You can customize transitions/spacings/typography as needed
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
