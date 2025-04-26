import React, { useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// Contexts
import { UserContext } from "../../contexts/UserContext";

// MUI
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";

// Local Components
import SessionItem from "./SessionItem";

/**
 * SidebarContent component that displays the folder's study resources
 */
const SidebarContent = ({ isExpanded, mobileMode }) => {
  const navigate = useNavigate();
  const { folderID } = useParams();
  const location = useLocation();
  
  const activePath = location.pathname;
  
  const {
    flashcardSessions = [],
    multipleChoiceQuizzes = [],
    summaries = [],
    aiChats = [],
  } = useContext(UserContext);
  
  // Filter only resources for the current folder
  const filteredFlashcards = flashcardSessions.filter(
    (s) => s.folderID === folderID
  );
  const filteredMcqs = multipleChoiceQuizzes.filter(
    (q) => q.folderID === folderID
  );
  const filteredSummaries = summaries.filter(
    (summary) => summary.folderID === folderID
  );
  const filteredAiChats = aiChats.filter((chat) => chat.folderID === folderID);
  
  // Guard: show loader if resources aren't loaded yet
  if (!flashcardSessions || !multipleChoiceQuizzes || !summaries || !aiChats) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <CircularProgress size={24} />
      </Box>
    );
  }
  
  // Handle navigation with mobile mode awareness
  const handleNavigate = (path) => {
    navigate(path);
    // If in mobile mode, close drawer by clicking outside
    if (mobileMode) {
      document.body.click();
    }
  };

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <List component="nav">
        <Stack direction="column" spacing={0.4}>
          {/* Study Resources */}
          {isExpanded && (
            <Typography
              variant="overline"
              sx={{ fontWeight: 500, color: "text.secondary", mb: 1 }}
            >
              Study Resources
            </Typography>
          )}

          {/* No resources message */}
          {(filteredFlashcards.length === 0 &&
            filteredMcqs.length === 0 &&
            filteredSummaries.length === 0 &&
            filteredAiChats.length === 0) && isExpanded && (
            <ListItem>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", fontStyle: "italic" }}
                  >
                    No study resources yet
                  </Typography>
                }
              />
            </ListItem>
          )}

          {/* Flashcards */}
          {filteredFlashcards.map((s) => (
            <SessionItem
              key={s.id}
              session={s}
              resourceType="flashcard"
              isActive={activePath === `/${folderID}/flashcards/${s.id}`}
              onClick={() => handleNavigate(`/${folderID}/flashcards/${s.id}`)}
              isExpanded={isExpanded}
            />
          ))}

          {/* Multiple choice quizzes */}
          {filteredMcqs.map((q) => (
            <SessionItem
              key={q.id}
              session={q}
              resourceType="quiz"
              isActive={activePath === `/${folderID}/mcq/${q.id}`}
              onClick={() => handleNavigate(`/${folderID}/mcq/${q.id}`)}
              isExpanded={isExpanded}
            />
          ))}

          {/* Summaries */}
          {filteredSummaries.map((summary) => (
            <SessionItem
              key={summary.id}
              session={summary}
              resourceType="summary"
              isActive={activePath === `/${folderID}/summary/${summary.id}`}
              onClick={() => handleNavigate(`/${folderID}/summary/${summary.id}`)}
              isExpanded={isExpanded}
            />
          ))}

          {/* AI Chats */}
          {filteredAiChats.map((chat) => (
            <SessionItem
              key={chat.id}
              session={chat}
              resourceType="chat"
              isActive={activePath === `/${folderID}/chat/${chat.id}`}
              onClick={() => handleNavigate(`/${folderID}/chat/${chat.id}`)}
              isExpanded={isExpanded}
            />
          ))}
        </Stack>
      </List>
    </Box>
  );
};

SidebarContent.propTypes = {
  isExpanded: PropTypes.bool,
  mobileMode: PropTypes.bool
};

SidebarContent.defaultProps = {
  isExpanded: true,
  mobileMode: false
};

export default SidebarContent;
