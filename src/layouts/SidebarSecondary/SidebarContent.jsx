import React, { useContext } from "react";
import PropTypes from "prop-types";
import { useParams, useLocation } from "react-router-dom";

// MUI
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

// Local Imports
import SessionItem from "./SessionItem";
import DropdownMenu from "./DropdownMenu";
import ConfirmationDialog from "./ConfirmationDialog";
import useSidebar from "./sidebarUtils";
import { UserContext } from "../../contexts/UserContext";

const SidebarContent = ({ isExpanded }) => {
  // 1) Get folderID from URL
  const { folderID } = useParams();
  const location = useLocation();

  // 2) Get sidebar utilities
  const { theme, t, handleMenuOpen, ...etc } = useSidebar();

  // 3) Get resource arrays safely from context
  const {
    folders = [],
    flashcardSessions = [],
    multipleChoiceQuizzes = [],
    summaries = [],
    aiChats = [],
  } = useContext(UserContext);

  // 4) Determine folder value for filtering (convert "null" to actual null)
  const folderValue = folderID === "null" ? null : folderID;

  // 5) Use fallback arrays for filtering
  const foldersArr = folders || [];
  const flashcardsArr = flashcardSessions || [];
  const mcqArr = multipleChoiceQuizzes || [];
  const summariesArr = summaries || [];
  const aiChatsArr = aiChats || [];

  const filteredFlashcards = flashcardsArr.filter(
    (s) => s.folderID === folderValue
  );
  const filteredMcqs = mcqArr.filter((q) => q.folderID === folderValue);
  const filteredSummaries = summariesArr.filter(
    (s) => s.folderID === folderValue
  );
  const filteredAiChats = aiChatsArr.filter(
    (chat) => chat.folderID === folderValue
  );

  // 6) Get the current folder object (if it exists)
  const folder = foldersArr.find((f) => f.id === folderID);

  // 7) Helper: check if a route is active
  const isActiveRoute = (path) => location.pathname === path;

  // Optional: You can add a guard if any of these arrays are not loaded
  if (!folders || !flashcardSessions || !multipleChoiceQuizzes || !summaries || !aiChats) {
    return (
      <List component="nav">
        <ListItem sx={{ justifyContent: "center" }}>
          <CircularProgress color="inherit" />
        </ListItem>
      </List>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <List component="nav">
        <Stack direction="column" spacing={1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {folder ? folder.folderName : "Unfoldered"}
          </Typography>

          {/* Brand item */}
          <SessionItem
            session={{
              id: "brand",
              studySession: "StudyBuddy.ai",
            }}
            resourceType="brand"
            isActive={false}
            routePath=""
            handleMenuOpen={null}
            isExpanded={isExpanded}
          />

          {/* Create Session item */}
          <SessionItem
            session={{
              id: "create-session",
              studySession: t("create_study_session"),
            }}
            resourceType="create"
            isActive={false}
            routePath={`/${folderID}/create`}
            handleMenuOpen={null}
            isExpanded={isExpanded}
          />

          {/* Flashcard sessions */}
          {filteredFlashcards.map((s) => (
            <SessionItem
              key={s.id}
              session={s}
              resourceType="flashcard"
              isActive={isActiveRoute(`/${folderID}/flashcards/${s.id}`)}
              routePath={`/${folderID}/flashcards/${s.id}`}
              handleMenuOpen={handleMenuOpen}
              isExpanded={isExpanded}
            />
          ))}

          {/* Multiple Choice Quizzes */}
          {filteredMcqs.map((q) => (
            <SessionItem
              key={q.id}
              session={q}
              resourceType="quiz"
              isActive={isActiveRoute(`/${folderID}/mcq/${q.id}`)}
              routePath={`/${folderID}/mcq/${q.id}`}
              handleMenuOpen={handleMenuOpen}
              isExpanded={isExpanded}
            />
          ))}

          {/* Summaries */}
          {filteredSummaries.map((summary) => (
            <SessionItem
              key={summary.id}
              session={summary}
              resourceType="summary"
              isActive={isActiveRoute(`/${folderID}/summary/${summary.id}`)}
              routePath={`/${folderID}/summary/${summary.id}`}
              handleMenuOpen={handleMenuOpen}
              isExpanded={isExpanded}
            />
          ))}

          {/* AI Chats */}
          {filteredAiChats.map((chat) => (
            <SessionItem
              key={chat.id}
              session={chat}
              resourceType="chat"
              isActive={isActiveRoute(`/${folderID}/chat/${chat.id}`)}
              routePath={`/${folderID}/chat/${chat.id}`}
              handleMenuOpen={handleMenuOpen}
              isExpanded={isExpanded}
            />
          ))}
        </Stack>
      </List>

      {/* Dropdown menu & Confirmation Dialog */}
      <DropdownMenu
        anchorEl={etc.menuAnchorEl}
        isOpen={Boolean(etc.menuAnchorEl)}
        onClose={etc.handleMenuClose}
        onDeleteClick={() => etc.handleDialogOpen("delete")}
        onRenameClick={() => etc.handleDialogOpen("rename")}
        t={t}
      />

      <ConfirmationDialog
        open={etc.dialogState.open}
        type={etc.dialogState.type}
        onClose={etc.handleDialogClose}
        onConfirm={etc.handleConfirmAction}
        newSessionName={etc.newSessionName}
        setNewSessionName={etc.setNewSessionName}
        t={t}
      />
    </Box>
  );
};

SidebarContent.propTypes = {
  isExpanded: PropTypes.bool.isRequired,
};

export default SidebarContent;
