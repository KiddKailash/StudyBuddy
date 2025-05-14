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
 * SessionItem - represents one sidebar session (DB or ephemeral).
 *
 * @param {object} props
 * @param {object} props.session - { id, studySession, ... }
 * @param {boolean} props.isActive
 * @param {function} props.handleMenuOpen - handleMenuOpen(event, sessionId)
 * @param {string} props.routePath - the link URL ("/flashcards/..." or "/flashcards-local/...")
 */
const SessionItem = ({ session, isActive, handleMenuOpen, routePath }) => {
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

          // Additional hover styles for the three-dot icon
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
            e.preventDefault(); // prevent navigation
            handleMenuOpen(e, session.id);
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
    id: PropTypes.string.isRequired,
    studySession: PropTypes.string.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  handleMenuOpen: PropTypes.func.isRequired,
  routePath: PropTypes.string.isRequired,
};

export default SessionItem;
