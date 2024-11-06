import PropTypes from "prop-types";

// ================================
// MUI Component Imports
// ================================
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";

/**
 * PageTitle component renders a page title with an optional subtitle.
 *
 * @param {Object} props - The component props.
 * @param {string} props.title - The main title text to display (required).
 * @param {string} [props.subtitle] - Optional subtitle text to display under the title.
 *
 * @returns {JSX.Element} The rendered component with title and optional subtitle.
 */
const PageTitle = ({ title, subtitle = null }) => {
  return (
    <>
      <Grid
        size={12}
        sx={{
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Render the main title */}
        <Typography variant="h2" gutterBottom sx={{fontSize: 50}}>
          {title}
        </Typography>

        {/* Conditionally render the subtitle if it's provided */}
        {subtitle && (
          <Typography variant="h5" gutterBottom>
            {subtitle}
          </Typography>
        )}

        {/* Divider between the title section and the rest of the content */}
        <Divider sx={{ mb: 2 }} />
      </Grid>
    </>
  );
};

// Props validation for the component using PropTypes
PageTitle.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};

export default PageTitle;
