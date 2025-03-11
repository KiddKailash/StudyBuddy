import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

// Context Providers
import ThemeProvider from "./contexts/ThemeProvider";
import { UserProvider } from "./contexts/UserContext";
import { SnackbarProvider } from "./contexts/SnackbarContext.jsx";

// Localization, global styles
import "./i18n.js";

// Main App
import App from "./layouts/App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
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
