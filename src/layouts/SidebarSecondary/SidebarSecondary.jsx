import React, { useState } from "react";

// MUI
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";

// Local Imports
import SidebarContent from "./SidebarContent";

const SidebarSecondary = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  const FULL_WIDTH = 260;
  const COLLAPSED_WIDTH = 70;

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <Box
      sx={{
        width: isExpanded ? FULL_WIDTH : COLLAPSED_WIDTH,
        transition: "width 0s ease-in-out",
        borderRight: 1,
        borderRightColor: "divider",
        overflowY: "auto",
      }}
    >
      {/* Move the toggle button into normal flow at the top */}
      <Box sx={{ p: 1 }}>
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
      </Box>

      {/* Sidebar content (menu items, etc.) - pass isExpanded as a prop */}
      <SidebarContent isExpanded={isExpanded} />
    </Box>
  );
};

export default SidebarSecondary;
