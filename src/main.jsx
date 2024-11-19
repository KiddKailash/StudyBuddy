import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SetTheme from "./contexts/ThemeProvider";
import { UserProvider } from "./contexts/UserContext";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./App.jsx";
import "./index.css";

/**
 * Renders the application with a global theme provider wrapped around it.
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SetTheme>
      <UserProvider>
        <Router>
          <App />
        </Router>
      </UserProvider>
    </SetTheme>
  </StrictMode>
);
