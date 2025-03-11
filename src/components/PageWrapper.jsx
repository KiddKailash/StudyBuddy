import React from "react";
import Box from "@mui/material/Box";
import PropTypes from "prop-types";

const PageWrapper = ({ children }) => (
  <Box maxWidth="md" sx={{ mx: "auto", p: 3.5, width: '100%', textAlign: "left" }}>
    {children}
  </Box>
);

PageWrapper.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PageWrapper;
