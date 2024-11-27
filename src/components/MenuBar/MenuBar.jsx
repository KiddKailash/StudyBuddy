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

  /**
   * Handles the logout process.
   */
  const handleLogout = () => {
    resetUserContext(); // Clears user data and resets login state
    navigate("/login"); // Redirects to login page
  };

  return (
    <AppBar
      component="nav"
      position="fixed"
      sx={{
        backgroundColor: theme.palette.background.paper,
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
          <UpgradeButton />
          {user && <AccountInfo accountType={user.accountType} />}
          {/* Add more menu items as needed */}
        </Box>

        {/* Right Side: Profile Avatar or Login Button */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {user ? (
            <AvatarMenu user={user} onLogout={handleLogout} />
          ) : (
            <Button color="inherit" component={Link} to="/login">
              Login
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
