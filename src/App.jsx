// src/App.jsx

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";

import MenuBar from "./components/MenuBar";
import Footer from "./components/Footer";
import GPTchat from "./components/GPTchat";
import Sidebar from "./components/Sidebar";

import UpgradeSubscription from "./webpages/UpgradeSubscription";
import FlashcardSession from "./webpages/FlashcardSession";
import StudySession from "./webpages/StudySession";
import LoginPage from "./webpages/Login";
import PageNotFound from "./webpages/PageNotFound";

import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function App() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const [user, setUser] = useState(null); // State to hold user information

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  // Check for token and user info on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const pages = [
    { path: "/", component: <StudySession /> }, // Default route
    { path: "/upgrade", component: <UpgradeSubscription /> },
    { path: "/flashcards/:id", component: <FlashcardSession /> }, // Specific Flashcard Session
    { path: "/login", component: <LoginPage /> }, // Login Page
    { path: "*", component: <PageNotFound /> }, // 404 Page
  ];

  return (
    <Router>
      {/* Conditionally render login page or main content */}
      {!isLoggedIn ? (
        <LoginPage setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
      ) : (
        <>
          {/* Header */}
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              zIndex: 1000,
            }}
          >
            {/* Pass setIsLoggedIn and user to MenuBar */}
            <MenuBar setIsLoggedIn={setIsLoggedIn} user={user} />
          </Box>

          {/* Sidebar */}
          <Box
            component="nav"
            sx={{
              position: "fixed",
              top: "64px", // Adjust based on the height of your MenuBar
              left: 0,
              width: "240px", // Fixed width for the sidebar
              height: "calc(100vh - 64px)", // Full height minus header
              bgcolor: "background.default",
              borderRight: "1px solid #ccc",
              overflowY: "auto",
              zIndex: 1, // Lower z-index
            }}
          >
            <Sidebar />
          </Box>

          {/* Main Content */}
          <Box
            sx={{
              position: "fixed",
              top: isExpanded ? 0 : "64px", // Cover header when expanded
              left: isExpanded ? 0 : "240px", // Align with sidebar or expand fully
              width: isExpanded ? "100vw" : `calc(100% - 240px)`,
              height: isExpanded ? "100vh" : "calc(100vh - 64px)",
              padding: 2,
              bgcolor: "background.paper",
              zIndex: 50, // Higher z-index to overlay other components
              transition: "all 0.5s ease-in-out",
              boxShadow: isExpanded ? 3 : "none", // Optional: Add shadow when expanded
              overflow: "auto", // Prevent content overflow during transition
            }}
          >
            {/* Expand/Collapse Button */}
            <IconButton
              onClick={toggleExpand}
              sx={{
                position: "absolute",
                bottom: "40px",
                right: "40px",
                transform: "rotate(45deg)", // Always rotate 45 degrees
                transition: "transform 0.3s ease-in-out",
                bgcolor: "background.default",
                "&:hover": {
                  bgcolor: "grey.200",
                },
              }}
            >
              {isExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
            </IconButton>

            {/* Conditionally Render MenuBar Inside MainContent When Expanded */}
            {isExpanded && (
              <Box sx={{ mb: 2 }}>
                <MenuBar setIsLoggedIn={setIsLoggedIn} user={user} />
              </Box>
            )}

            {/* Routes */}
            <Routes>
              {pages.map((page, index) => (
                <Route
                  key={index}
                  path={page.path}
                  element={
                    page.path.startsWith("/flashcards") ? (
                      <ProtectedRoute isLoggedIn={isLoggedIn}>
                        {page.component}
                      </ProtectedRoute>
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

          {/* Footer */}
          {/* <Box
            sx={{
              position: "fixed",
              bottom: 0,
              left: "240px", // Align with the sidebar
              width: `calc(100% - 240px)`, // Full width minus sidebar
              bgcolor: "background.paper",
              zIndex: 100, // Lower z-index
            }}
          >
            <Footer />
          </Box> */}
        </>
      )}
    </Router>
  );
}

export default App;
