import PropTypes from "prop-types";
import React from "react";

// MUI Component Imports
import Typography from "@mui/material/Typography";

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
const PageTitle = ({ titleKey }) => {
  // Initialize the translation function
  const { t } = useTranslation();

  return (
    <>
      {/* Render the main title */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        {t(titleKey)}
      </Typography>
    </>
  );
};

// Props validation for the component using PropTypes
PageTitle.propTypes = {
  titleKey: PropTypes.string.isRequired,
  subtitleKey: PropTypes.string,
};

export default PageTitle;
