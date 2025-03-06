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
      red[400],
      pink[400],
      purple[400],
      deepPurple[400],
      indigo[400],
      blue[400],
      lightBlue[400],
      cyan[400],
      teal[400],
      green[400],
      lightGreen[400],
      lime[400],
      yellow[400],
      amber[400],
      orange[400],
      deepOrange[400],
      brown[400],
      grey[400],
      blueGrey[400],
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