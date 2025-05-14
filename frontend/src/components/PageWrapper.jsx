import React from "react";
import PropTypes from "prop-types";

// MUI
import Box from "@mui/material/Box";

const PageWrapper = ({ width = "md", children }) => (
  <Box maxWidth={width} sx={{ mx: "auto", p: 3.5, width: '100%', textAlign: "left" }}>
    {children}
  </Box>
);

PageWrapper.propTypes = {
  width: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default PageWrapper;
