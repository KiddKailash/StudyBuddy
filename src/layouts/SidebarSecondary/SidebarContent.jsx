import React from "react";
import PropTypes from "prop-types";

// MUI
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

// Local Imports
import useSidebar from "./sidebarUtils";
import SessionItem from "./SessionItem";
import DropdownMenu from "./DropdownMenu";
import ConfirmationDialog from "./ConfirmationDialog";

/**
 * Renders sidebar content:
 *  - Brand row ("StudyBuddy.ai") using SessionItem with resourceType="brand"
 *  - "Create Session" using SessionItem with resourceType="create"
 *  - Mapped session items for flashcards/quizzes/summaries/chats
 *  - Everything uses the same SessionItem pattern
 */
const SidebarContent = ({ isExpanded }) => {
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

  /**
   * Just a helper to see if a given route is active
   */
  const isActiveRoute = (path) => location.pathname === path;

  return (
    <Box sx={{ width: "100%" }}>
      <List component="nav">
        {/* Show spinner if loading */}
        {loadingSessions ? (
          <ListItem sx={{ justifyContent: "center" }}>
            <CircularProgress color="inherit" />
          </ListItem>
        ) : (
          <Stack direction="column" spacing={1}>
            {/* 1) BRAND (StudyBuddy.ai) */}
            <SessionItem
              session={{
                // 'studySession' used as the display text in SessionItem
                id: "brand",
                studySession: "StudyBuddy.ai",
              }}
              resourceType="brand"
              isActive={false}
              routePath="" // no route for brand
              handleMenuOpen={null}
              isExpanded={isExpanded}
            />

            {/* 2) CREATE SESSION */}
            <SessionItem
              session={{
                id: "create-session",
                studySession: t("create_study_session"),
              }}
              resourceType="create"
              isActive={isCreateSessionActive}
              routePath="/create-resource"
              handleMenuOpen={null}
              isExpanded={isExpanded}
            />

            {/* 3) FLASHCARD SESSIONS */}
            {flashcardSessions.map((s) => (
              <SessionItem
                key={s.id}
                session={s}
                resourceType="flashcard"
                isActive={isActiveRoute(`/flashcards/${s.id}`)}
                routePath={`/flashcards/${s.id}`}
                handleMenuOpen={handleMenuOpen}
                isExpanded={isExpanded}
              />
            ))}
            {localSessions.map((s) => (
              <SessionItem
                key={s.id}
                session={s}
                resourceType="flashcard"
                isActive={isActiveRoute(`/flashcards-local/${s.id}`)}
                routePath={`/flashcards-local/${s.id}`}
                handleMenuOpen={handleMenuOpen}
                isExpanded={isExpanded}
              />
            ))}

            {/* 4) MULTIPLE CHOICE QUIZZES */}
            {multipleChoiceQuizzes.map((q) => (
              <SessionItem
                key={q.id}
                session={q}
                resourceType="quiz"
                isActive={isActiveRoute(`/mcq/${q.id}`)}
                routePath={`/mcq/${q.id}`}
                handleMenuOpen={handleMenuOpen}
                isExpanded={isExpanded}
              />
            ))}

            {/* 5) SUMMARIES */}
            {summaries.map((summary) => (
              <SessionItem
                key={summary.id}
                session={summary}
                resourceType="summary"
                isActive={isActiveRoute(`/summary/${summary.id}`)}
                routePath={`/summary/${summary.id}`}
                handleMenuOpen={handleMenuOpen}
                isExpanded={isExpanded}
              />
            ))}

            {/* 6) AI CHATS */}
            {aiChats.map((chat) => (
              <SessionItem
                key={chat.id}
                session={chat}
                resourceType="chat"
                isActive={isActiveRoute(`/chat/${chat.id}`)}
                routePath={`/chat/${chat.id}`}
                handleMenuOpen={handleMenuOpen}
                isExpanded={isExpanded}
              />
            ))}
          </Stack>
        )}
      </List>

      {/* Additional features: dropdown & dialogs */}
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

SidebarContent.propTypes = {
  isExpanded: PropTypes.bool.isRequired,
};

export default SidebarContent;
