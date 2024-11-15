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

  const sidebarWidth = '260px';
  const menubarHeight = '64px';

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
          <Box
            component="nav"
            sx={{
              position: "fixed",
              top: menubarHeight,
              left: 0,
              width: sidebarWidth,
              height: `calc(100vh - ${menubarHeight})`,
              bgcolor: "background.paper",
              overflowY: "auto",
              zIndex: 1,
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

          {/* Main Content */}
          <Box
            sx={{
              position: "fixed",
              top: isExpanded ? menubarHeight : menubarHeight, // Cover header when expanded
              left: isExpanded ? 0 : sidebarWidth, // Align with sidebar or expand fully
              width: isExpanded ? "100vw" : `calc(100% - ${sidebarWidth})`,
              height: isExpanded
                ? `calc(100vh - ${menubarHeight})`
                : `calc(100vh - ${menubarHeight})`,
              padding: 2,
              borderLeft: "1px solid #ccc",
              bgcolor: "background.paper",
              zIndex: 50, // Higher z-index to overlay other components
              transition: "all 0.3s ease-in-out",
              boxShadow: isExpanded ? "none" : "none", // Optional: Add shadow when expanded
              overflow: "auto", // Prevent content overflow during transition
            }}
          >
            {/* Expand/Collapse Button */}
            <IconButton
              onClick={toggleExpand}
              sx={{
                position: "fixed",
                bottom: "40px",
                right: "40px",
                transform: "rotate(45deg)", // Always rotate 45 degrees
                transition: "transform 0.3s ease-in-out",
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
          <Box
            sx={{
              position: "fixed",
              bottom: "0",
              right: "0",
              zIndex: 100, // Lower z-index
            }}
          >
            <GPTchat />
          </Box>
        </>
      )}
    </Router>
  );
}

export default App;
