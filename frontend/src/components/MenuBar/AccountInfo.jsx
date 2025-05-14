import React from "react";
import PropTypes from "prop-types";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

/**
 * AccountInfo component displays the user's account type.
 *
 * @param {object} props - Component props.
 * @param {string} props.accountType - The account type of the user.
 * @returns {JSX.Element|null} - The rendered AccountInfo component or null.
 */
const AccountInfo = ({ accountType }) => {
  // Initialize the translation function
  const { t } = useTranslation();

  if (!accountType) return null;

  const translatedAccountType = t(`account_type_${accountType.toLowerCase()}`);
  const formattedAccountType = t("account_type_user", {
    accountType: translatedAccountType,
  });

  return (
    <Typography variant="body1" sx={{ ml: 2 }}>
      {formattedAccountType}
    </Typography>
  );
};

AccountInfo.propTypes = {
  accountType: PropTypes.string,
};

export default AccountInfo;
