// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import enTranslation from './locales/en/translation.json';
import frTranslation from './locales/fr/translation.json';
import deTranslation from './locales/de/translation.json';
import esTranslation from './locales/es/translation.json';
import ptTranslation from './locales/pt/translation.json';
import itTranslation from './locales/it/translation.json';

i18n
	.use(initReactI18next)
	.init({
		resources: {
			en: { translation: enTranslation },
			fr: { translation: frTranslation },
			de: { translation: deTranslation },
			es: { translation: esTranslation },
			pt: { translation: ptTranslation },
			it: { translation: itTranslation },
		},
		lng: 'en', // default language
		fallbackLng: 'en', // fallback language if a translation is missing
		interpolation: {
			escapeValue: false, // React already escapes values
		},
	});

export default i18n;
