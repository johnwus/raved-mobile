import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import translation files
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import tw from '../locales/tw.json';
import ha from '../locales/ha.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  tw: { translation: tw },
  ha: { translation: ha },
};

i18n
  .use(initReactI18next)
  .init({
    lng: (Localization.getLocales()[0]?.languageCode || 'en').split('-')[0], // Get language code from device locale
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    compatibilityJSON: 'v4', // For expo compatibility
  });

export default i18n;