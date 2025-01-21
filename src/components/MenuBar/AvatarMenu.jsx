import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";

import { useTranslation } from "react-i18next";
import { getAvatarColor, getUserInitials } from "./menubarUtils";

// Import your theme context hook
// Example: import { useThemeContext } from "../theme/SetTheme";
import { useThemeContext } from "../../contexts/ThemeProvider";

const AvatarMenu = ({ user, onLogout }) => {
  // This is the MUI theme hook, but only used for reading default theme values if needed
  const theme = useTheme();

  // Your custom theme context to toggle between light & dark
  const { dispatch, mode } = useThemeContext();

  const { t } = useTranslation();

  return (
    <SpeedDial
      ariaLabel="User Menu"
      // Absolutely position this SpeedDial inside its parent Box
      sx={{
        position: "absolute",
        top: -28,
        right: 0,
        // Keep a very high z-index so it floats over all MenuBar elements
        zIndex: 9999,
      }}
      // Instead of opening horizontally, open vertically
      direction="left" // or "up"
      icon={
        <Avatar
          sx={{
            bgcolor: getAvatarColor(user.email, theme),
            color: "#ffffff",
            width: 50,
            height: 50,
          }}
        >
          {getUserInitials(user)}
        </Avatar>
      }
      FabProps={{
        // Control the size or shape of the SpeedDial fab
        size: "small",
      }}
    >
      {/* Toggle Light/Dark Theme */}
      <SpeedDialAction
        icon={
          mode === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />
        }
        tooltipTitle={
          mode === "dark" ? t("switch_to_light") : t("switch_to_dark")
        }
        onClick={dispatch} // Calls the reducer to flip between light/dark
      />

      {/* Logout */}
      <SpeedDialAction
        icon={<ExitToAppRoundedIcon color="error" />}
        tooltipTitle={t("log_out")}
        onClick={onLogout}
      />

      {/* Settings */}
      <SpeedDialAction
        icon={<SettingsIcon />}
        tooltipTitle={t("settings")}
        component={Link}
        to="/settings"
      />
    </SpeedDial>
  );
};

AvatarMenu.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    accountType: PropTypes.string,
  }).isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default AvatarMenu;
