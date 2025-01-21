import React, { useContext } from "react";
import PropTypes from "prop-types";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { UserContext } from "../../contexts/UserContext";
import MobileMenu from "./MobileMenu";
import UpgradeButton from "./UpgradeButton";
import AvatarMenu from "./AvatarMenu";
import { LanguageSwitcherIMG } from "../LanguageSwitcher";
import { useTranslation } from "react-i18next";

const MenuBar = ({ handleDrawerToggle }) => {
  const { user, resetUserContext } = useContext(UserContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();

  const handleLogout = () => {
    resetUserContext();
    navigate("/");
  };

  return (
    <AppBar
      component="nav"
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "transparent",
        boxShadow: "none",
        color: theme.palette.text.secondary,
        // Keep a high z-index if there's a drawer, so the bar is above the drawer
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      {/* 
        Make the Toolbar 'position: relative' so we can absolutely-position
        the Avatar (SpeedDial) in the top-right corner.
      */}
      <Toolbar
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* MOBILE MENU (XS) */}
        <Box
          sx={{
            display: { xs: "flex", sm: "none" },
            alignItems: "center",
          }}
        >
          <MobileMenu handleDrawerToggle={handleDrawerToggle} />
          {user && user.accountType !== "paid" && (
            <UpgradeButton
              sx={{
                whiteSpace: "nowrap",
                minWidth: "auto",
                fontSize: "0.8rem",
              }}
            />
          )}
        </Box>

        {/* DESKTOP MENU (SM+) */}
        <Stack
          spacing={2}
          direction="row"
          sx={{
            display: { xs: "none", sm: "flex" },
          }}
        >
          <LanguageSwitcherIMG />
          {user && user.accountType !== "paid" && <UpgradeButton />}
        </Stack>

        {/* RIGHT SIDE */}
        <Box
          sx={{
            // This container can hold either Avatar or a "Login" button
            // We'll fill the space, but the Avatar itself is absolutely positioned inside it.
            position: "relative",
            width: 80,
            minWidth: 80,
            // You can adjust these widths to ensure your SpeedDial won't be cut off
            // if it opens downward or upward.
          }}
        >
          {user ? (
            <AvatarMenu user={user} onLogout={handleLogout} />
          ) : (
            <Button
              variant="contained"
              component={Link}
              to="/login"
              sx={{
                position: "absolute", // keep the button top-right
                right: 0,
                top: -28,
                minWidth: 150
              }}
            >
              {t("create_account")}
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

MenuBar.propTypes = {
  handleDrawerToggle: PropTypes.func.isRequired,
};

export default MenuBar;
