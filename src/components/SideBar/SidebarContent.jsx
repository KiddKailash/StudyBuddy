import React from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import CircularProgress from "@mui/material/CircularProgress";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";

import useMediaQuery from "@mui/material/useMediaQuery";

import SessionItem from "./SessionItem";
import DropdownMenu from "./DropdownMenu";
import ConfirmationDialog from "./ConfirmationDialog";

import useSidebar from "./sidebarUtils";
import { commonButtonStyles } from "./commonButtonStyles";

const SidebarContent = () => {
  const {
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
  } = useSidebar();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const drawerContent = (
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
            >
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {t("create_study_session")}
              </Typography>
              <AddRoundedIcon sx={{ color: theme.palette.text.secondary }} />
            </ListItemButton>
          </ListItem>

          {/* DB-based sessions */}
          {flashcardSessions.map((session) => {
            const isActive = location.pathname === `/flashcards/${session.id}`;
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
  );

  return (
    <Box sx={{ width: "100%" }}>
      {drawerContent}

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
};

export default SidebarContent;
