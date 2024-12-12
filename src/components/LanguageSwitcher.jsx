import React from 'react';
import { useTranslation } from 'react-i18next';

// MUI Component Imports
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

/**
 * LanguageSwitcher component allows users to change the application's language.
 *
 * @returns {JSX.Element} The rendered LanguageSwitcher component.
 */
const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language || 'en';

  /**
   * Handles the language change event.
   *
   * @param {object} event - The change event from the Select component.
   */
  const handleLanguageChange = (event) => {
    const lang = event.target.value;
    i18n.changeLanguage(lang);
    // Save the selected language to localStorage for persistence
    localStorage.setItem('i18nextLng', lang);
  };

  return (
      <FormControl fullWidth variant="outlined">
        <InputLabel id="language-select-label">
          {t("language")}
        </InputLabel>
        <Select
          labelId="language-select-label"
          id="language-select"
          variant="outlined"
          fullWidth
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

export default LanguageSwitcher;
