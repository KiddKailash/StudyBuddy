import React from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";

// MUI Component Imports
import { useTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";

// Import the useTranslation hook
import { useTranslation } from 'react-i18next';

/**
 * MenuItem component renders a navigation link styled as a button.
 *
 * @param {string} link - The URL path to navigate to when the item is clicked.
 * @param {string} translationKey - The translation key for the menu item name.
 *
 * @return {JSX.Element} - The rendered menu item component.
 */
const MenuItem = ({ link, translationKey }) => {
  const theme = useTheme(); // Access the current theme settings
  const { t } = useTranslation(); // Initialize the translation function

  /**
   * Renders the button with styling based on the active state.
   *
   * @param {object} isActive - Object indicating whether the NavLink is active.
   * @param {boolean} isActive.isActive - True if the current route matches the link.
   *
   * @return {JSX.Element} - The styled Button component.
   */
  const renderButton = ({ isActive }) => (
    <Button
      variant="text"
      sx={{
        color: theme.palette.primary.main, // Set the text color based on theme
        borderBottom: isActive
          ? `2px solid ${theme.palette.primary.main}` // Underline if active
          : "none",
        "&:hover": {
          backgroundColor: theme.palette.action.hover, // Hover effect
        },
      }}
    >
      {t(translationKey)}
    </Button>
  );

  return (
    // Use NavLink for navigation with styling based on active state
    <NavLink to={link} style={{ textDecoration: "none" }}>
      {renderButton}
    </NavLink>
  );
};

MenuItem.propTypes = {
  link: PropTypes.string.isRequired,
  translationKey: PropTypes.string.isRequired,
};

export default MenuItem;
