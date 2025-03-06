// src/components/SideBar/SidebarSecondary.jsx
import React, { useState } from "react";
import { Box, IconButton } from "@mui/material";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import SidebarContent from "./SidebarContent";

/**
 * Secondary sidebar that can expand/collapse its width.
 * - If expanded => 260px
 * - If collapsed => 80px
 */
const SidebarSecondary = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const FULL_WIDTH = 260;
  const COLLAPSED_WIDTH = 80;

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: isExpanded ? FULL_WIDTH : COLLAPSED_WIDTH,
        transition: "width 0s ease-in-out",
        borderRight: isExpanded ? 1 : 0,
        borderRightColor: "background.paper",
        overflowY: "auto",
      }}
    >
      {/* Button to toggle expand/collapse */}
      <IconButton
        onClick={toggleExpand}
        size="small"
        sx={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 10,
          border: "1px solid #999",
          bgcolor: "background.paper",
          transform: "rotate(45deg)",
        }}
      >
        {isExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
      </IconButton>

      {/* Sidebar content (menu items, etc.) - pass isExpanded as a prop */}
      <Box sx={{ p: 2, pt: 6 }}>
        <SidebarContent isExpanded={isExpanded} />
      </Box>
    </Box>
  );
};

export default SidebarSecondary;
