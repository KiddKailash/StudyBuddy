import { createTheme } from "@mui/material/styles";

// Base color palette that doesn't change with theme mode
const basePalette = {
  primary: {
    main: "#0A3F44",
    dark: "#062f2f",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#F59E0B",
    dark: "#D97706",
    light: "#FBBF24",
    contrastText: "#1E3A8A",
  },
};

// Theme-specific colors
const lightColors = {
  background: {
    paper: "#f4f7f8",
    default: "#ffffff",
  },
  text: {
    primary: "#1E293B",
    secondary: "#64748B",
    disabled: "#94A3B8",
  },
};

const darkColors = {
  background: {
    paper: "#020617",
    default: "#0F172A",
  },
  text: {
    primary: "#F1F5F9",
    secondary: "#CBD5E1",
    disabled: "#64748B",
  },
};

export const getTheme = (mode = "light") => {
  const colors = mode === "light" ? lightColors : darkColors;

  return createTheme({
    palette: {
      mode,
      ...basePalette,
      ...colors,
    },
    typography: {
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: {
      borderRadius: 3,
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "light" ? basePalette.primary.main : "#0F172A",
          },
        },
      },
    },
  });
}; 