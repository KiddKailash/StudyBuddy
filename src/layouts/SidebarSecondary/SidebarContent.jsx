import React, { useContext, useState, useEffect } from "react";
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
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

const SidebarContent = ({ isExpanded }) => {
  const { folderID } = useParams();
  const location = useLocation();

  // Sidebar utilities
  const { t, handleMenuOpen, ...etc } = useSidebar();

  // Retrieve arrays safely from context
  const {
    flashcardSessions = [],
    multipleChoiceQuizzes = [],
    summaries = [],
    aiChats = [],
  } = useContext(UserContext);

  // State for controlling the CreateStudyResource modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Local states to store the filtered resources
  const [filteredFlashcards, setFilteredFlashcards] = useState([]);
  const [filteredMcqs, setFilteredMcqs] = useState([]);
  const [filteredSummaries, setFilteredSummaries] = useState([]);
  const [filteredAiChats, setFilteredAiChats] = useState([]);

  // Track the active path in state instead of using location.pathname directly
  const [activePath, setActivePath] = useState(location.pathname);

  // Wrap the filtering logic AND the location update in a useEffect
  useEffect(() => {
    // 2) Convert "null" folderID to actual null
    const folderValue = folderID === "null" ? null : folderID;

    // 3) Filter the resources
    setFilteredFlashcards(
      flashcardSessions.filter(
        (s) => String(s.folderID) === String(folderValue)
      )
    );
    setFilteredMcqs(
      multipleChoiceQuizzes.filter(
        (q) => String(q.folderID) === String(folderValue)
      )
    );
    setFilteredSummaries(
      summaries.filter((s) => String(s.folderID) === String(folderValue))
    );
    setFilteredAiChats(
      aiChats.filter((chat) => String(chat.folderID) === String(folderValue))
    );

    // 4) Update the active path
    setActivePath(location.pathname);
  }, [
    folderID,
    location.pathname,
    flashcardSessions,
    multipleChoiceQuizzes,
    summaries,
    aiChats,
  ]);

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
              isActive={activePath === `/${folderID}/flashcards/${s.id}`}
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
              isActive={activePath === `/${folderID}/mcq/${q.id}`}
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
              isActive={activePath === `/${folderID}/summary/${summary.id}`}
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
              isActive={activePath === `/${folderID}/chat/${chat.id}`}
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
