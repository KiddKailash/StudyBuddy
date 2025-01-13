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
import AvatarMenu from "./AvatarMenu";
import LanguageSwitcher from "../LanguageSwitcher";
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
        padding: 1
      }}
    >
      <Toolbar
        sx={{
          // Use flex layout with space-between so items don't push each other off screen
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          // Slightly smaller padding helps on narrow screens
          px: 1,
          overflow: "hidden", // prevents horizontal scroll
        }}
      >
        {/* 
          MOBILE MENU (XS only): Hamburger + optional UpgradeButton 
          We keep margins small so it doesn't push the avatar off screen.
        */}
        <Box
          sx={{
            display: { xs: "flex", sm: "none" },
            alignItems: "center",
          }}
        >
          <MobileMenu handleDrawerToggle={handleDrawerToggle} />
          {user && user.accountType !== "paid" && (
            <UpgradeButton
              sx={{
                ml: 1,
                whiteSpace: "nowrap",
                minWidth: "auto", // Let the button shrink on very narrow screens
                fontSize: "0.8rem", // If needed, reduce font size a bit on mobile
              }}
            />
          )}
        </Box>

        {/* 
          DESKTOP MENU (SM+): Only the UpgradeButton if user not paid 
        */}
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
          }}
        >
          {!user && <LanguageSwitcher />}
          {user && user.accountType !== "paid" && <UpgradeButton />}
        </Box>

        {/* 
          RIGHT SIDE: Avatar (if logged in) or Login button 
          We keep this pinned to the far right with no flexGrow in front of it.
        */}
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
  handleDrawerToggle: PropTypes.func.isRequired,
};

export default MenuBar;
