import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

import SidebarPrimary from "./SidebarPrimary/SidebarPrimary";
import SidebarSecondary from "./SidebarSecondary/SidebarSecondary";

/**
 * Layout:
 *    [PrimarySidebar 80px] | [SecondarySidebar collapsible] | [Main content area fills leftover space + can scroll]
 */
const MainLayout = () => {
  const PRIMARY_SIDEBAR_WIDTH = 80;

  const location = useLocation();

  const isLoginPage = location.pathname === "/login";
  const isLandingPage = location.pathname === "/landing-page";
  const isTOSorPrivacy =
    location.pathname === "/terms" || location.pathname === "/privacy";
  const noActiveFolder =
    location.pathname === "/" || location.pathname === "/create";

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh", // fill viewport height
        width: "100vw",
        bgcolor: "background.paper",
        p: 1,
      }}
    >
      {/* PRIMARY SIDEBAR */}
      {!isLoginPage && !isLandingPage && !isTOSorPrivacy && (
        <Box
          sx={{
            width: PRIMARY_SIDEBAR_WIDTH,
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <SidebarPrimary />
        </Box>
      )}

      {/* Outer box that holds secondary sidebar + main content */}
      <Box
        sx={{
          bgcolor: "background.default",
          borderRadius: 5,
          display: "flex",
          flexGrow: 1, // let this box expand to fill leftover space
        }}
      >
        {/* SECONDARY SIDEBAR */}

        {!isLoginPage &&
          !isLandingPage &&
          !isTOSorPrivacy &&
          !noActiveFolder && <SidebarSecondary />}

        {/* MAIN CONTENT AREA */}
        <Box
          sx={{
            flexGrow: 1, // again, fill remaining horizontal space
            overflowY: "auto", // scroll if content is too tall
            display: "flex", // we use a flex container to position the <Container>
            width: "100%",
            height: "100%",
          }}
        >
          {/* Renders whatever route/page is active */}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
