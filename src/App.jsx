import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import CircularProgress from '@mui/material/CircularProgress';

import MenuBar from './components/MenuBar';
import Sidebar from './components/Sidebar';
import GPTchat from './components/GPTchat';

import UpgradeSubscription from './webpages/UpgradeSubscription';
import FlashcardSession from './webpages/FlashcardSession';
import StudySession from './webpages/StudySession';
import LoginPage from './webpages/Login';
import PageNotFound from './webpages/PageNotFound';
import SettingsPage from './webpages/Settings';
import Success from './webpages/Success';
import Cancel from './webpages/Cancel';

import ProtectedRoute from './components/ProtectedRoute';

import { UserContext } from './contexts/UserContext';

import './App.css';

function App() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const sidebarWidth = '260px';
  const menubarHeight = '64px';

  const { isLoggedIn, authLoading } = useContext(UserContext);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const pages = [
    { path: '/', component: <StudySession /> }, // Default route
    { path: '/upgrade', component: <UpgradeSubscription /> },
    { path: '/flashcards/:id', component: <FlashcardSession /> }, // Specific Flashcard Session
    { path: '/login', component: <LoginPage /> }, // Login Page
    { path: '/settings', component: <SettingsPage /> }, // Settings Page
    { path: '/success', component: <Success /> }, // Payment Success Page
    { path: '/cancel', component: <Cancel /> }, // Payment Cancelled Page
    { path: '*', component: <PageNotFound /> }, // 404 Page
  ];

  if (authLoading) {
    // Show a loading spinner or placeholder while checking authentication
    return (
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
              position: 'fixed',
              top: menubarHeight,
              left: 0,
              width: isExpanded ? sidebarWidth : 0,
              height: `calc(100vh - ${menubarHeight})`,
              bgcolor: 'background.paper',
              overflowY: 'auto',
              zIndex: 1,
              transition: 'width 0.3s ease-in-out',
              display: {
                xs: 'none',
                sm: 'block',
              },
            }}
          >
            {isExpanded && (
              <Sidebar
                mobileOpen={mobileOpen}
                handleDrawerToggle={handleDrawerToggle}
                drawerWidth={sidebarWidth}
                menubarHeight={menubarHeight}
              />
            )}
          </Box>

          {/* Main Content */}
          <Box
            sx={{
              position: 'fixed',
              top: menubarHeight, // Always below the MenuBar
              left: isMobile || !isExpanded ? 0 : sidebarWidth, // Full width on mobile or when sidebar is hidden
              width:
                isMobile || !isExpanded
                  ? '100vw'
                  : `calc(100% - ${sidebarWidth})`, // Adjust width
              height: `calc(100vh - ${menubarHeight})`, // Always the full height below the MenuBar
              padding: 2,
              borderLeft: isExpanded ? '1px solid #ccc' : 'none', // Remove border when sidebar is hidden
              bgcolor: 'background.paper',
              zIndex: 50, // Higher z-index to overlay other components
              transition: 'all 0.3s ease-in-out',
              overflow: 'auto', // Prevent content overflow
            }}
          >
            {/* Expand/Collapse Button */}
            {!isMobile && (
              <IconButton
                onClick={toggleExpand}
                sx={{
                  position: 'fixed',
                  bottom: '40px',
                  right: '40px',
                  transform: 'rotate(45deg)', // Always rotate 45 degrees
                  transition: 'transform 0.3s ease-in-out',
                  zIndex: '5000',
                  border: '1px solid grey',
                  bgcolor: 'background.default',
                  '&:hover': {
                    bgcolor: 'grey.200',
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
                    page.path.startsWith('/flashcards') ||
                    page.path === '/' ||
                    page.path === '/settings' ||
                    page.path === '/upgrade' ? (
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
              position: 'fixed',
              bottom: '0',
              right: '0',
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
