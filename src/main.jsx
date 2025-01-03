import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SetTheme from "./contexts/ThemeProvider";
import { UserProvider } from "./contexts/UserContext";
import { BrowserRouter as Router } from "react-router-dom";
import { SnackbarProvider } from "./contexts/SnackbarContext.jsx";

import "./i18n.js";

import App from "./App.jsx";
import "./index.css";

/**
 * Renders the application with a global theme provider wrapped around it.
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SetTheme>
      <Router>
        <UserProvider>
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </UserProvider>
      </Router>
    </SetTheme>
  </StrictMode>
);
