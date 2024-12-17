import React, { useState, useContext, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import PropTypes from "prop-types";

import { UserContext } from "../../contexts/UserContext";
import { SnackbarContext } from "../../contexts/SnackbarContext";

import Box from "@mui/material/Box";
import Avatar from '@mui/material/Avatar';
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
    deleteFlashcardSession,
    updateFlashcardSessionName,
  } = useContext(UserContext);

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedSessionIsLocal, setSelectedSessionIsLocal] = useState(false);

  const [dialogState, setDialogState] = useState({ type: null, open: false });
  const [newSessionName, setNewSessionName] = useState("");

  useEffect(() => {
    if (flashcardError) {
      showSnackbar(
        t("error_loading_study_sessions", { error: flashcardError }),
        "error"
      );
    }
  }, [flashcardError, showSnackbar, t]);

  const isCreateSessionActive = location.pathname === "/";

  // Common MUI styles
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

  const handleMenuOpen = (event, sessionId, isLocal) => {
    event.stopPropagation();
    event.preventDefault();
    setMenuAnchorEl(event.currentTarget);
    setSelectedSessionId(sessionId);
    setSelectedSessionIsLocal(isLocal);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedSessionId(null);
    setSelectedSessionIsLocal(false);
  };

  const handleDialogOpen = (type) => {
    setDialogState({ type, open: true });
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogState({ type: null, open: false });
    setNewSessionName("");
  };

  /** DB-based logic */
  const handleDeleteDbSession = () => {
    deleteFlashcardSession(selectedSessionId);
    handleDialogClose();
  };
  const handleRenameDbSession = () => {
    if (!newSessionName.trim()) {
      showSnackbar(t("please_enter_valid_session_name"), "error");
      return;
    }
    updateFlashcardSessionName(selectedSessionId, newSessionName.trim());
    handleDialogClose();
  };

  /** Local ephemeral logic */
  const handleDeleteLocalSession = () => {
    deleteLocalSession(selectedSessionId);
    handleDialogClose();
  };
  const handleRenameLocalSession = () => {
    showSnackbar("Rename ephemeral not implemented", "info");
    handleDialogClose();
  };

  /** Called on confirm button press in the dialog */
  const handleConfirmAction = () => {
    if (dialogState.type === "delete") {
      if (selectedSessionIsLocal) {
        handleDeleteLocalSession();
      } else {
        handleDeleteDbSession();
      }
    } else if (dialogState.type === "rename") {
      if (selectedSessionIsLocal) {
        handleRenameLocalSession();
      } else {
        handleRenameDbSession();
      }
    }
  };

  const drawerContent = (
    <Box sx={{ width: drawerWidth }}>
      <Toolbar />
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
              <ListItemText
                primary={"Study Buddy"}
                primaryTypographyProps={{ variant: "body1" }}
              />
            </ListItem>
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
                <ListItem>
                  <ListItemText
                    primary={t("your_db_sessions")}
                    primaryTypographyProps={{
                      variant: "subtitle2",
                      sx: { fontWeight: "bold" },
                    }}
                  />
                </ListItem>
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
                      isLocal={false} // DB-based
                    />
                  );
                })}
              </>
            )}

            {/* Local ephemeral sessions */}
            {localSessions.length > 0 && (
              <>
                <ListItem>
                  <ListItemText
                    primary={t("local_sessions")}
                    primaryTypographyProps={{
                      variant: "subtitle2",
                      sx: { fontWeight: "bold" },
                    }}
                  />
                </ListItem>
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
                      isLocal={true} // ephemeral
                    />
                  );
                })}
              </>
            )}
          </>
        )}
      </List>

      <DropdownMenu
        anchorEl={menuAnchorEl}
        isOpen={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onDeleteClick={() => handleDialogOpen("delete")}
        onRenameClick={() => handleDialogOpen("rename")}
        t={t}
      />

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
