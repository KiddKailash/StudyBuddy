import { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Contexts
import { UserContext } from "../../contexts/UserContext";
import { SnackbarContext } from "../../contexts/SnackbarContext";

// MUI
import { useTheme } from "@mui/material/styles";

export default function useSidebar() {
  // All hooks are called unconditionally at the top
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
    multipleChoiceQuizzes,
    summaries,
    aiChats,
    renameQuiz,
    deleteQuiz,
    renameSummary,
    deleteSummary,
    renameAiChat,
    deleteAiChat,
  } = useContext(UserContext);

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedResourceType, setSelectedResourceType] = useState(null);
  const [dialogState, setDialogState] = useState({
    type: null,
    open: false,
    sessionId: null,
    resourceType: null,
  });
  const [newSessionName, setNewSessionName] = useState("");

  useEffect(() => {
    if (flashcardError) {
      showSnackbar(t("error_loading_study_sessions", { error: flashcardError }), "error");
    }
  }, [flashcardError, showSnackbar, t]);

  const isCreateSessionActive = location.pathname === "/";

  const handleMenuOpen = (event, sessionId, resourceType) => {
    event.stopPropagation();
    event.preventDefault();
    setMenuAnchorEl(event.currentTarget);
    setSelectedSessionId(sessionId);
    setSelectedResourceType(resourceType);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedSessionId(null);
    setSelectedResourceType(null);
  };

  const handleDialogOpen = (type) => {
    setDialogState({
      type,
      open: true,
      sessionId: selectedSessionId,
      resourceType: selectedResourceType,
    });
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogState({ type: null, open: false, sessionId: null, resourceType: null });
    setNewSessionName("");
  };

  const handleConfirmAction = async () => {
    const { type, sessionId, resourceType } = dialogState;
    if (!sessionId || !resourceType) {
      console.error("Session not found: missing sessionId or resourceType");
      return;
    }
    try {
      if (resourceType === "flashcard") {
        const combinedSessions = [...localSessions, ...flashcardSessions];
        const targetSession = combinedSessions.find((s) => s.id === sessionId);
        if (!targetSession) {
          console.error("Session not found:", sessionId);
          return;
        }
        if (targetSession.sessionType === "local") {
          if (type === "delete") {
            deleteLocalSession(sessionId);
          } else if (type === "rename") {
            if (!newSessionName.trim()) {
              showSnackbar(t("please_enter_valid_session_name"), "error");
              return;
            }
            updateLocalSession(sessionId, newSessionName.trim());
          }
        } else {
          if (type === "delete") {
            deleteFlashcardSession(sessionId);
          } else if (type === "rename") {
            if (!newSessionName.trim()) {
              showSnackbar(t("please_enter_valid_session_name"), "error");
              return;
            }
            updateFlashcardSessionName(sessionId, newSessionName.trim());
          }
        }
      } else if (resourceType === "quiz") {
        if (type === "delete") {
          await deleteQuiz(sessionId);
        } else if (type === "rename") {
          if (!newSessionName.trim()) {
            showSnackbar(t("please_enter_valid_session_name"), "error");
            return;
          }
          await renameQuiz(sessionId, newSessionName.trim());
        }
      } else if (resourceType === "summary") {
        if (type === "delete") {
          await deleteSummary(sessionId);
        } else if (type === "rename") {
          if (!newSessionName.trim()) {
            showSnackbar(t("please_enter_valid_session_name"), "error");
            return;
          }
          await renameSummary(sessionId, newSessionName.trim());
        }
      } else if (resourceType === "chat") {
        if (type === "delete") {
          await deleteAiChat(sessionId);
        } else if (type === "rename") {
          if (!newSessionName.trim()) {
            showSnackbar(t("please_enter_valid_session_name"), "error");
            return;
          }
          await renameAiChat(sessionId, newSessionName.trim());
        }
      }
      handleDialogClose();
    } catch (error) {
      console.error("Error in handleConfirmAction:", error);
      showSnackbar(error.message || t("action_failed"), "error");
    }
  };

  return {
    theme,
    t,
    location,
    flashcardSessions,
    localSessions,
    loadingSessions,
    multipleChoiceQuizzes,
    summaries,
    aiChats,
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
