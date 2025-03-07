import React, { useContext } from "react";
import PropTypes from "prop-types";
import { useParams, useLocation } from "react-router-dom";

// MUI
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

// Local Imports
import SessionItem from "./SessionItem";
import DropdownMenu from "./DropdownMenu";
import ConfirmationDialog from "./ConfirmationDialog";
import useSidebar from "./sidebarUtils";
import { UserContext } from "../../contexts/UserContext";

const SidebarContent = ({ isExpanded }) => {
  const { folderID } = useParams();
  const location = useLocation();

  // Sidebar utilities
  const { t, handleMenuOpen, ...etc } = useSidebar();

  // Retrieve arrays safely from context
  const {
    folders = [],
    flashcardSessions = [],
    multipleChoiceQuizzes = [],
    summaries = [],
    aiChats = [],
  } = useContext(UserContext);

  // Determine folder value for filtering
  const folderValue = folderID === "null" ? null : folderID;

  // Fallback arrays
  const flashcardsArr = flashcardSessions || [];
  const mcqArr = multipleChoiceQuizzes || [];
  const summariesArr = summaries || [];
  const aiChatsArr = aiChats || [];

  // Filter study resource arrays based on folder
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

  // Guard: show loader if resources aren’t loaded yet
  if (!flashcardSessions || !multipleChoiceQuizzes || !summaries || !aiChats) {
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
        <Stack direction="column"  spacing={1}>
          {/* Manage Understanding */}
          <SessionItem
            session={{
              id: "understanding",
              studySession: "Manage Understanding",
            }}
            resourceType="understanding"
            isActive={false}
            handleMenuOpen={null}
            isExpanded={isExpanded}
          />

          {/* New Study Resource Button */}
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

          <Divider  fullwidth sx={{ color: "background.paper" }} />

          {/* Study Resources */}
          {filteredFlashcards.map((s) => (
            <SessionItem
              key={s.id}
              session={s}
              resourceType="flashcard"
              isActive={location.pathname === `/${folderID}/flashcards/${s.id}`}
              routePath={`/${folderID}/flashcards/${s.id}`}
              handleMenuOpen={handleMenuOpen}
              isExpanded={isExpanded}
            />
          ))}

          {filteredMcqs.map((q) => (
            <SessionItem
              key={q.id}
              session={q}
              resourceType="quiz"
              isActive={location.pathname === `/${folderID}/mcq/${q.id}`}
              routePath={`/${folderID}/mcq/${q.id}`}
              handleMenuOpen={handleMenuOpen}
              isExpanded={isExpanded}
            />
          ))}

          {filteredSummaries.map((summary) => (
            <SessionItem
              key={summary.id}
              session={summary}
              resourceType="summary"
              isActive={
                location.pathname === `/${folderID}/summary/${summary.id}`
              }
              routePath={`/${folderID}/summary/${summary.id}`}
              handleMenuOpen={handleMenuOpen}
              isExpanded={isExpanded}
            />
          ))}

          {filteredAiChats.map((chat) => (
            <SessionItem
              key={chat.id}
              session={chat}
              resourceType="chat"
              isActive={location.pathname === `/${folderID}/chat/${chat.id}`}
              routePath={`/${folderID}/chat/${chat.id}`}
              handleMenuOpen={handleMenuOpen}
              isExpanded={isExpanded}
            />
          ))}
        </Stack>
      </List>

      {/* Dropdown Menu & Confirmation Dialog */}
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
