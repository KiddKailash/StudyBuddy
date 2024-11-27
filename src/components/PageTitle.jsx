import PropTypes from "prop-types";
import React from "react";

// MUI Component Imports
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";

// Import the useTranslation hook
import { useTranslation } from "react-i18next";

/**
 * PageTitle component renders a page title with an optional subtitle.
 *
 * @param {Object} props - The component props.
 * @param {string} props.titleKey - The translation key for the main title text to display (required).
 * @param {string} [props.subtitleKey] - Optional translation key for subtitle text to display under the title.
 *
 * @returns {JSX.Element} The rendered component with title and optional subtitle.
 */
const PageTitle = ({ titleKey, subtitleKey = null }) => {
  // Initialize the translation function
  const { t } = useTranslation();

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
        <Typography variant="h2" gutterBottom sx={{ fontSize: 50 }}>
          {t(titleKey)}
        </Typography>

        {/* Conditionally render the subtitle if it's provided */}
        {subtitleKey && (
          <Typography variant="h5" gutterBottom>
            {t(subtitleKey)}
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
  titleKey: PropTypes.string.isRequired,
  subtitleKey: PropTypes.string,
};

export default PageTitle;
