import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { useTranslation } from "react-i18next";

/**
 * SessionItem represents one sidebar session.
 * Props:
 *  - session: { id, studySession, ... }
 *  - isActive: boolean
 *  - resourceType: string ("flashcard", "quiz", "summary", or "chat")
 *  - handleMenuOpen: function(event, sessionId, resourceType)
 *  - routePath: the link URL
 */
const SessionItem = ({ session, isActive, resourceType, handleMenuOpen, routePath }) => {
  const { t } = useTranslation();

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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
        <ListItemText
          primary={session.studySession}
          primaryTypographyProps={{ variant: "subtitle2" }}
        />

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
};

export default SessionItem;
