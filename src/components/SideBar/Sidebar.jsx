import React, { useState, useContext, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";

import { UserContext } from "../../contexts/UserContext";
import { SnackbarContext } from "../../contexts/SnackbarContext";

import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { useTranslation } from "react-i18next";
import SessionItem from "./SessionItem";
import DropdownMenu from "./DropdownMenu";
import ConfirmationDialog from "./ConfirmationDialog";
import { ListItemIcon } from "@mui/material";

/**
 * Sidebar - displays the list of DB-based and local flashcard sessions.
 */
const Sidebar = ({
  mobileOpen,
  handleDrawerToggle,
  drawerWidth,
  menubarHeight,
}) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t } = useTranslation();
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

  // Menu anchor for "options" (three dots)
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  // We still track which session is selected in the menu,
  // but we won't rely on it for confirm actions.
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Dialog state includes type (delete/rename), open boolean, and now the sessionId
  const [dialogState, setDialogState] = useState({
    type: null,
    open: false,
    sessionId: null,
  });

  const [newSessionName, setNewSessionName] = useState("");

  useEffect(() => {
    if (flashcardError) {
      showSnackbar(
        t("error_loading_study_sessions", { error: flashcardError }),
        "error"
      );
    }
  }, [flashcardError, showSnackbar, t]);

  // Check if we are on the "Create new session" screen
  const isCreateSessionActive = location.pathname === "/";

  // Common MUI styles for session list items
  const commonButtonStyles = (theme, isActive = false) => ({
    mr: 1,
    ml: 1,
    borderRadius: 3,
    backgroundColor: isActive ? theme.palette.action.selected : "transparent",
    "&.Mui-selected": { backgroundColor: theme.palette.action.selected },
    "&:hover": { backgroundColor: theme.palette.action.selected },
    transition: theme.transitions.create(["background-color"], {
      duration: theme.transitions.duration.standard,
    }),
    color: "text.primary",
    "& .MuiListItemText-root": { color: "text.primary" },
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  });

  /**
   * Opens the menu (three dots) for a specific session
   */
  const handleMenuOpen = (event, sessionId) => {
    event.stopPropagation();
    event.preventDefault();
    setMenuAnchorEl(event.currentTarget);
    setSelectedSessionId(sessionId);
  };

  /**
   * Closes the menu
   */
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    // Optionally clear the selected session ID here
    setSelectedSessionId(null);
  };

  /**
   * Opens the rename/delete dialog and stores both the type of action
   * (delete or rename) and the sessionId in the dialog state
   */
  const handleDialogOpen = (type) => {
    setDialogState({
      type,
      open: true,
      sessionId: selectedSessionId, // Store ID here before we close the menu
    });
    handleMenuClose(); // Clears selectedSessionId, but we have it in dialogState now
  };

  /**
   * Closes the rename/delete dialog
   */
  const handleDialogClose = () => {
    setDialogState({ type: null, open: false, sessionId: null });
    setNewSessionName("");
  };

  /**
   * DB-based logic (delete or rename)
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
   * Local ephemeral logic (delete or rename)
   */
  const handleDeleteLocalSession = (id) => {
    deleteLocalSession(id);
    handleDialogClose();
  };

  const handleRenameLocalSession = (sessionId) => {
    if (!newSessionName.trim()) {
      showSnackbar(t("please_enter_valid_session_name"), "error");
      return;
    }
    updateLocalSession(sessionId, newSessionName.trim());
    handleDialogClose();
  };

  /**
   * Called when user presses "Confirm" on the rename/delete dialog
   */
  const handleConfirmAction = () => {
    const { type, sessionId } = dialogState; // get the ID from dialogState
    if (!sessionId) {
      console.error("Session not found: no sessionId in dialogState");
      return;
    }

    // Combine both sets of sessions into one array
    const combinedSessions = [...localSessions, ...flashcardSessions];
    // Find the matching session object
    const targetSession = combinedSessions.find((s) => s.id === sessionId);

    if (!targetSession) {
      console.error("Session not found:", sessionId);
      return;
    }
   
    // Check the session type
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
   * The main drawer content, including the list of DB and local sessions
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
            <ListItem key="StudyBuddy">
              <ListItemIcon>
                <Avatar src="/assets/icon.png" alt="Study Buddy Icon" />
              </ListItemIcon>
              <Box
                component="img"
                src="/assets/Logo.png"
                alt="Study Buddy Logo"
                sx={{ maxHeight: 30, marginLeft: 1 }}
              />
            </ListItem>

            {/* Create Session Button */}
            <ListItem disablePadding key="create-session">
              <ListItemButton
                component={Link}
                to="/"
                selected={isCreateSessionActive}
                sx={(theme) => commonButtonStyles(theme, isCreateSessionActive)}
                onClick={isMobile ? handleDrawerToggle : undefined}
              >
                <ListItemText
                  primary={t("create_study_session")}
                  primaryTypographyProps={{ variant: "subtitle2" }}
                />
                <AddRoundedIcon sx={{ color: theme.palette.text.secondary }} />
              </ListItemButton>
            </ListItem>

            {/* DB-based sessions */}
            {flashcardSessions.length > 0 && (
              <>
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
              </>
            )}

            {/* Local ephemeral sessions */}
            {localSessions.length > 0 && (
              <>
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
          </>
        )}
      </List>

      {/* The three-dot menu for each session */}
      <DropdownMenu
        anchorEl={menuAnchorEl}
        isOpen={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onDeleteClick={() => handleDialogOpen("delete")}
        onRenameClick={() => handleDialogOpen("rename")}
        t={t}
      />

      {/* Dialog for confirming delete or rename */}
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

      {/* Permanent drawer for desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            height: `calc(100% - ${menubarHeight}px)`,
            boxSizing: "border-box",
            overflow: "hidden",
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
