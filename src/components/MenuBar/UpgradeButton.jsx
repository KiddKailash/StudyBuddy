import React, { useContext } from "react";
import Button from "@mui/material/Button";
import { SnackbarContext } from "../../contexts/SnackbarContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

/**
 * UpgradeButton component handles the account upgrade functionality.
 *
 * @returns {JSX.Element} - The rendered UpgradeButton component.
 */
const UpgradeButton = () => {
  const { showSnackbar } = useContext(SnackbarContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleUpgrade = () => {
    navigate("/checkout");
  };

  return (
    <Button
      variant="contained"
      onClick={handleUpgrade}
      sx={{
        // Force the text onto a single line
        whiteSpace: "nowrap",
        textAlign: "left",
      }}
    >
      ⭐️ {t("upgrade_account")}
    </Button>
  );
};

export default UpgradeButton;
