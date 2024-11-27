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
    red[500],
    pink[500],
    purple[500],
    deepPurple[500],
    indigo[500],
    blue[500],
    lightBlue[500],
    cyan[500],
    teal[500],
    green[500],
    lightGreen[500],
    lime[500],
    yellow[500],
    amber[500],
    orange[500],
    deepOrange[500],
    brown[500],
    grey[500],
    blueGrey[500],
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
  return `${accountType.charAt(0).toUpperCase() + accountType.slice(1)} User`;
};
