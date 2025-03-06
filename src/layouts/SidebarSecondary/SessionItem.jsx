import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

import {
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

// Icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ViewCarouselRoundedIcon from "@mui/icons-material/ViewCarouselRounded"; // flashcards
import QuizIcon from "@mui/icons-material/Quiz"; // quizzes
import ArticleIcon from "@mui/icons-material/Article"; // summaries
import ChatIcon from "@mui/icons-material/Chat"; // AI chats
import Avatar from "@mui/material/Avatar";

/**
 * Returns an icon component (or avatar) based on the resourceType.
 * We unify brand, create, flashcard, quiz, summary, chat, etc.
 */
function getResourceIcon(resourceType, session) {
  switch (resourceType) {
    case "brand":
      // Return an Avatar as the "icon"
      return (
        <Avatar
          src="/assets/flashcards.png"
          alt="Study Buddy Icon"
          size="inherit"
        />
      );
    case "create":
      return <AddRoundedIcon />;
    case "flashcard":
      return <ViewCarouselRoundedIcon />;
    case "quiz":
      return <QuizIcon />;
    case "summary":
      return <ArticleIcon />;
    case "chat":
      return <ChatIcon />;
    default:
      return <ViewCarouselRoundedIcon />;
  }
}

/**
 * SessionItem represents one sidebar row. All items in the sidebar use this pattern.
 * If expanded => show (icon + text)
 * If collapsed => show (icon w/ tooltip)
 */
const SessionItem = ({
  session,
  isActive,
  resourceType,
  handleMenuOpen,
  routePath,
  isExpanded,
}) => {
  // This is the text that displays in expanded mode, or in the tooltip
  const textLabel = session?.studySession || "Untitled";

  // Get the correct icon (or avatar)
  const iconElement = getResourceIcon(resourceType, session);

  // If there's no route, we can skip making this clickable
  const clickableProps = routePath
    ? {
        component: Link,
        to: routePath,
        selected: isActive,
      }
    : {};

  return (
    <ListItem disablePadding>
      <ListItemButton
        {...clickableProps}
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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          // Only show "more" icon if hovered or active
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
        {/* Left side: icon + text if expanded, else just icon with tooltip */}
        {isExpanded ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {iconElement}
            <ListItemText
              primary={textLabel}
              primaryTypographyProps={{ variant: "subtitle2" }}
            />
          </Box>
        ) : (
          <Tooltip title={textLabel} placement="right">
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {iconElement}
            </Box>
          </Tooltip>
        )}

        {/* More options icon, only if there's a handleMenuOpen function */}
        {handleMenuOpen && (
          <IconButton
            edge="end"
            aria-label="Options"
            onClick={(e) => {
              e.preventDefault();
              handleMenuOpen(e, session.id, resourceType);
            }}
            className="session-options-button"
            sx={{ color: "text.secondary" }}
          >
            <MoreVertRoundedIcon />
          </IconButton>
        )}
      </ListItemButton>
    </ListItem>
  );
};

SessionItem.propTypes = {
  session: PropTypes.shape({
    id: PropTypes.string.isRequired,
    studySession: PropTypes.string,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  resourceType: PropTypes.string.isRequired,
  handleMenuOpen: PropTypes.func,
  routePath: PropTypes.string,
  /**
   * If expanded => show icon + text
   * If collapsed => show icon only (tooltip)
   */
  isExpanded: PropTypes.bool.isRequired,
};

export default SessionItem;
