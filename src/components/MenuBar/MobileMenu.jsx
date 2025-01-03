import React, { useContext } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import UpgradeButton from "./UpgradeButton";
import { UserContext } from "../../contexts/UserContext";

// Import the useTranslation hook
import { useTranslation } from "react-i18next";

const MobileMenu = ({ handleDrawerToggle }) => {
  // Initialize the translation function
  const { t } = useTranslation();
  const { user } = useContext(UserContext);

  return (
    <Box
      sx={{
        display: { xs: "flex", sm: "none" }, // flex on mobile, hidden on sm & up
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <IconButton
        color="inherit"
        aria-label={t("open_drawer")}
        edge="start"
        onClick={handleDrawerToggle}
        sx={{
          mt: 1.3,
          mb: 1.3,
          "&:focus": {
            outline: "none",
          },
        }}
      >
        {/* Increase hamburger (MenuIcon) size */}
        <MenuIcon sx={{ fontSize: 28 }} />
      </IconButton>
    </Box>
  );
};

MobileMenu.propTypes = {
  handleDrawerToggle: PropTypes.func.isRequired,
};

export default MobileMenu;
