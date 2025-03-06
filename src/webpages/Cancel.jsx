import React from "react";
import { useNavigate } from "react-router-dom";

// MUI Component Imports
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

// Import the useTranslation hook
import { useTranslation } from "react-i18next";

const Cancel = () => {
  const navigate = useNavigate();

  // Initialize the translation function
  const { t } = useTranslation();

  return (
    <>
      <Box>
        <Typography variant="h4" gutterBottom>
          {t("payment_canceled")}
        </Typography>
        <Typography variant="body1">{t("payment_canceled_message")}</Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/create-resource")}
          >
            {t("go_to_home")}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Cancel;
