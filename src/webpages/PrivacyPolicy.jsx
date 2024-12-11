import React from "react";
import { useTranslation } from "react-i18next";
import { Container, Typography, Box } from "@mui/material";

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  // Return the sections as objects for iteration
  const sections = t("privacyPolicy.sections", { returnObjects: true });

  return (
    <Container maxWidth="md" sx={{ py: 4, textAlign: 'left' }}>
      <Typography variant="h4" gutterBottom>
        {t("privacyPolicy.title")}
      </Typography>
      <Typography variant="body2" gutterBottom>
        {t("privacyPolicy.effectiveDate")}
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

export default PrivacyPolicy;
