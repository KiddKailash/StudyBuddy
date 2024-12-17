import React, { useContext } from "react";
import PropTypes from "prop-types";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { UserContext } from "../../contexts/UserContext";
import MobileMenu from "./MobileMenu";
import UpgradeButton from "./UpgradeButton";
import AccountInfo from "./AccountInfo";
import AvatarMenu from "./AvatarMenu";

// Import the useTranslation hook
import { useTranslation } from "react-i18next";

/**
 * MenuBar component renders the top navigation bar of the application.
 *
 * @param {object} props - Component props.
 * @param {function} props.handleDrawerToggle - Function to toggle the sidebar drawer.
 * @returns {JSX.Element} - The rendered MenuBar component.
 */
const MenuBar = ({ handleDrawerToggle }) => {
  const { user, resetUserContext } = useContext(UserContext);
  const navigate = useNavigate();
  const theme = useTheme();

  // Initialize the translation function
  const { t } = useTranslation();

  /**
   * Handles the logout process.
   */
  const handleLogout = () => {
    resetUserContext(); // Clears user data and resets login state
    navigate("/"); // Redirects to homepage
  };

  return (
    <AppBar
      component="nav"
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "transparent",
        boxShadow: "none",
        color: theme.palette.text.secondary,
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(["background-color", "color"], {
          duration: theme.transitions.duration.standard,
        }),
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        {/* Mobile Menu */}
        <MobileMenu handleDrawerToggle={handleDrawerToggle} />

        {/* Desktop Menu */}
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            flexGrow: 1,
          }}
        >
          {/*
            Show UpgradeButton if user is not logged in (user === null)
            OR if user.accountType !== "paid".
          */}
          {(user && user.accountType !== "paid") && <UpgradeButton />}

          {/* Add more menu items as needed, e.g. <AccountInfo /> */}
        </Box>

        {/* Right Side: Profile Avatar or Login Button */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {user ? (
            <AvatarMenu user={user} onLogout={handleLogout} />
          ) : (
            <Button variant="contained" component={Link} to="/login">
              {t("login")}
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

MenuBar.propTypes = {
  handleDrawerToggle: PropTypes.func.isRequired, // Function to toggle the drawer
};

export default MenuBar;
