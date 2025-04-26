import { createTheme } from "@mui/material/styles";

export const getTheme = (mode = "light") => {
  const basePalette = {
    primary: {
      main: "#0A3F44", // Do not change
      dark: "#062f2f", // Even deeper teal-black tone
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#9AC02C", // Light green
      dark: "#78ba00", // Rich grassy green
      light: "#c6df8c", // Pale lime
      contrastText: "#0A3F44",
    },
  };

  const themeOptions = {
    palette: {
      mode,
      ...basePalette,
      background: mode === "light"
        ? {
            paper: "#f4f7f8", // clean white surface
            default: "#ffffff", // soft neutral grey
          }
        : {
            paper: "#1c262b",
            default: "#12191d",
          },
      text: mode === "light"
        ? {
            primary: "#212529",
            secondary: "#585e62",
            disabled: "#A0AEB3",
          }
        : {
            primary: "#EFF2F4",
            secondary: "#B0BEC5",
            disabled: "#718792",
          },
    },
    typography: {
      h4: {
        fontWeight: 600,
      },
    },
    shape: {
      border: 3,
    },
  };

  return createTheme(themeOptions);
};
