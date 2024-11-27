import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import translationEN from './locales/en/translation.json';
import translationZH from './locales/zh/translation.json';
import translationES from './locales/es/translation.json';

const resources = {
  en: { translation: translationEN },
  zh: { translation: translationZH },
  es: { translation: translationES },
};

i18n
  .use(initReactI18next) // Integrates i18n with React
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en', // Fallback language if the selected language is not available
    interpolation: {
      escapeValue: false, // React already handles escaping
    },
  });

export default i18n;
