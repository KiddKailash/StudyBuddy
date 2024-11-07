import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Box from "@mui/material/Box";

import MenuBar from "./components/MenuBar";
import Footer from "./components/Footer";
import GPTchat from "./components/GPTchat";
import Sidebar from "./components/Sidebar"; // Ensure you have the Sidebar component

import PageNotFound from "./webpages/PageNotFound";
import LandingPage from "./webpages/LandingPage";

import "./App.css";

function App() {
  const pages = [
    { path: "/", component: <LandingPage /> },
    { path: "*", component: <PageNotFound /> },
  ];

  return (
    <Router>
      {/* Header */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}>
        <MenuBar />
      </Box>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          position: 'fixed',
          top: '64px', // Adjust based on the height of your MenuBar
          left: 0,
          width: '240px', // Fixed width for the sidebar
          height: 'calc(100vh - 64px)', // Full height minus header
          bgcolor: 'background.default',
          borderRight: '1px solid #ccc',
          overflowY: 'auto',
          zIndex: 900,
        }}
      >
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          marginTop: '64px', // Height of the header
          marginLeft: '240px', // Width of the sidebar
          padding: 2,
          minHeight: 'calc(100vh - 64px)', // Ensure the main content covers the viewport
        }}
      >
        <Routes>
          {pages.map((page, index) => (
            <Route key={index} path={page.path} element={page.component} />
          ))}
        </Routes>
      </Box>

      {/* GPT Chat */}
      <GPTchat />

      {/* Footer */}
      <Box
        sx={{
          position: 'relative',
          bottom: 0,
          left: '240px', // Align with the sidebar
          width: `calc(100% - 240px)`, // Full width minus sidebar
          bgcolor: 'background.paper',
        }}
      >
        <Footer />
      </Box>
    </Router>
  );
}

export default App;
