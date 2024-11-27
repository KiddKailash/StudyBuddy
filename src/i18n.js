import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import language detection plugin
import LanguageDetector from 'i18next-browser-languagedetector';

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
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Use English if detected language is not available
    supportedLngs: ['en', 'zh', 'es'],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false, // React already handles escaping
    },
    detection: {
      // Order and from where user language should be detected
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],

      // Keys or params to lookup language from
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'i18nextLng',

      // Cache user language on
      caches: ['localStorage'],
      excludeCacheFor: ['cimode'], // Languages to not persist

      // Optional htmlTag with lang attribute
      htmlTag: document.documentElement,

      // Only detect languages that are in the supportedLngs
      checkSupportedLngs: true,
    },
  });

// Update the HTML lang attribute when language changes
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
