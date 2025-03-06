// src/layouts/MainLayout.jsx

import React from "react";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";

import SidebarPrimary from "./SidebarPrimary/SidebarPrimary";
import SidebarSecondary from "./SidebarSecondary/SidebarSecondary";

const MainLayout = () => {

  const PRIMARYsidebarWIDTH = '80px';

  return (
    <Box
      sx={{
        display: "flex",
        // Use 100vh so the container (and thus the sidebars) fills the entire viewport
        height: "100vh",
        bgcolor: "background.paper"
      }}
    >
      {/* 1) PRIMARY SIDEBAR (constant 80px width, no scrolling) */}
      <Box
        sx={{
          width: PRIMARYsidebarWIDTH,
          flexShrink: 0,
          overflow: "scroll", // no scroll bar in primary
        }}
      >
        <SidebarPrimary />
      </Box>

      <Box sx={{bgcolor: "background.default", borderRadius: 5, display: 'flex', m: 1}}>
        {/* 2) SECONDARY SIDEBAR (expand/collapse width inside itself), no scrolling */}
        <SidebarSecondary />

        {/* 3) MAIN CONTENT (flexes to fill remaining space, scrollable) */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto", // only the main content scrolls
            overflowX: "hidden", // typically hide horizontal scroll
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
