import React from "react";
import { useTranslation } from "react-i18next";
import { Container, Typography, Box } from "@mui/material";

const TermsOfService = () => {
  const { t } = useTranslation();

  // Return the sections as objects for iteration
  const sections = t("termsOfService.sections", { returnObjects: true });

  return (
    <Container maxWidth="md" sx={{ py: 4, textAlign: 'left'}}>
      <Typography variant="h4" gutterBottom>
        {t("termsOfService.title")}
      </Typography>
      <Typography variant="body2" gutterBottom>
        {t("termsOfService.effectiveDate")}
      </Typography>

      <Box sx={{ mt: 2 }}>
        {sections.map((section, index) => (
          <React.Fragment key={index}>
            <Typography variant="h6">{section.title}</Typography>
            <Typography variant="body2" gutterBottom>
              {section.body}
            </Typography>
          </React.Fragment>
        ))}
      </Box>
    </Container>
  );
};

export default TermsOfService;
