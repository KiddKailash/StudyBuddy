/**
 * SnackbarContext.jsx
 * 
 * This file provides a global snackbar notification system using Material-UI components.
 * It allows showing temporary notifications with different severity levels (error, warning, info, success)
 * that automatically disappear after a set duration.
 */

import React, { createContext, useState, useCallback } from "react";
import PropTypes from "prop-types";

// Material-UI components
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// Create the snackbar context
const SnackbarContext = createContext();

/**
 * SnackbarProvider component that manages snackbar state and provides context
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to be wrapped with snackbar context
 */
export const SnackbarProvider = ({ children }) => {
  // State for managing snackbar visibility and content
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // 'error', 'warning', 'info', 'success'
  });

  /**
   * Shows a snackbar notification with the given message and severity
   * @param {string} message - The message to display
   * @param {string} severity - The severity level ('error', 'warning', 'info', 'success')
   */
  const showSnackbar = useCallback((message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  /**
   * Handles closing the snackbar
   * @param {Object} event - The event object
   * @param {string} reason - The reason for closing ('clickaway' or 'timeout')
   */
  const handleClose = (event, reason) => {
    // Prevent closing when clicking away
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

// PropTypes Validation
SnackbarProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
