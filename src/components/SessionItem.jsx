import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

// MUI Component Imports
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

/**
 * SessionItem component represents an individual study session in the sidebar.
 *
 * @param {object} props - Component props.
 * @param {object} props.session - The study session data.
 * @param {boolean} props.isActive - Indicates if the session is currently active.
 * @param {function} props.handleMenuOpen - Function to open the options menu.
 * @param {function} props.commonButtonStyles - Function providing common styles.
 * @returns {JSX.Element} The SessionItem component.
 */
const SessionItem = ({
  session,
  isActive,
  handleMenuOpen,
  commonButtonStyles,
}) => (
  <ListItem disablePadding>
    <ListItemButton
      component={Link}
      to={`/flashcards/${session.id}`}
      selected={isActive}
      sx={(theme) => ({
        ...commonButtonStyles(theme, isActive),
        // Show IconButton on hover
        "&:hover .session-options-button": {
          display: "flex",
        },
      })}
    >
      <ListItemText
        primary={session.studySession}
        primaryTypographyProps={{
          variant: "subtitle2",
        }}
        sx={{paddingTop: .6, paddingBottom: .6}}
      />
      <IconButton
        edge="end"
        aria-label="options"
        onClick={(e) => handleMenuOpen(e, session.id)}
        sx={{
          color: "text.secondary",
          display: isActive ? "flex" : "none", // Show if active
        }}
        className="session-options-button"
      >
        <MoreVertRoundedIcon />
      </IconButton>
    </ListItemButton>
  </ListItem>
);

SessionItem.propTypes = {
  session: PropTypes.shape({
    id: PropTypes.string.isRequired,
    studySession: PropTypes.string.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  handleMenuOpen: PropTypes.func.isRequired,
  commonButtonStyles: PropTypes.func.isRequired,
};

export default SessionItem;
