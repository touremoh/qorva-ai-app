import { CONSENT_ALL, CONSENT_ESSENTIAL, readConsent } from './consent.js';

/**
 * Google Tag Manager, loaded behind Google Consent Mode v2.
 *
 * Nothing loads without VITE_GTM_ID (local runs, previews, tst). Every storage type starts
 * denied; GTM only gets the visitor's grant after they accept. Vendor tags (GA4, Google Ads,
 * Meta) live in the GTM container and react to the dataLayer events pushed here; this file
 * never talks to a vendor directly. qorva-ai-lp keeps a copy (src/utils/tracking.js); the app
 * adds safePagePath() so tokens in URLs never reach a vendor.
 */
const containerId = import.meta.env.VITE_GTM_ID;
let enabled = false;

const GRANTED = {
	ad_storage: 'granted',
	ad_user_data: 'granted',
	ad_personalization: 'granted',
	analytics_storage: 'granted',
};

const DENIED = {
	ad_storage: 'denied',
	ad_user_data: 'denied',
	ad_personalization: 'denied',
	analytics_storage: 'denied',
};

// gtag() must push the arguments object itself: GTM's consent API ignores plain arrays.
function gtag() {
	window.dataLayer.push(arguments);
}

const pushConsentEvent = (value) => window.dataLayer.push({ event: 'qorva_consent', consent: value });

export const initTracking = () => {
	if (!containerId || enabled) return;
	window.dataLayer = window.dataLayer || [];

	gtag('consent', 'default', { ...DENIED, wait_for_update: 500 });
	gtag('set', 'ads_data_redaction', true);

	const consent = readConsent();
	if (consent === CONSENT_ALL) gtag('consent', 'update', GRANTED);
	if (consent) pushConsentEvent(consent);

	window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
	const script = document.createElement('script');
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
	document.head.appendChild(script);
	enabled = true;
};

export const grantConsent = () => {
	if (!enabled) return;
	gtag('consent', 'update', GRANTED);
	pushConsentEvent(CONSENT_ALL);
};

export const denyConsent = () => {
	if (!enabled) return;
	gtag('consent', 'update', DENIED);
	pushConsentEvent(CONSENT_ESSENTIAL);
};

// Routes that carry a secret in the path. Query strings are never reported at all, since
// /set-password, /reset-password and the Microsoft sign-in return (?sso=) carry one-time codes there.
const TOKEN_PATHS = [/^\/candidate-update\/[^/]+/];

/** The path as reported to GTM: no query string, and tokens replaced by a placeholder. */
export const safePagePath = (pathname) => {
	for (const pattern of TOKEN_PATHS) {
		if (pattern.test(pathname)) return pathname.replace(pattern, '/candidate-update/:token');
	}
	return pathname;
};

/** Virtual page view; GTM listens to this event instead of its History Change trigger. */
export const trackPageView = (pathname) => {
	if (!enabled) return;
	const path = safePagePath(pathname);
	window.dataLayer.push({
		event: 'page_view',
		page_path: path,
		page_location: `${window.location.origin}${path}`,
		page_title: document.title,
	});
};

/** A conversion or interaction event. Never put personal data in params. */
export const trackEvent = (name, params = {}) => {
	if (!enabled) return;
	window.dataLayer.push({ event: name, ...params });
};
