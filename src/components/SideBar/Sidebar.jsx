import React, { useState, useContext, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import CircularProgress from "@mui/material/CircularProgress";
import ListItemIcon from "@mui/material/ListItemIcon";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Typography from "@mui/material/Typography";

import { useTranslation } from "react-i18next";

import { UserContext } from "../../contexts/UserContext";
import { SnackbarContext } from "../../contexts/SnackbarContext";

import SessionItem from "./SessionItem";
import DropdownMenu from "./DropdownMenu";
import ConfirmationDialog from "./ConfirmationDialog";

const Sidebar = ({
  mobileOpen,
  handleDrawerToggle,
  drawerWidth,
  menubarHeight,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  // Track menu anchor for "options" (three dots)
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  // Track which session is selected in the three-dot menu
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Dialog state includes type (delete/rename), open boolean, and the sessionId
  const [dialogState, setDialogState] = useState({
    type: null,
    open: false,
    sessionId: null,
  });

  const [newSessionName, setNewSessionName] = useState("");

  // Notify user of any loading errors for flashcard sessions
  useEffect(() => {
    if (flashcardError) {
      showSnackbar(
        t("error_loading_study_sessions", { error: flashcardError }),
        "error"
      );
    }
  }, [flashcardError, showSnackbar, t]);

  // Check if current route is the "Create new session" screen
  const isCreateSessionActive = location.pathname === "/";

  /**
   * Common MUI styles for session list items
   */
  const commonButtonStyles = (themeParam, isActive = false) => ({
    mr: 1,
    ml: 1,
    borderRadius: 3,
    backgroundColor: isActive
      ? themeParam.palette.action.selected
      : "transparent",
    "&.Mui-selected": {
      backgroundColor: themeParam.palette.action.selected,
    },
    "&:hover": {
      backgroundColor: themeParam.palette.action.selected,
    },
    color: "text.primary",
    "& .MuiListItemText-root": { color: "text.primary" },
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  });

  /**
   * Opens the three-dot menu for the given session
   */
  const handleMenuOpen = (event, sessionId) => {
    event.stopPropagation();
    event.preventDefault();
    setMenuAnchorEl(event.currentTarget);
    setSelectedSessionId(sessionId);
  };

  /**
   * Closes the three-dot menu
   */
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedSessionId(null);
  };

  /**
   * Opens the rename/delete dialog for the selected session
   */
  const handleDialogOpen = (type) => {
    setDialogState({
      type,
      open: true,
      sessionId: selectedSessionId,
    });
    handleMenuClose();
  };

  /**
   * Closes the rename/delete dialog
   */
  const handleDialogClose = () => {
    setDialogState({
      type: null,
      open: false,
      sessionId: null,
    });
    setNewSessionName("");
  };

  /**
   * DB-based session actions
   */
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

  /**
   * Local ephemeral session actions
   */
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

  /**
   * Processes the user's confirm action from the dialog
   */
  const handleConfirmAction = () => {
    const { type, sessionId } = dialogState;
    if (!sessionId) {
      console.error("Session not found: no sessionId in dialogState");
      return;
    }

    // Merge local and DB sessions
    const combinedSessions = [...localSessions, ...flashcardSessions];
    // Find target session
    const targetSession = combinedSessions.find((s) => s.id === sessionId);
    if (!targetSession) {
      console.error("Session not found:", sessionId);
      return;
    }

    // Execute the appropriate action based on session type and dialog type
    if (targetSession.sessionType === "local") {
      if (type === "delete") {
        handleDeleteLocalSession(sessionId);
      } else if (type === "rename") {
        handleRenameLocalSession(sessionId);
      }
    } else {
      if (type === "delete") {
        handleDeleteDbSession(sessionId);
      } else if (type === "rename") {
        handleRenameDbSession(sessionId);
      }
    }
  };

  /**
   * Renders the main drawer content, including DB-based and local sessions
   */
  const drawerContent = (
    <Box sx={{ width: drawerWidth }}>
      <List component="nav">
        {loadingSessions ? (
          <ListItem sx={{ justifyContent: "center" }}>
            <CircularProgress color="inherit" />
          </ListItem>
        ) : (
          <>
            {/* Logo / Branding */}
            <ListItem key="StudyBuddy">
              <ListItemIcon>
                <Avatar src="/assets/flashcards.png" alt="Study Buddy Icon" />
              </ListItemIcon>

              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: theme.palette.primary.main }}
              >
                StudyBuddy.ai
              </Typography>
            </ListItem>

            {/* Create Session Button */}
            <ListItem disablePadding key="create-session">
              <ListItemButton
                component={Link}
                to="/"
                selected={isCreateSessionActive}
                sx={(themeParam) =>
                  commonButtonStyles(themeParam, isCreateSessionActive)
                }
                onClick={isMobile ? handleDrawerToggle : undefined}
              >
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {t("create_study_session")}
                </Typography>
                <AddRoundedIcon sx={{ color: theme.palette.text.secondary }} />
              </ListItemButton>
            </ListItem>

            {/* DB-based sessions */}
            {flashcardSessions.map((session) => {
              const isActive =
                location.pathname === `/flashcards/${session.id}`;
              return (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={isActive}
                  handleMenuOpen={handleMenuOpen}
                  commonButtonStyles={commonButtonStyles}
                  routePath={`/flashcards/${session.id}`}
                />
              );
            })}

            {/* Local ephemeral sessions */}
            {localSessions.map((session) => {
              const isActive =
                location.pathname === `/flashcards-local/${session.id}`;
              return (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={isActive}
                  handleMenuOpen={handleMenuOpen}
                  commonButtonStyles={commonButtonStyles}
                  routePath={`/flashcards-local/${session.id}`}
                />
              );
            })}
          </>
        )}
      </List>

      {/* Dropdown menu (three dots) */}
      <DropdownMenu
        anchorEl={menuAnchorEl}
        isOpen={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onDeleteClick={() => handleDialogOpen("delete")}
        onRenameClick={() => handleDialogOpen("rename")}
        t={t}
      />

      {/* Confirmation dialog for delete/rename actions */}
      <ConfirmationDialog
        open={dialogState.open}
        type={dialogState.type}
        onClose={handleDialogClose}
        onConfirm={handleConfirmAction}
        newSessionName={newSessionName}
        setNewSessionName={setNewSessionName}
        t={t}
      />
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Permanent drawer (desktop) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            height: `calc(100% - ${menubarHeight}px)`,
            boxSizing: "border-box",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

Sidebar.propTypes = {
  mobileOpen: PropTypes.bool.isRequired,
  handleDrawerToggle: PropTypes.func.isRequired,
  drawerWidth: PropTypes.string.isRequired,
  menubarHeight: PropTypes.string.isRequired,
};

export default Sidebar;
