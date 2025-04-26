import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

// Context Providers
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "./contexts/ThemeContext";

import { UserProvider } from "./contexts/User.jsx";
import { SnackbarProvider } from "./contexts/SnackbarContext.jsx";

// Localization, global styles
import "./translation/i18n.js";

// Main App
import App from "./layouts/App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <CssBaseline />
      <Router>
        <UserProvider>
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </UserProvider>
      </Router>
    </ThemeProvider>
  </StrictMode>
);
