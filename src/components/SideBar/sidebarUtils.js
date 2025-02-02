import { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import { UserContext } from "../../contexts/UserContext";
import { SnackbarContext } from "../../contexts/SnackbarContext";

export default function useSidebar() {
  const theme = useTheme();
  const { t } = useTranslation();
  const location = useLocation();

  const { showSnackbar } = useContext(SnackbarContext);
  const {
    flashcardSessions,
    localSessions,
    loadingSessions,
    flashcardError,
    deleteLocalSession,
    updateLocalSession,
    deleteFlashcardSession,
    updateFlashcardSessionName,
  } = useContext(UserContext);

  // Track menu anchor for the three-dot menu
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  // Track selected session for menu actions
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Dialog state includes type (delete/rename), open boolean, sessionId
  const [dialogState, setDialogState] = useState({
    type: null,
    open: false,
    sessionId: null,
  });

  const [newSessionName, setNewSessionName] = useState("");

  // Show error snackbar if there's a loading error
  useEffect(() => {
    if (flashcardError) {
      showSnackbar(
        t("error_loading_study_sessions", { error: flashcardError }),
        "error"
      );
    }
  }, [flashcardError, showSnackbar, t]);

  // Check if we’re on the "Create Session" route
  const isCreateSessionActive = location.pathname === "/";

  // Open three-dot menu
  const handleMenuOpen = (event, sessionId) => {
    event.stopPropagation();
    event.preventDefault();
    setMenuAnchorEl(event.currentTarget);
    setSelectedSessionId(sessionId);
  };

  // Close three-dot menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedSessionId(null);
  };

  // Open rename/delete dialog
  const handleDialogOpen = (type) => {
    setDialogState({
      type,
      open: true,
      sessionId: selectedSessionId,
    });
    handleMenuClose();
  };

  // Close rename/delete dialog
  const handleDialogClose = () => {
    setDialogState({
      type: null,
      open: false,
      sessionId: null,
    });
    setNewSessionName("");
  };

  // Handle DB session operations
  const handleDeleteDbSession = (id) => {
    deleteFlashcardSession(id);
    handleDialogClose();
  };

  const handleRenameDbSession = (id) => {
    if (!newSessionName.trim()) {
      showSnackbar(t("please_enter_valid_session_name"), "error");
      return;
    }
    updateFlashcardSessionName(id, newSessionName.trim());
    handleDialogClose();
  };

  // Handle local session operations
  const handleDeleteLocalSession = (id) => {
    deleteLocalSession(id);
    handleDialogClose();
  };

  const handleRenameLocalSession = (id) => {
    if (!newSessionName.trim()) {
      showSnackbar(t("please_enter_valid_session_name"), "error");
      return;
    }
    updateLocalSession(id, newSessionName.trim());
    handleDialogClose();
  };

  // When user confirms in dialog
  const handleConfirmAction = () => {
    const { type, sessionId } = dialogState;
    if (!sessionId) {
      console.error("Session not found: no sessionId in dialogState");
      return;
    }

    const combinedSessions = [...localSessions, ...flashcardSessions];
    const targetSession = combinedSessions.find((s) => s.id === sessionId);
    if (!targetSession) {
      console.error("Session not found:", sessionId);
      return;
    }

    if (targetSession.sessionType === "local") {
      if (type === "delete") handleDeleteLocalSession(sessionId);
      else if (type === "rename") handleRenameLocalSession(sessionId);
    } else {
      if (type === "delete") handleDeleteDbSession(sessionId);
      else if (type === "rename") handleRenameDbSession(sessionId);
    }
  };

  return {
    theme,
    t,
    location,
    flashcardSessions,
    localSessions,
    loadingSessions,
    isCreateSessionActive,
    menuAnchorEl,
    dialogState,
    newSessionName,
    setNewSessionName,
    handleMenuOpen,
    handleMenuClose,
    handleDialogOpen,
    handleDialogClose,
    handleConfirmAction,
  };
}
