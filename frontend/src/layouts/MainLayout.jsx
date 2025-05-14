import React, { useState, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";

// Local Imports
import SidebarPrimary from "./SidebarPrimary/SidebarPrimary";
import SidebarSecondary from "./SidebarSecondary/SidebarSecondary";
import ErrorBoundary from "../components/ErrorBoundary";

// MUI
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

/**
 * Layout:
 *    [PrimarySidebar 80px] | [SecondarySidebar collapsible] | [Main content area fills leftover space + can scroll]
 *    
 *    On mobile: 
 *    - Sidebars are hidden in a drawer
 *    - Main content takes full width
 */
const MainLayout = () => {
  const PRIMARY_SIDEBAR_WIDTH = 80;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const location = useLocation();

  const isLoginPage = location.pathname === "/login";
  const isLandingPage = location.pathname === "/landing-page";
  const isTOSorPrivacy =
    location.pathname === "/terms" || location.pathname === "/privacy";
  const noActiveFolder =
    location.pathname === "/" || location.pathname === "/create";
  const isSettings = location.pathname === "/settings";
  
  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const showSidebars = !isLoginPage && !isLandingPage && !isTOSorPrivacy;
  const showSecondary = showSidebars && !noActiveFolder && !isSettings;

  // Fallback UI for errors in mobile drawer
  const drawerErrorFallback = (
    <Box p={3} textAlign="center">
      <Typography variant="body2" color="error">
        Unable to load sidebar content
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh", // fill viewport height
        width: "100vw",
        bgcolor: "background.paper",
        p: { xs: 0, sm: 1 }, // Remove padding on mobile
      }}
    >
      {/* MOBILE DRAWER */}
      {isMobile && showSidebars && (
        <>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              position: 'absolute', 
              top: 10, 
              left: 10, 
              zIndex: 1100,
              bgcolor: 'background.paper',
              boxShadow: 1,
              borderRadius: '50%'
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Drawer
            variant="temporary"
            open={mobileDrawerOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better mobile performance
            }}
            sx={{
              '& .MuiDrawer-paper': { 
                width: '80%', 
                maxWidth: 320,
                display: 'flex',
                flexDirection: 'row'
              },
            }}
          >
            {/* PRIMARY SIDEBAR IN DRAWER */}
            <ErrorBoundary>
              <Suspense fallback={<CircularProgress />}>
                <Box
                  sx={{
                    width: PRIMARY_SIDEBAR_WIDTH,
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  <SidebarPrimary mobileMode={true} />
                </Box>
              </Suspense>
            </ErrorBoundary>
            
            {/* SECONDARY SIDEBAR IN DRAWER */}
            {showSecondary && (
              <ErrorBoundary>
                <Suspense fallback={<CircularProgress />}>
                  <SidebarSecondary mobileMode={true} />
                </Suspense>
              </ErrorBoundary>
            )}
          </Drawer>
        </>
      )}

      {/* PRIMARY SIDEBAR - DESKTOP */}
      {!isMobile && showSidebars && (
        <ErrorBoundary>
          <Box
            sx={{
              width: PRIMARY_SIDEBAR_WIDTH,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <SidebarPrimary />
          </Box>
        </ErrorBoundary>
      )}

      {/* Outer box that holds secondary sidebar + main content */}
      <Box
        sx={{
          bgcolor: "background.default",
          borderRadius: { xs: 0, sm: 5 }, // No border radius on mobile
          display: "flex",
          flexGrow: 1, // let this box expand to fill leftover space
        }}
      >
        {/* SECONDARY SIDEBAR - DESKTOP */}
        {!isMobile && showSecondary && (
          <ErrorBoundary>
            <SidebarSecondary />
          </ErrorBoundary>
        )}

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
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
