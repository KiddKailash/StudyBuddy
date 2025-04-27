import { createTheme } from "@mui/material/styles";

export const getTheme = (mode = "light") => {
  const basePalette = {
    primary: {
      main: "#0A3F44",
      dark: "#062f2f", // Even deeper teal-black tone
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#F59E0B", // Warm amber
      dark: "#D97706", // Dark amber
      light: "#FBBF24", // Light amber
      contrastText: "#1E3A8A",
    },
  };

  const themeOptions = {
    palette: {
      mode,
      ...basePalette,
      background:
        mode === "light"
          ? {
              paper: "#f4f7f8", // clean white surface
              default: "#ffffff", // soft neutral grey
            }
          : {
              paper: "#020617", // Deep blue-black
              default: "#0F172A", // Near black
            },
      text:
        mode === "light"
          ? {
              primary: "#1E293B", // Slate
              secondary: "#64748B", // Slate gray
              disabled: "#94A3B8", // Light slate
            }
          : {
              primary: "#F1F5F9", // Light slate
              secondary: "#CBD5E1", // Medium slate
              disabled: "#64748B", // Slate gray
            },
    },
    typography: {
      h1: {

      },
      h2: {

      },
      h3: {

      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      border: 3,
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor:
              mode === "light" ? basePalette.primary.main : "#0F172A",
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};
