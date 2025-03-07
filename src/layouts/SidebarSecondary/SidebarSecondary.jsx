import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import SidebarContent from "./SidebarContent";
import { UserContext } from "../../contexts/UserContext";

const SidebarSecondary = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const FULL_WIDTH = 260;
  const COLLAPSED_WIDTH = 70;
  const { folderID } = useParams();
  const { folders } = useContext(UserContext);

  // Find the current folder (if any)
  const folder = folders.find((f) => f.id === folderID);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <Box
      sx={{
        width: isExpanded ? FULL_WIDTH : COLLAPSED_WIDTH,
        transition: "width 0.3s ease-in-out",
        borderRight: 1,
        borderRightColor: "divider",
        overflowY: "auto",
      }}
    >
      {/* Top header: expand/collapse button and folder name (only when expanded) */}
      <Box sx={{ p: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          onClick={toggleExpand}
          size="small"
          sx={{
            border: "1px solid #999",
            bgcolor: "background.paper",
            transform: "rotate(45deg)",
          }}
        >
          {isExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
        </IconButton>
        {isExpanded && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {folder ? folder.folderName : "Unfoldered"}
          </Typography>
        )}
      </Box>

      {/* Sidebar content containing the new study resource button and the study resources */}
      <SidebarContent isExpanded={isExpanded} />
    </Box>
  );
};

export default SidebarSecondary;
