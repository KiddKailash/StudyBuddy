import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// MUI Component Imports
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";

/**
 * Text-based Language Switcher
 * (Optional: If you only want the flag-based version, you can remove this.)
 */
const LanguageSwitcherText = () => {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const handleLanguageChange = (event) => {
    const lang = event.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
    setCurrentLanguage(lang);
  };

  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel id="language-select-label">{t("language")}</InputLabel>
      <Select
        labelId="language-select-label"
        id="language-select"
        variant="outlined"
        value={currentLanguage}
        onChange={handleLanguageChange}
        label={t("language")}
      >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="zh">中文</MenuItem>
        <MenuItem value="es">Español</MenuItem>
      </Select>
    </FormControl>
  );
};

/**
 * Flag-based Language Switcher
 * Displays only the selected flag in the Select field,
 * and text labels in the dropdown list.
 */
export const LanguageSwitcherIMG = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const handleLanguageChange = (event) => {
    const lang = event.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
    setCurrentLanguage(lang);
  };

  return (
    <FormControl variant="standard">
      <Select
        value={currentLanguage}
        onChange={handleLanguageChange}
        disableUnderline
        renderValue={(selectedLang) => (
          <Box display="flex" alignItems="center">
            {console.log("Selected Language is ", selectedLang)}
            <img
              src={`/assets/flags/${selectedLang}.png`}
              alt={selectedLang}
              style={{ width: 32, height: 32 }}
            />
          </Box>
        )}
      >
        {/* If you want flags next to the text here, feel free to add <img> tags in each MenuItem. */}
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="zh">中文</MenuItem>
        <MenuItem value="es">Español</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcherText;
