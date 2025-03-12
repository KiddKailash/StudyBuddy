import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import { useParams, useLocation } from "react-router-dom";

import SessionItem from "./SessionItem";
import DropdownMenu from "./DropdownMenu";
import ConfirmationDialog from "./ConfirmationDialog";
import CreateStudyResource from "../../webpages/CreateStudyResource"; // <-- import the component
import useSidebar from "./sidebarUtils";
import { UserContext } from "../../contexts/UserContext";

// MUI
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
// Dialog Components
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

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

  // State for controlling the CreateStudyResource modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const folderValue = folderID === "null" ? null : folderID;

  const filteredFlashcards = flashcardSessions.filter(
    (s) => s.folderID === folderValue
  );
  const filteredMcqs = multipleChoiceQuizzes.filter(
    (q) => q.folderID === folderValue
  );
  const filteredSummaries = summaries.filter(
    (s) => s.folderID === folderValue
  );
  const filteredAiChats = aiChats.filter(
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
        <Stack direction="column" spacing={0.4}>
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
            onClick={() => setIsCreateModalOpen(true)}
            handleMenuOpen={null}
            isExpanded={isExpanded}
          />

          <Divider
            sx={{
              border: 1,
              borderColor: "background.paper",
              width: "100%",
            }}
          />

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

      {/* CreateStudyResource Modal */}
      <Dialog
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        fullWidth
        maxWidth="md"
        sx={{ p: 0 }}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            p: 2,
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Render your form or any logic here */}
          <CreateStudyResource onClose={() => setIsCreateModalOpen(false)} />
        </DialogContent>
      </Dialog>

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
