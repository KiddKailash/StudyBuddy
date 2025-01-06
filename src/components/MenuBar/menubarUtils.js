import i18next from "i18next";

import {
  red,
  pink,
  purple,
  deepPurple,
  indigo,
  blue,
  lightBlue,
  cyan,
  teal,
  green,
  lightGreen,
  lime,
  yellow,
  amber,
  orange,
  deepOrange,
  brown,
  grey,
  blueGrey,
} from "@mui/material/colors";

/**
 * Generates a consistent color based on the user's email.
 * @param {string} email - User's email address.
 * @param {object} theme - MUI theme object.
 * @returns {string} - The selected color.
 */
export const getAvatarColor = (email, theme) => {
  if (!email) return theme.palette.primary.main;

  const colorList = [
    red[450],
    pink[450],
    purple[450],
    deepPurple[450],
    indigo[450],
    blue[450],
    lightBlue[450],
    cyan[450],
    teal[450],
    green[450],
    lightGreen[450],
    lime[450],
    yellow[450],
    amber[450],
    orange[450],
    deepOrange[450],
    brown[450],
    grey[450],
    blueGrey[450],
  ];

  let hash = 0;
  for (let i = 0; i < email.length; i += 1) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colorList.length;
  return colorList[colorIndex];
};

/**
 * Extracts the user's initials for the Avatar.
 * @param {object} user - User object containing firstName and lastName.
 * @returns {string} - User initials.
 */
export const getUserInitials = (user) => {
  if (!user) return "";
  const firstInitial = user.firstName
    ? user.firstName.charAt(0).toUpperCase()
    : "";
  const lastInitial = user.lastName
    ? user.lastName.charAt(0).toUpperCase()
    : "";
  return `${firstInitial}${lastInitial}`;
};

/**
 * Formats the account type display string.
 * @param {string} accountType - The account type of the user.
 * @returns {string} - Formatted account type.
 */
export const formatAccountType = (accountType) => {
  if (!accountType) return "";
  const translatedAccountType = i18next.t(`account_type_${accountType.toLowerCase()}`);
  return i18next.t("account_type_user", { accountType: translatedAccountType });
};
