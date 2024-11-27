// src/components/MenuBar/AccountInfo.jsx
import React from "react";
import PropTypes from "prop-types";
import Typography from "@mui/material/Typography";
import { formatAccountType } from "./menubarUtils";

/**
 * AccountInfo component displays the user's account type.
 *
 * @param {object} props - Component props.
 * @param {string} props.accountType - The account type of the user.
 * @returns {JSX.Element|null} - The rendered AccountInfo component or null.
 */
const AccountInfo = ({ accountType }) => {
  if (!accountType) return null;

  const formattedAccountType = formatAccountType(accountType);

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
