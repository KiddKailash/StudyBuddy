import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useContext } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";

import MenuBar from "./components/MenuBar";
import Sidebar from "./components/Sidebar";
import GPTchat from "./components/GPTchat";

import UpgradeSubscription from "./webpages/UpgradeSubscription";
import FlashcardSession from "./webpages/FlashcardSession";
import StudySession from "./webpages/StudySession";
import LoginPage from "./webpages/Login";
import PageNotFound from "./webpages/PageNotFound";
import SettingsPage from "./webpages/Settings";

import ProtectedRoute from "./components/ProtectedRoute";

import { UserContext } from "./contexts/UserContext";

import "./App.css";

function App() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const sidebarWidth = 260;
  const menubarHeight = 64;

  const { isLoggedIn } = useContext(UserContext);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const pages = [
    { path: "/", component: <StudySession /> }, // Default route
    { path: "/upgrade", component: <UpgradeSubscription /> },
    { path: "/flashcards/:id", component: <FlashcardSession /> }, // Specific Flashcard Session
    { path: "/login", component: <LoginPage /> }, // Login Page
    { path: "/settings", component: <SettingsPage /> }, // Settings Page
    { path: "*", component: <PageNotFound /> }, // 404 Page
  ];

  return (
    <Router>
      {!isLoggedIn ? (
        <LoginPage />
      ) : (
        <>
          {/* MenuBar */}
          <MenuBar handleDrawerToggle={handleDrawerToggle} />

          {/* Sidebar */}
          <Sidebar
            mobileOpen={mobileOpen}
            handleDrawerToggle={handleDrawerToggle}
            drawerWidth={sidebarWidth}
            menubarHeight={menubarHeight}
          />

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              position: "relative",
              marginTop: `${menubarHeight}px`,
              marginLeft: isMobile
                ? 0
                : isExpanded
                ? 0
                : `${sidebarWidth}px`,
              width: isMobile
                ? "100%"
                : isExpanded
                ? "100%"
                : `calc(100% - ${sidebarWidth}px)`,
              height: `calc(100vh - ${menubarHeight}px)`,
              padding: 2,
              overflow: "auto",
            }}
          >
            {/* Expand/Collapse Button */}
            {!isMobile && (
              <IconButton
                onClick={toggleExpand}
                sx={{
                  position: "fixed",
                  bottom: "40px",
                  right: "40px",
                  zIndex: "5000",
                  border: "1px solid grey",
                  bgcolor: "background.default",
                  "&:hover": {
                    bgcolor: "grey.200",
                  },
                }}
              >
                {isExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
              </IconButton>
            )}

            {/* Routes */}
            <Routes>
              {pages.map((page, index) => (
                <Route
                  key={index}
                  path={page.path}
                  element={
                    page.path.startsWith("/flashcards") ? (
                      <ProtectedRoute>{page.component}</ProtectedRoute>
                    ) : (
                      page.component
                    )
                  }
                />
              ))}
            </Routes>
          </Box>

          {/* GPT Chat */}
          {!isMobile && (
            <Box
              sx={{
                position: "fixed",
                bottom: "0",
                right: "0",
                zIndex: 100,
              }}
            >
              <GPTchat />
            </Box>
          )}
        </>
      )}
    </Router>
  );
}

export default App;
