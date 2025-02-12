import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import zhFlag from '../assets/flags/zh.png';
import deFlag from '../assets/flags/de.png';
import enFlag from '../assets/flags/en.png';
import esFlag from '../assets/flags/es.png';
import frFlag from '../assets/flags/fr.png';
import hiFlag from '../assets/flags/hi.png';
import jaFlag from '../assets/flags/ja.png';

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
        <MenuItem value="de">Deutsch</MenuItem>
        <MenuItem value="hi">हिन्दी</MenuItem>
        <MenuItem value="fr">Français</MenuItem>
        <MenuItem value="ja">日本語</MenuItem>
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

  const flags = {
    en: enFlag,
    zh: zhFlag,
    de: deFlag,
    es: esFlag,
    fr: frFlag,
    hi: hiFlag,
    ja: jaFlag
  }

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
            <img
              src={flags[selectedLang]}
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
        <MenuItem value="de">Deutsch</MenuItem>
        <MenuItem value="hi">हिन्दी</MenuItem>
        <MenuItem value="fr">Français</MenuItem>
        <MenuItem value="ja">日本語</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcherText;
