import React, { useContext } from "react";
import PropTypes from "prop-types";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const theme = useTheme();
  const { t } = useTranslation();

  const isCheckoutPage = location.pathname.startsWith("/checkout");

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
          {user && user.accountType !== "paid" && !isCheckoutPage && (
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
          {user && user.accountType !== "paid" && !isCheckoutPage && (
            <UpgradeButton />
          )}
        </Stack>

        {/* RIGHT SIDE */}
        <Box
          sx={{
            position: "relative",
          }}
        >
          {user ? (
            <AvatarMenu user={user} onLogout={handleLogout} />
          ) : (
            <Stack direction="row" spacing={2}>
              <Button
                variant="text"
                component={Link}
                to="/login?mode=login"
                sx={{}}
              >
                {t("sign_in")}
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/login?mode=create"
                sx={{}}
              >
                {t("create_account")}
              </Button>
            </Stack>
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
