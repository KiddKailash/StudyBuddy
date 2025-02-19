import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  // 1) Allows loading translations via HTTP.
  //    This is useful if you keep your translations in separate JSON files
  //    and want to dynamically load them from a server or a public folder.
  .use(HttpBackend)

  // 2) Detects user language by checking querystring, localStorage, or browser settings.
  //    The language detector makes the site dynamic for users in various locales.
  .use(LanguageDetector)

  // 3) Passes the i18n instance to react-i18next to enable the useTranslation hook,
  //    translation HOCs, and other React-specific helpers.
  .use(initReactI18next)

  // 4) Initializes the i18n configuration.
  .init({
    // 4A) This language is used if no user language is detected,
    //     or if the detected language is not in supportedLngs.
    fallbackLng: 'en',

    // 4B) The list of languages your application supports.
    //     The LanguageDetector will check against this array.
    supportedLngs: ['en', 'zh', 'es', 'de', 'hi', 'fr', 'ja', 'ko', 'po'],

    // 4C) If a user’s browser is 'en-US', for instance,
    //     this option allows fallback to 'en' automatically.
    nonExplicitSupportedLngs: true,

    // 4D) For React apps, it's best to disable escaping by default,
    //     since React handles XSS protection internally by design.
    interpolation: {
      escapeValue: false,
    },

    // 4E) Language detection configuration.
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],

      // The query parameter to look for (e.g., ?lng=es).
      lookupQuerystring: 'lng',

      // The localStorage key to store user language.
      lookupLocalStorage: 'i18nextLng',

      // Stores user language in localStorage so the preference is remembered.
      caches: ['localStorage'],

      // Exclude certain languages from being cached (e.g., for debugging).
      excludeCacheFor: ['cimode'],

      // The HTML element where i18n might set the 'lang' attribute.
      htmlTag: document.documentElement,

      // Only allow languages from the supportedLngs array above.
      checkSupportedLngs: true,
    },

    // 4F) The backend configuration for where to fetch translation files.
    //     The '{{lng}}' placeholder is replaced by the detected language.
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },

    // 4G) React-specific options.
    react: {
      // Use React Suspense to show fallback while translations load.
      useSuspense: true,
    },

    // OPTIONAL: You can enable debug in development mode only:
    // debug: process.env.NODE_ENV === 'development',
  });

// 5) Whenever the user language changes, we also update <html lang="...">.
//    This helps screen readers and accessibility tools.
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
