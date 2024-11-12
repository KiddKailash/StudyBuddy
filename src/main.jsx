import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SetTheme from "./components/ColourTheme";
import { UserProvider } from "./contexts/UserContext";

import App from "./App.jsx";
import "./index.css";

/**
 * Renders the application with a global theme provider wrapped around it.
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SetTheme>
      <UserProvider>
        <App />
      </UserProvider>
    </SetTheme>
  </StrictMode>
);
