import React, { useState, useContext } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import CircularProgress from "@mui/material/CircularProgress";

import MenuBar from "./components/MenuBar/MenuBar";
import Sidebar from "./components/SideBar/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import FlashcardSession from "./webpages/FlashcardSession";
import CreateStudySession from "./webpages/CreateStudySession";
import LoginPage from "./webpages/Login";
import PageNotFound from "./webpages/PageNotFound";
import SettingsPage from "./webpages/Settings";
import Success from "./webpages/Success";
import Cancel from "./webpages/Cancel";
import PrivacyPolicy from "./webpages/PrivacyPolicy";
import TermsOfService from "./webpages/TermsOfService";

import { UserContext } from "./contexts/UserContext";
import "./App.css";

function App() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  const sidebarWidth = "260px";
  const menubarHeight = "64px";

  const { isLoggedIn, authLoading } = useContext(UserContext);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const pages = [
    { path: "/", component: <CreateStudySession /> },
    { path: "/flashcards-local/:id", component: <FlashcardSession isLocal={true} /> },
    { path: "/flashcards/:id", component: <FlashcardSession isLocal={false} /> },
    { path: "/login", component: <LoginPage /> },
    { path: "/settings", component: <SettingsPage /> },
    { path: "/success", component: <Success /> },
    { path: "/cancel", component: <Cancel /> },
    { path: "/terms", component: <TermsOfService /> },
    { path: "/privacy", component: <PrivacyPolicy /> },
    { path: "*", component: <PageNotFound /> },
  ];

  if (authLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {!isLoginPage && (
        <Box
          component="nav"
          sx={{
            position: "fixed",
            top: `calc(${menubarHeight}-5)`,
            left: 0,
            width: isExpanded ? sidebarWidth : 0,
            height: `calc(100% - ${menubarHeight})`,
            bgcolor: "background.paper",
            overflowY: "auto",
            zIndex: 1,
            transition: "width 0.3s ease-in-out",
            display: {
              xs: "none",
              sm: "block",
            },
          }}
        >
          <Sidebar
            mobileOpen={mobileOpen}
            handleDrawerToggle={handleDrawerToggle}
            drawerWidth={sidebarWidth}
            menubarHeight={menubarHeight}
          />
        </Box>
      )}

      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: isMobile || !isExpanded || isLoginPage ? 0 : sidebarWidth,
          width: isMobile || !isExpanded || isLoginPage ? "100%" : `calc(100% - ${sidebarWidth})`,
          height: "100%",
          padding: 2,
          bgcolor: "background.default",
          zIndex: 50,
          transition: isLoggedIn ? "all 0.3s ease-in-out" : "all 0s ease-in-out",
          overflow: "auto",
        }}
      >
        {!isLoginPage && <MenuBar handleDrawerToggle={handleDrawerToggle} />}

        {!isMobile && isLoggedIn && !isLoginPage && (
          <IconButton
            onClick={toggleExpand}
            sx={{
              position: "fixed",
              bottom: "40px",
              right: "40px",
              transform: "rotate(45deg)",
              transition: "transform 0.3s ease-in-out",
              zIndex: "5000",
              border: "1px solid grey",
              bgcolor: "background.default",
              "&:hover": {
                bgcolor: "grey.200",
              },
            }}
          >
            {isExpanded ? <UnfoldMoreIcon /> : <UnfoldLessIcon />}
          </IconButton>
        )}

        <Routes>
          {pages.map((page, index) => {
            const publicPaths = ["/", "/login", "/terms", "/privacy", "/success", "/cancel"];
            const isLocalFlashcardPath = page.path.startsWith("/flashcards-local");

            const isPublicPage =
              publicPaths.includes(page.path) || page.path === "*" || isLocalFlashcardPath;

            return (
              <Route
                key={index}
                path={page.path}
                element={
                  isPublicPage ? (
                    page.component
                  ) : (
                    <ProtectedRoute>{page.component}</ProtectedRoute>
                  )
                }
              />
            );
          })}
        </Routes>
      </Box>
    </>
  );
}

export default App;
