import React, { useContext } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import Typography from "@mui/material/Typography";
import { SnackbarContext } from "../../contexts/SnackbarContext";
import { getAvatarColor, getUserInitials } from "./menubarUtils";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import { useTranslation } from "react-i18next";

/**
 * AvatarMenu component refactored to use MUI SpeedDial component.
 *
 * @param {object} props - Component props.
 * @param {object} props.user - User object containing user details.
 * @param {function} props.onLogout - Function to handle user logout.
 * @returns {JSX.Element} - The rendered AvatarMenu component as a SpeedDial.
 */
const AvatarMenu = ({ user, onLogout }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { showSnackbar } = useContext(SnackbarContext);

  return (
    <SpeedDial
      ariaLabel="User Menu"
      icon={
        <Avatar
          sx={{
            bgcolor: getAvatarColor(user.email, theme),
            color: "#ffffff",
          }}
        >
          {getUserInitials(user)}
        </Avatar>
      }
      direction="left"
      FabProps={{
        size: "small",  
      }}
    >
      <SpeedDialAction
        icon={<ExitToAppRoundedIcon color="error" />}
        tooltipTitle={t("log_out")}
        onClick={onLogout}
        FabProps={{
          sx: {},
        }}
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
