import React from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";

// ================================
// MUI Component Imports
// ================================
import { useTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";

/**
 * MenuItem component renders a navigation link styled as a button.
 *
 * @param {string} link - The URL path to navigate to when the item is clicked.
 * @param {string} name - The display text for the menu item.
 *
 * @return {JSX.Element} - The rendered menu item component.
 */
const MenuItem = ({ link, name }) => {
  const theme = useTheme(); // Access the current theme settings

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
        // Apply centralized transition from theme
        transition: theme.transitions.backgroundAndText,
      }}
    >
      {name}
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
  name: PropTypes.string.isRequired,
};

export default MenuItem;
