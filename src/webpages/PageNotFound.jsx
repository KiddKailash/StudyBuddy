import React from "react";
import { useNavigate } from "react-router-dom";

// ================================
// MUI Component Imports
// ================================
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        textAlign: "center",
        padding: "20px",
      }}
    >
      <Typography variant="body1" color="error">
        404: Page Not Found
      </Typography>
      <Typography variant="body2" sx={{ marginTop: 2 }}>
        Sorry, the page you are looking for does not exist. Please check that
        you have the correct URL.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: 4 }}
        onClick={() => navigate("/")}
      >
        Go to Landing Page
      </Button>
    </Box>
  );
};

export default PageNotFound;
