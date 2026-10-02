import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import te from './te.json';
import hi from './hi.json';
import ta from './ta.json';
import kn from './kn.json';
import ml from './ml.json';

const resources = {
  en: { translation: en },
  te: { translation: te },
  hi: { translation: hi },
  ta: { translation: ta },
  kn: { translation: kn },
  ml: { translation: ml }
};

const savedLanguage = localStorage.getItem('veltrix_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
