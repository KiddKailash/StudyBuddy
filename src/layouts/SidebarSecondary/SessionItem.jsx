import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

import { useTranslation } from "react-i18next";
import { Box, Tooltip } from "@mui/material";

// Example icons (use whichever you like)
import NoteIcon from "@mui/icons-material/Note";        // For flashcards
import QuizIcon from "@mui/icons-material/Quiz";        // For quizzes
import ArticleIcon from "@mui/icons-material/Article";  // For summaries
import ChatIcon from "@mui/icons-material/Chat";        // For AI chats

/**
 * Returns an icon component based on the resourceType.
 * You can customize or replace these as desired.
 */
function getResourceIcon(resourceType) {
  switch (resourceType) {
    case "flashcard":
      return NoteIcon;
    case "quiz":
      return QuizIcon;
    case "summary":
      return ArticleIcon;
    case "chat":
      return ChatIcon;
    default:
      return NoteIcon; // fallback icon
  }
}

/**
 * SessionItem represents one sidebar session row.
 * If expanded => show icon + session name
 * If collapsed => show icon only, with a tooltip for session name
 */
const SessionItem = ({
  session,
  isActive,
  resourceType,
  handleMenuOpen,
  routePath,
  isExpanded,
}) => {
  const { t } = useTranslation();

  // Pick an icon based on resource type
  const ResourceIcon = getResourceIcon(resourceType);

  return (
    <ListItem disablePadding>
      <ListItemButton
        component={Link}
        to={routePath}
        selected={isActive}
        sx={(theme) => ({
          mr: 1,
          ml: 1,
          borderRadius: 3,
          backgroundColor: isActive
            ? theme.palette.action.selected
            : "transparent",
          "&.Mui-selected": {
            backgroundColor: theme.palette.action.selected,
          },
          "&:hover": {
            backgroundColor: theme.palette.action.selected,
          },
          color: "text.primary",
          "& .MuiListItemText-root": { color: "text.primary" },

          // Lay out the item horizontally
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          // Show/hide the "More" icon on hover or if active
          "&:hover .session-options-button": {
            visibility: "visible",
            opacity: 1,
          },
          "& .session-options-button": {
            visibility: isActive ? "visible" : "hidden",
            opacity: isActive ? 1 : 0,
            transition: "opacity 0.2s, visibility 0.2s",
          },
        })}
      >
        {/* Left side: icon + text if expanded, else just icon w/ tooltip */}
        {isExpanded ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ResourceIcon />
            <ListItemText
              primary={session.studySession}
              primaryTypographyProps={{ variant: "subtitle2" }}
            />
          </Box>
        ) : (
          <Tooltip title={session.studySession} placement="right">
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ResourceIcon />
            </Box>
          </Tooltip>
        )}

        {/* Right side: More options icon */}
        <IconButton
          edge="end"
          aria-label={t("options")}
          onClick={(e) => {
            e.preventDefault();
            if (handleMenuOpen) {
              handleMenuOpen(e, session.id, resourceType);
            }
          }}
          className="session-options-button"
          sx={{ color: "text.secondary" }}
        >
          <MoreVertRoundedIcon />
        </IconButton>
      </ListItemButton>
    </ListItem>
  );
};

SessionItem.propTypes = {
  session: PropTypes.shape({
    id: PropTypes.string,
    studySession: PropTypes.string,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  resourceType: PropTypes.string.isRequired,
  handleMenuOpen: PropTypes.func,
  routePath: PropTypes.string.isRequired,

  /**
   * Whether the sidebar is expanded or collapsed.
   * Expanded => show icon + text
   * Collapsed => show icon only w/ tooltip
   */
  isExpanded: PropTypes.bool.isRequired,
};

export default SessionItem;
