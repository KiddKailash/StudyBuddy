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
import RequestFeature from "../RequestFeature/RequestFeature";

import useSidebar from "./sidebarUtils";

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
              sx={(themeParam) => ({
                mr: 1,
                ml: 1,
                borderRadius: 3,
                backgroundColor: isCreateSessionActive
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
              })}
            >
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {t("create_study_session")}
              </Typography>
              <AddRoundedIcon sx={{ color: theme.palette.text.secondary }} />
            </ListItemButton>
          </ListItem>
          <Box sx={{mb: 6}}>
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
                  routePath={`/flashcards-local/${session.id}`}
                />
              );
            })}
          </Box>
        </>
      )}
    </List>
  );

  return (
    <Box sx={{ width: "100%" }}>
      {drawerContent}

      <RequestFeature />

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
