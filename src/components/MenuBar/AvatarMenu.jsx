import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import { getAvatarColor, getUserInitials } from "./menubarUtils";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import { useTranslation } from "react-i18next";

const AvatarMenu = ({ user, onLogout }) => {
  const theme = useTheme();
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
      <SpeedDialAction
        icon={<ExitToAppRoundedIcon color="error" />}
        tooltipTitle={t("log_out")}
        onClick={onLogout}
      />
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
