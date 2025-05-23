import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

// MUI
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ViewCarouselRoundedIcon from "@mui/icons-material/ViewCarouselRounded";
import ChatIcon from "@mui/icons-material/Chat";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";

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
      return <AddRoundedIcon color="action" />;
    case "flashcard":
      return <ViewCarouselRoundedIcon color="action" />;
    case "quiz":
      return <CheckBoxRoundedIcon color="action" />;
    case "summary":
      return <AutoStoriesRoundedIcon color="action" />;
    case "chat":
      return <ChatIcon color="action" />;
    case "understanding":
      return <SchoolRoundedIcon color="action" />;
    default:
      return <ViewCarouselRoundedIcon color="action" />;
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
  onClick, // <-- Make sure we destructure onClick
}) => {
  // This is the text that displays in expanded mode, or in the tooltip
  const textLabel = session?.studySession || "Untitled";

  // Get the correct icon (or avatar)
  const iconElement = getResourceIcon(resourceType, session);

  // Build props for the clickable element
  // 1) If there's a routePath, we treat this as a Link.
  // 2) Else if there's an onClick, we attach it.
  const clickableProps = {};
  if (routePath) {
    clickableProps.component = Link;
    clickableProps.to = routePath;
    clickableProps.selected = isActive;
  } else if (onClick) {
    clickableProps.onClick = onClick;
  }

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
  onClick: PropTypes.func, // <-- Add this prop type
};

export default SessionItem;
