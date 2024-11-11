import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SetTheme from "./components/ColourTheme";
import { FlashcardProvider } from "./contexts/FlashcardContext.jsx";
import App from "./App.jsx";
import "./index.css";

/**
 * Renders the application with a global theme provider wrapped around it.
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SetTheme>
      <FlashcardProvider>
        <App />
      </FlashcardProvider>
    </SetTheme>
  </StrictMode>
);
