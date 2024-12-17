import React, { useContext } from "react";
import Button from "@mui/material/Button";
import { SnackbarContext } from "../../contexts/SnackbarContext";
import { redirectToStripeCheckout } from "../../utils/redirectToStripeCheckout";

// Import the useTranslation hook
import { useTranslation } from "react-i18next";

/**
 * UpgradeButton component handles the account upgrade functionality.
 *
 * @returns {JSX.Element} - The rendered UpgradeButton component.
 */
const UpgradeButton = () => {
  const { showSnackbar } = useContext(SnackbarContext);

  // Initialize the translation function
  const { t } = useTranslation();

  /**
   * Initiates the account upgrade process.
   */
  const handleUpgrade = () => {
    redirectToStripeCheckout("paid", showSnackbar);
  };

  return (
    <Button variant="contained" onClick={handleUpgrade}>
     ⭐️ {t("upgrade_account")}
    </Button>
  );
};

export default UpgradeButton;
