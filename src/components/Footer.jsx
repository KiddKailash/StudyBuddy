import Box from "@mui/material/Box";

// MUI Component Imports
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles"; // Import useTheme to access theme transitions

/**
 * Footer component that displays copyright information.
 *
 * @return {JSX.Element} - The footer section with dynamic copyright details.
 */
const Footer = () => {
  const theme = useTheme(); // Access theme

  return (
    <Box
      sx={{
        marginTop: 3,
        marginBottom: 3,
        color: "text.secondary", // Use theme text color
      }}
    >
      <Typography variant="body2">ClipCard may make typing errors. Check important information.</Typography>
    </Box>
  );
};

export default Footer;
