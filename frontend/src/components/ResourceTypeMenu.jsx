import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

// MUI
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

// MUI Icons
import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";
import ViewCarouselRoundedIcon from "@mui/icons-material/ViewCarouselRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";

const ResourceTypeMenu = ({ anchorEl, open, onClose, onSelect, folderID = "null" }) => {
  const navigate = useNavigate();

  const handleSelect = (resourceType) => {
    if (resourceType === "flashcards") {
      onSelect("flashcards");
    } else if (resourceType === "mcq") {
      onSelect("mcq");
    } else if (resourceType === "summary") {
      onSelect("summary");
    }
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      PaperProps={{
        elevation: 2,
        sx: {
          borderRadius: 2,
          width: 200,
        },
      }}
    >
      <MenuItem onClick={() => handleSelect("mcq")}>
        <ListItemIcon>
          <CheckBoxRoundedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Practice Quiz</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => handleSelect("flashcards")}>
        <ListItemIcon>
          <ViewCarouselRoundedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Flashcards</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => handleSelect("summary")}>
        <ListItemIcon>
          <AutoStoriesRoundedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Summary</ListItemText>
      </MenuItem>
    </Menu>
  );
};

ResourceTypeMenu.propTypes = {
  anchorEl: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  folderID: PropTypes.string,
};

export default ResourceTypeMenu; 