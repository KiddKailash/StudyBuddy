import React from "react";
import { Container, Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const sections = t("privacyPolicy.sections", { returnObjects: true });

  return (
    <Container maxWidth="md" sx={{ py: 4, textAlign: "left" }}>
      <Typography variant="h4" gutterBottom>
        {t("privacyPolicy.title")}
      </Typography>
      <Typography variant="body2" gutterBottom>
        {t("privacyPolicy.effectiveDate")}
      </Typography>

      {/* Scrollable container */}
      <Box
        sx={{
          mt: 2,
          maxHeight: "75vh", // Adjust this height as needed
          overflowY: "auto",
          border: "1px solid #ccc",
          borderRadius: 2,
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
    </Container>
  );
};

export default PrivacyPolicy;
