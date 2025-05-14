import React, { useContext } from "react";
import { Link } from "react-router-dom";

// MUI
import { useTheme } from "@mui/material/styles";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import Avatar from "@mui/material/Avatar";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";

// Local Imports
import { useTranslation } from "react-i18next";
import { UserProvider } from "../../contexts/User";
import { useThemeContext } from "../../contexts/ColourTheme";
import {
  getAvatarColor,
  getUserInitials,
} from "./MenuBarUtils";

const AvatarMenu = () => {
  const theme = useTheme();
  const { user, logout } = useContext(UserContext);

  // Custom theme context to toggle between light/dark
  const { dispatch, mode } = useThemeContext();
  const { t } = useTranslation();

  return (
    <SpeedDial
      ariaLabel="User Menu"
      // Let the actions expand "up" so they remain in the sidebar
      direction="right"
      sx={{
        position: "absolute",
        zIndex: 50,
        bottom: 30,
        left: 27
      }}
      icon={
        <Avatar
          sx={{
            bgcolor: getAvatarColor(user?.email, theme),
            color: "#ffffff",
            width: 48,
            height: 48,
          }}
        >
          {getUserInitials(user)}
        </Avatar>
      }
      FabProps={{
        size: "small",
      }}
    >
      {/* Logout */}
      <SpeedDialAction
        icon={<ExitToAppRoundedIcon color="error" />}
        tooltipTitle={t("log_out")}
        onClick={logout}
      />

      {/* Toggle Light/Dark Theme */}
      <SpeedDialAction
        icon={mode === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
        tooltipTitle={
          mode === "dark" ? t("switch_to_light") : t("switch_to_dark")
        }
        onClick={dispatch}
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

export default AvatarMenu;
