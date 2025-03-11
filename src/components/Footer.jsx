// Import the useTranslation hook
import { useTranslation } from "react-i18next";

// MUI Component Imports
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles"; // Import useTheme to access theme transitions

/**
 * Footer component that displays a notice.
 *
 * @return {JSX.Element} - The footer section with dynamic notice.
 */
const Footer = () => {
  const theme = useTheme(); // Access theme

  // Initialize the translation function
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        py: 4,
        width: "100%",
        textAlign: "center",
      }}
    >
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t("footer_notice")}
      </Typography>
    </Box>
  );
};

export default Footer;
