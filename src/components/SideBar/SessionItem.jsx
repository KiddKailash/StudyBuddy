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
 * @param {function} props.handleMenuOpen - handleMenuOpen(event, sessionId, isLocal)
 * @param {function} props.commonButtonStyles
 * @param {boolean} [props.isLocal=true] - true if ephemeral, false if DB-based
 */
const SessionItem = ({
  session,
  isActive,
  handleMenuOpen,
  commonButtonStyles,
  isLocal = true,
}) => {
  const { t } = useTranslation();

  const routePath = isLocal
    ? `/flashcards-local/${session.id}`
    : `/flashcards/${session.id}`;

  return (
    <ListItem disablePadding>
      <ListItemButton
        component={Link}
        to={routePath}
        selected={isActive}
        sx={(theme) => ({
          ...commonButtonStyles(theme, isActive),
          "&:hover .session-options-button": { visibility: "visible", opacity: 1 },
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
            e.preventDefault(); // block link
            handleMenuOpen(e, session.id, isLocal);
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
  commonButtonStyles: PropTypes.func.isRequired,
  isLocal: PropTypes.bool,
};

export default SessionItem;
