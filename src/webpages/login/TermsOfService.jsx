import React from "react";
import { useTranslation } from "react-i18next";
import PageWrapper from "../../components/PageWrapper";

// MUI
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const TermsOfService = () => {
  const { t } = useTranslation();
  const sections = t("termsOfService.sections", { returnObjects: true });

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>
        {t("termsOfService.title")}
      </Typography>
      <Typography variant="body2" gutterBottom>
        {t("termsOfService.effectiveDate")}
      </Typography>

      {/* Scrollable container */}
      <Box
        sx={{
          mt: 2,
          maxHeight: "75vh", // Adjust this height as needed
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: 1,
          p: 2,
        }}
      >
        {sections.map((section, index) => (
          <React.Fragment key={index}>
            <Typography variant="h6">{section.title}</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {section.body}
            </Typography>
          </React.Fragment>
        ))}
      </Box>
    </PageWrapper>
  );
};

export default TermsOfService;
