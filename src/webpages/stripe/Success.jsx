import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// MUI Component Imports
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

// Import the useTranslation hook
import { useTranslation } from "react-i18next";

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <Box>
        <Typography variant="h4" gutterBottom>
          {t("thank_you_for_purchase")}
        </Typography>
        <Typography variant="body1">
          {t("subscription_upgraded_successfully")}
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/create")}
          >
            {t("go_to_dashboard")}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Success;
