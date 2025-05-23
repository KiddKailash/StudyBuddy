import React from "react";
import { useNavigate } from "react-router-dom";

// Contexts
import { useTranslation } from "react-i18next";

// Local Imports
import PageWrapper from "../components/PageWrapper";

// MUI 
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const PageNotFound = () => {
  const navigate = useNavigate();

  // Initialize the translation function
  const { t } = useTranslation();

  return (
    <PageWrapper>
      <Typography variant="body1" color="error">
        {t("404_page_not_found")}
      </Typography>
      <Typography variant="body2" sx={{ marginTop: 2 }}>
        {t("page_not_found_message")}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: 4 }}
        onClick={() => navigate("/create")}
      >
        {t("go_to_landing_page")}
      </Button>
    </PageWrapper>
  );
};

export default PageNotFound;
