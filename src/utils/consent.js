/**
 * The visitor's cookie choice, shared by qorva.ai and app.qorva.ai.
 *
 * Stored in a cookie on the parent domain so a choice made on one site is not asked again on
 * the other. qorva-ai-lp keeps a copy of this module (src/utils/consent.js); keep the two in step.
 *
 * Values: 'all' (analytics + advertising) or 'essential'. null means the visitor has not chosen.
 */
export const CONSENT_ALL = 'all';
export const CONSENT_ESSENTIAL = 'essential';

const COOKIE_NAME = 'qorva_consent';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
// Before the cookie existed, the landing page kept the choice in localStorage.
const LEGACY_STORAGE_KEY = 'qorva_cookie_consent';

const isValid = (value) => value === CONSENT_ALL || value === CONSENT_ESSENTIAL;

// Only share the cookie across subdomains on the real domain; localhost and Amplify preview
// hosts get a host-only cookie.
const cookieDomain = () => {
	const host = window.location.hostname;
	return host === 'qorva.ai' || host.endsWith('.qorva.ai') ? '; Domain=.qorva.ai' : '';
};

const readCookie = () => {
	const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
	return match ? decodeURIComponent(match[1]) : null;
};

export const writeConsent = (value) => {
	if (!isValid(value)) return;
	const secure = window.location.protocol === 'https:' ? '; Secure' : '';
	document.cookie = `${COOKIE_NAME}=${value}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${cookieDomain()}${secure}`;
};

const readLegacy = () => {
	try {
		const value = localStorage.getItem(LEGACY_STORAGE_KEY);
		if (!isValid(value)) return null;
		writeConsent(value);
		localStorage.removeItem(LEGACY_STORAGE_KEY);
		return value;
	} catch {
		return null;
	}
};

/** The stored choice, or null when the visitor has not chosen (the banner should show). */
export const readStoredConsent = () => {
	const value = readCookie();
	return isValid(value) ? value : readLegacy();
};

/**
 * The choice to apply. A browser sending Global Privacy Control counts as "essential" until the
 * visitor explicitly accepts; the privacy policy promises this.
 */
export const readConsent = () => {
	const stored = readStoredConsent();
	if (stored) return stored;
	return navigator.globalPrivacyControl === true ? CONSENT_ESSENTIAL : null;
};
