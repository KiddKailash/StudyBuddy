import React from "react";
import { Link } from "react-router-dom";

// MUI
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
import Divider from "@mui/material/Divider";

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
              to="/create-resource"
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

          {/* FLASHCARDS SECTION */}
          <ListItem>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {t("flashcards")}
            </Typography>
            <Divider />
          </ListItem>
          <Box sx={{ mb: 2 }}>
            {flashcardSessions.map((session) => {
              const isActive = location.pathname === `/flashcards/${session.id}`;
              return (
                <SessionItem
                  key={session.id}
                  session={session}
                  resourceType="flashcard"
                  isActive={isActive}
                  handleMenuOpen={handleMenuOpen}
                  routePath={`/flashcards/${session.id}`}
                />
              );
            })}
            {localSessions.map((session) => {
              const isActive =
                location.pathname === `/flashcards-local/${session.id}`;
              return (
                <SessionItem
                  key={session.id}
                  session={session}
                  resourceType="flashcard"
                  isActive={isActive}
                  handleMenuOpen={handleMenuOpen}
                  routePath={`/flashcards-local/${session.id}`}
                />
              );
            })}
          </Box>

          {/* MULTIPLE CHOICE QUIZZES SECTION */}
          <ListItem>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {t("multiple_choice_quizzes")}
            </Typography>
          </ListItem>
          <Box sx={{ mb: 2 }}>
            {multipleChoiceQuizzes.map((quiz) => {
              const isActive = location.pathname === `/mcq/${quiz.id}`;
              return (
                <SessionItem
                  key={quiz.id}
                  session={quiz}
                  resourceType="quiz"
                  isActive={isActive}
                  handleMenuOpen={handleMenuOpen}
                  routePath={`/mcq/${quiz.id}`}
                />
              );
            })}
          </Box>

          {/* SUMMARIES SECTION */}
          <ListItem>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {t("summaries")}
            </Typography>
          </ListItem>
          <Box sx={{ mb: 2 }}>
            {summaries.map((summary) => {
              const isActive = location.pathname === `/summary/${summary.id}`;
              return (
                <SessionItem
                  key={summary.id}
                  session={summary}
                  resourceType="summary"
                  isActive={isActive}
                  handleMenuOpen={handleMenuOpen}
                  routePath={`/summary/${summary.id}`}
                />
              );
            })}
          </Box>

          {/* AI CHATS SECTION */}
          <ListItem>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {t("ai_chats")}
            </Typography>
          </ListItem>
          <Box sx={{ mb: 6 }}>
            {aiChats.map((chat) => {
              const isActive = location.pathname === `/chat/${chat.id}`;
              return (
                <SessionItem
                  key={chat.id}
                  session={chat}
                  resourceType="chat"
                  isActive={isActive}
                  handleMenuOpen={handleMenuOpen}
                  routePath={`/chat/${chat.id}`}
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
};

export default SidebarContent;
