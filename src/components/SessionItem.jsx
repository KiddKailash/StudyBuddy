import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

const SessionItem = ({
  session,
  isActive,
  handleMenuOpen,
  handleDelete,
  handleRename,
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
  handleDelete: PropTypes.func.isRequired,
  handleRename: PropTypes.func.isRequired,
  commonButtonStyles: PropTypes.func.isRequired,
};

export default SessionItem;
