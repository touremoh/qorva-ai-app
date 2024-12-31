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
import nlTranslation from './locales/nl/translation.json';

// Function to get the browser language and map it to available translations
const getBrowserLanguage = () => {
	const browserLang = navigator.language || navigator.languages[0];
	const supportedLanguages = ['en', 'fr', 'de', 'es', 'pt', 'it', 'nl'];

	// Extract primary language code (e.g., 'en' from 'en-US')
	const primaryLang = browserLang.split('-')[0];

	// Log the primary language of the user
	console.log('Primary language: ', primaryLang);

	// Return primary language if supported, else fallback to 'en'
	return supportedLanguages.includes(primaryLang) ? primaryLang : 'en';
};

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
			nl: { translation: nlTranslation },
		},
		lng: getBrowserLanguage(), // Set default language to the browser's language
		fallbackLng: 'en', // Fallback language if a translation is missing
		interpolation: {
			escapeValue: false, // React already escapes values
		},
	});

export default i18n;
