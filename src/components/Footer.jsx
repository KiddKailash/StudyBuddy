import Box from "@mui/material/Box";

// ================================
// MUI Component Imports
// ================================
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import { useTheme } from "@mui/material/styles"; // Import useTheme to access theme transitions

/**
 * Footer component that displays copyright information.
 *
 * @return {JSX.Element} - The footer section with dynamic copyright details.
 */
const Footer = () => {
  const theme = useTheme(); // Access theme
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        borderTop: 1,
        marginTop: 5,
        borderColor: "grey.300",
        paddingTop: 3,
        backgroundColor: "background.default", // Use theme background color
        color: "text.secondary", // Use theme text color
        width: "100%", // Ensure the footer spans the entire viewport width
        position: "relative", // Optional: If the footer should be static
        left: 0,
        right: 0,
        transition: theme.transitions.backgroundAndText, // Centralized transition
      }}
    >
      <Grid
        container
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid size={8} sx={{ textAlign: "left" }}>
          <Typography variant="body2">
            Kailash Kidd, s4582256 | © All rights reserved.
          </Typography>
        </Grid>
        <Grid size={4} sx={{ textAlign: "right" }}>
          <Typography variant="body2">{currentYear} </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Footer;
