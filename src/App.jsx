import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Box from "@mui/material/Box";

import MenuBar from "./components/MenuBar";
import Footer from "./components/Footer";
import GPTchat from "./components/GPTchat";

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
      {/* <MenuBar /> */}

      <Box sx={{ padding: 2 }}>
        <Routes>
          {pages.map((page, index) => (
            <Route key={index} path={page.path} element={page.component} />
          ))}
        </Routes>
      </Box>

      <GPTchat />

      {/* <Box sx={{ width: "100%", position: "relative", left: 0 }}>
        <Footer />
      </Box> */}
    </Router>
  );
}

export default App;
