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
            backgroundColor:
              mode === "light" ? basePalette.primary.main : "#0F172A",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          root: {
            "& .MuiBackdrop-root": {
              backgroundColor:
                mode === "dark" ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.5)",
            },
          },
          paper: {
            borderRadius: "24px",
            padding: "15px",
            boxShadow:
              mode === "dark"
                ? "0 24px 38px 3px rgba(0, 0, 0, 0.8), 0 9px 46px 8px rgba(0, 0, 0, 0.6), 0 11px 15px -7px rgba(0, 0, 0, 0.4)"
                : "0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12), 0 11px 15px -7px rgba(0, 0, 0, 0.2)",
            backgroundImage: "none",
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontSize: "1.5rem",
            fontWeight: 600,
            padding: "24px 24px 10px 24px",
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: "8px 24px 20px 24px",
            "&.MuiDialogContent-dividers": {
              borderTop: `1px solid ${
                mode === "dark"
                  ? "rgba(255, 255, 255, 0.12)"
                  : "rgba(0, 0, 0, 0.12)"
              }`,
              borderBottom: `1px solid ${
                mode === "dark"
                  ? "rgba(255, 255, 255, 0.12)"
                  : "rgba(0, 0, 0, 0.12)"
              }`,
            },
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: "0px 24px 24px 24px",
            gap: "6px",
            justifyContent: "space-between",
            "& .MuiButton-root": {
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
            },
          },
        },
      },
      Paper: {
        styleOverrides: {
          root: {
            boxShadow: "0px",
          },
        },
      },
    },
  });
};
