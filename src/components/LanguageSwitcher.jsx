import React from 'react';
import { useTranslation } from 'react-i18next';

// MUI Component Imports
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import LanguageIcon from '@mui/icons-material/Language';

/**
 * LanguageSwitcher component allows users to change the application's language.
 *
 * @returns {JSX.Element} The rendered LanguageSwitcher component.
 */
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
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
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth variant="outlined" size="small">
        <InputLabel id="language-select-label">
          <LanguageIcon sx={{ mr: 1 }} />
          Language
        </InputLabel>
        <Select
          labelId="language-select-label"
          id="language-select"
          value={currentLanguage}
          onChange={handleLanguageChange}
          label="Language"
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="zh">中文</MenuItem>
          <MenuItem value="es">Español</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSwitcher;
