import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'sa', 
    // This stops i18next from trying to load weird variations like 'en-US'
    supportedLngs: ['sa', 'en', 'hi', 'te', 'ta', 'mr', 'kn', 'ml', 'bn', 'gu', 'pa', 'ur'],
    
    // Set to false to remove all the long terminal logs
    debug: false, 

    detection: {
      // We removed 'navigator' (browser language). It will ONLY look at what the user explicitly clicked and saved.
      order: ['localStorage', 'cookie'],
      caches: ['localStorage', 'cookie'],
    },

    react: {
      useSuspense: false, 
    },

    interpolation: {
      escapeValue: false, 
    },
    
    backend: {
      loadPath: typeof window !== 'undefined' 
        ? '/locales/{{lng}}/{{ns}}.json' 
        : 'http://localhost:3000/locales/{{lng}}/{{ns}}.json',
    }
  });

export default i18n;