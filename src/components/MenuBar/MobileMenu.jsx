// MobileMenu.jsx
import React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import UpgradeButton from "./UpgradeButton";

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

  return (
    <Box sx={{ display: { sm: "none" }, alignItems: "center" }}>
      <IconButton
        color="inherit"
        aria-label={t("open_drawer")}
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>
      <UpgradeButton />
    </Box>
  );
};

MobileMenu.propTypes = {
  handleDrawerToggle: PropTypes.func.isRequired,
};

export default MobileMenu;
