import React, { useState, useContext } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import CircularProgress from "@mui/material/CircularProgress";

// Layout components
import MenuBar from "./components/MenuBar/MenuBar";
import Sidebar from "./components/SideBar/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

// Existing pages
import FlashcardSession from "./webpages/FlashcardSession";
import CreateStudySession from "./webpages/CreateStudySession";
import LoginPage from "./webpages/Login";
import PageNotFound from "./webpages/PageNotFound";
import SettingsPage from "./webpages/Settings";
import Success from "./webpages/Success";
import Cancel from "./webpages/Cancel";
import PrivacyPolicy from "./webpages/PrivacyPolicy";
import TermsOfService from "./webpages/TermsOfService";
import LandingPage from "./webpages/LandingPage";
import { CheckoutForm, Return } from "./webpages/StripeForm";
import CreateStudyResource from "./webpages/CreateStudyResource";

// NEW resource pages
import MCQSession from "./webpages/MCQSession";
import SummaryPage from "./webpages/SummaryPage";
import AIChatPage from "./webpages/AIChatPage";

// Context
import { UserContext } from "./contexts/UserContext";

// Styles
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

  // ----------------------------
  // Define your routes/pages here
  // ----------------------------
  const pages = [
    // Public or existing
    { path: "/", component: <CreateStudySession /> },
    { path: "/landing-page", component: <LandingPage /> },

    // Flashcards, ephemeral and DB
    { path: "/flashcards-local/:id", component: <FlashcardSession /> },
    { path: "/flashcards/:id", component: <FlashcardSession /> },

    // NEW: MCQ Quizzes
    // Ephemeral route (if desired) -> /mcq-local/:id
    { path: "/mcq-local/:id", component: <MCQSession /> },
    // DB-based route (requires auth)
    { path: "/mcq/:id", component: <MCQSession /> },

    // NEW: Summaries
    // Ephemeral route (if desired)
    { path: "/summary-local/:id", component: <SummaryPage /> },
    // DB-based
    { path: "/summary/:id", component: <SummaryPage /> },

    // NEW: AI Chats
    // Ephemeral route (if desired)
    { path: "/chat-local/:id", component: <AIChatPage /> },
    // DB-based
    { path: "/chat/:id", component: <AIChatPage /> },

    // Other existing public pages
    { path: "/login", component: <LoginPage /> },
    { path: "/settings", component: <SettingsPage /> },
    { path: "/success", component: <Success /> },
    { path: "/cancel", component: <Cancel /> },
    { path: "/terms", component: <TermsOfService /> },
    { path: "/privacy", component: <PrivacyPolicy /> },
    { path: "/checkout", component: <CheckoutForm /> },
    { path: "/return", component: <Return /> },

    // The page with the resource creation dialog
    { path: "/create-resource", component: <CreateStudyResource />},

    // 404
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

  // For simpler checks
  const isLoginPage = location.pathname.startsWith("/login");
  const isTermsOrPrivacyPolicy =
    location.pathname.startsWith("/terms") ||
    location.pathname.startsWith("/privacy");
  const isLandingPage = location.pathname.startsWith("/landing-page");

  return (
    <>
      {/* If the user is on login, terms, privacy, or landing, hide the sidebar */}
      {!(isLoginPage || isTermsOrPrivacyPolicy || isLandingPage) && (
        <Box
          component="nav"
          sx={{
            position: "fixed",
            top: `calc(${menubarHeight}-5px)`,
            left: 0,
            width: isExpanded ? sidebarWidth : 0,
            height: `calc(100% - ${menubarHeight})`,
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
          left:
            isMobile || !isExpanded || isLoginPage || isTermsOrPrivacyPolicy || isLandingPage
              ? 0
              : sidebarWidth,
          width:
            isMobile || !isExpanded || isLoginPage || isTermsOrPrivacyPolicy || isLandingPage
              ? "100%"
              : `calc(100% - ${sidebarWidth})`,
          height: "100%",
          padding: 2,
          bgcolor: "background.paper",
          zIndex: 50,
          transition: isLoggedIn
            ? "all 0.3s ease-in-out"
            : "all 0s ease-in-out",
          overflow: "auto",
        }}
      >
        {!(isLoginPage || isTermsOrPrivacyPolicy) && (
          <MenuBar handleDrawerToggle={handleDrawerToggle} />
        )}

        {/* Expand/collapse button for the sidebar (desktop only) */}
        {!isMobile && isLoggedIn && !isLoginPage && !isLandingPage && (
          <IconButton
            onClick={toggleExpand}
            sx={{
              position: "fixed",
              bgcolor: "background.default",
              bottom: "20px",
              right: "20px",
              transform: "rotate(45deg)",
              transition: "transform 0.3s ease-in-out",
              zIndex: "5000",
              border: "0.5px solid grey",
              "&:hover": {
                bgcolor: "background.paper",
              },
            }}
          >
            {isExpanded ? <UnfoldMoreIcon /> : <UnfoldLessIcon />}
          </IconButton>
        )}

        {/* ----------- MAIN ROUTES ----------- */}
        <Routes>
          {pages.map((page, index) => {
            // These paths are public or ephemeral
            // (Add any new ephemeral routes here)
            const publicPaths = [
              "/",
              "/login",
              "/landing-page",
              "/terms",
              "/privacy",
              "/success",
              "/cancel",
            ];

            // ephemeral routes
            const ephemeralRoutes = [
              "/flashcards-local/",
              "/mcq-local/",
              "/summary-local/",
              "/chat-local/",
            ];

            // Check if current route is ephemeral
            const isEphemeral = ephemeralRoutes.some((prefix) =>
              page.path.startsWith(prefix)
            );

            // Public or ephemeral => no ProtectedRoute needed
            const isPublicPage =
              publicPaths.includes(page.path) ||
              page.path === "*" ||
              isEphemeral;

            return (
              <Route
                key={index}
                path={page.path}
                element={
                  isPublicPage ? (
                    page.component
                  ) : (
                    <ProtectedRoute>
                      {page.component}
                    </ProtectedRoute>
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
