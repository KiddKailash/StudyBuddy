import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  // Enables loading translations via HTTP
  .use(HttpBackend)
  // Detects user language preferences
  .use(LanguageDetector)
  // Passes the i18n instance to react-i18next
  .use(initReactI18next)
  .init({
    // Fallback language in case the detected language is not available
    fallbackLng: 'en',
    // Supported languages in your application
    supportedLngs: ['en', 'zh', 'es'],
    // Allows using non-exact language codes (e.g., 'en-US' falls back to 'en')
    nonExplicitSupportedLngs: true,
    // Disables escaping since React handles it
    interpolation: {
      escapeValue: false,
    },
    // Configuration for language detection
    detection: {
      // Order of language detection methods
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      // Query parameter to look for language (e.g., ?lng=es)
      lookupQuerystring: 'lng',
      // Local storage key to store the selected language
      lookupLocalStorage: 'i18nextLng',
      // Cache the user language in local storage
      caches: ['localStorage'],
      // Languages to exclude from being cached
      excludeCacheFor: ['cimode'],
      // Reference to the HTML element for setting the lang attribute
      htmlTag: document.documentElement,
      // Only detect languages that are in the supportedLngs list
      checkSupportedLngs: true,
    },
    // Backend configuration for loading translation files
    backend: {
      // Path to load translation files from
      // Adjust the path based on where your locales are served
      loadPath: '/locales/{{lng}}/translation.json',
    },
    // React-specific options
    react: {
      // Enables React Suspense for handling loading states
      useSuspense: true,
    },
  });

// Update the HTML lang attribute whenever the language changes
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
