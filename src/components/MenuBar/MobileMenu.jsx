import React, {useContext} from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import UpgradeButton from "./UpgradeButton";
import { UserContext } from "../../contexts/UserContext";

// Import the useTranslation hook
import { useTranslation } from "react-i18next";

/**
 * MobileMenu component handles the mobile-specific menu items.
 *
 * @param {object} props - Component props.
 * @param {function} props.handleDrawerToggle - Function to toggle the sidebar drawer.
 * @returns {JSX.Element} - The rendered MobileMenu component.
 */
const MobileMenu = ({ handleDrawerToggle }) => {
  // Initialize the translation function
  const { t } = useTranslation();
  const { user } = useContext(UserContext);

  return (
    <Box sx={{ display: { sm: "none" }, alignItems: "center" }}>
      <IconButton
        color="inherit"
        aria-label={t("open_drawer")}
        edge="start"
        onClick={handleDrawerToggle}
        sx={{mt: 1.3, mb: 1.3}}
      >
        <MenuIcon fontSize="large" sx={{mr: 2}}/>
      </IconButton>
      {user && user.accountType !== "paid" && <UpgradeButton />}
    </Box>
  );
};

MobileMenu.propTypes = {
  handleDrawerToggle: PropTypes.func.isRequired,
};

export default MobileMenu;
