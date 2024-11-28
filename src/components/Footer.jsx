import Box from "@mui/material/Box";

// MUI Component Imports
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles"; // Import useTheme to access theme transitions

// Import the useTranslation hook
import { useTranslation } from "react-i18next";

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
        marginTop: 3,
        marginBottom: 3,
        color: "text.secondary", // Use theme text color
      }}
    >
      <Typography variant="body2">
        {t("footer_notice")}
      </Typography>
    </Box>
  );
};

export default Footer;
