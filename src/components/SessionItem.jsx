import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// MUI Component Imports
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

const SessionItem = ({
  session,
  isActive,
  handleMenuOpen,
  commonButtonStyles,
}) => {
  return (
    <ListItem disablePadding>
      <ListItemButton
        component={Link}
        to={`/flashcards/${session.id}`}
        selected={isActive}
        sx={(theme) => commonButtonStyles(theme, isActive)}
      >
        <ListItemText
          primary={session.studySession}
          primaryTypographyProps={{
            variant: "subtitle2",
          }}
        />
        <IconButton
          edge="end"
          aria-label="options"
          onClick={(e) => handleMenuOpen(e, session.id)}
          sx={{
            color: "text.secondary",
          }}
        >
          <MoreVertRoundedIcon />
        </IconButton>
      </ListItemButton>
    </ListItem>
  );
};

SessionItem.propTypes = {
  session: PropTypes.object.isRequired,
  isActive: PropTypes.bool.isRequired,
  handleMenuOpen: PropTypes.func.isRequired,
  commonButtonStyles: PropTypes.func.isRequired,
};

export default SessionItem;
