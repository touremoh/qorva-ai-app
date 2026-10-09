import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONSENT_ALL, CONSENT_ESSENTIAL, readConsent, readStoredConsent, writeConsent } from './consent.js';
import { isBannerPath } from '../shared/lib/cookieBanner.js';

const clearConsentCookie = () => { document.cookie = 'qorva_consent=; Path=/; Max-Age=0'; };

// tracking.js reads VITE_GTM_ID when it loads, so each test imports a fresh copy.
const loadTracking = async (gtmId) => {
	vi.resetModules();
	vi.stubEnv('VITE_GTM_ID', gtmId);
	return import('./tracking.js');
};

const events = () => window.dataLayer.filter((entry) => entry && !('length' in entry) && entry.event).map((entry) => entry.event);
const consentCommands = () => window.dataLayer.filter((entry) => entry && 'length' in entry && entry[0] === 'consent');

beforeEach(() => {
	delete window.dataLayer;
	document.head.querySelectorAll('script[src*="googletagmanager"]').forEach((node) => node.remove());
	clearConsentCookie();
	localStorage.clear();
});

afterEach(() => {
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
});

describe('tracking', () => {
	it('does nothing without a container id', async () => {
		const { initTracking, trackEvent, trackPageView } = await loadTracking('');
		initTracking();
		trackPageView('/register');
		trackEvent('sign_up');
		expect(window.dataLayer).toBeUndefined();
		expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull();
	});

	it('denies every storage type before GTM loads, and loads GTM once', async () => {
		const { initTracking } = await loadTracking('GTM-TEST');
		initTracking();
		initTracking();
		const [defaults] = consentCommands();
		expect(defaults[1]).toBe('default');
		expect(defaults[2]).toMatchObject({
			ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied',
		});
		expect(window.dataLayer.indexOf(defaults)).toBeLessThan(window.dataLayer.findIndex((e) => e.event === 'gtm.js'));
		expect(document.querySelectorAll('script[src*="googletagmanager.com/gtm.js?id=GTM-TEST"]')).toHaveLength(1);
	});

	it('applies a stored "all" choice before GTM loads', async () => {
		writeConsent(CONSENT_ALL);
		const { initTracking } = await loadTracking('GTM-TEST');
		initTracking();
		expect(consentCommands().map((c) => c[1])).toEqual(['default', 'update']);
		expect(consentCommands()[1][2].ad_storage).toBe('granted');
		expect(events()).toEqual(['qorva_consent', 'gtm.js']);
	});

	it('grants and withdraws consent on request', async () => {
		const { initTracking, grantConsent, denyConsent } = await loadTracking('GTM-TEST');
		initTracking();
		grantConsent();
		denyConsent();
		const updates = consentCommands().filter((c) => c[1] === 'update').map((c) => c[2].ad_storage);
		expect(updates).toEqual(['granted', 'denied']);
	});

	it('pushes events without touching vendors', async () => {
		const { initTracking, trackEvent } = await loadTracking('GTM-TEST');
		initTracking();
		trackEvent('sign_up', { method: 'email' });
		expect(window.dataLayer.at(-1)).toEqual({ event: 'sign_up', method: 'email' });
	});

	it.each([
		['/candidate-update/abc123', '/candidate-update/:token'],
		['/candidate-update/abc123/extra', '/candidate-update/:token/extra'],
		['/register', '/register'],
		['/app/dashboard', '/app/dashboard'],
	])('reports %s as %s', async (pathname, expected) => {
		const { initTracking, trackPageView, safePagePath } = await loadTracking('GTM-TEST');
		expect(safePagePath(pathname)).toBe(expected);
		initTracking();
		trackPageView(pathname);
		const view = window.dataLayer.at(-1);
		expect(view.event).toBe('page_view');
		expect(view.page_path).toBe(expected);
		expect(view.page_location).toBe(`${window.location.origin}${expected}`);
	});
});

describe('consent', () => {
	it('is null until the visitor chooses', () => {
		expect(readStoredConsent()).toBeNull();
		expect(readConsent()).toBeNull();
	});

	it('remembers the choice in a cookie', () => {
		writeConsent(CONSENT_ESSENTIAL);
		expect(document.cookie).toContain('qorva_consent=essential');
		expect(readConsent()).toBe(CONSENT_ESSENTIAL);
		writeConsent('nonsense');
		expect(readConsent()).toBe(CONSENT_ESSENTIAL);
	});

	it('moves the landing page localStorage choice into the cookie', () => {
		localStorage.setItem('qorva_cookie_consent', 'all');
		expect(readStoredConsent()).toBe(CONSENT_ALL);
		expect(localStorage.getItem('qorva_cookie_consent')).toBeNull();
		expect(document.cookie).toContain('qorva_consent=all');
	});

	it('treats Global Privacy Control as "essential" until the visitor accepts', () => {
		vi.stubGlobal('navigator', { ...navigator, globalPrivacyControl: true });
		expect(readStoredConsent()).toBeNull();
		expect(readConsent()).toBe(CONSENT_ESSENTIAL);
		writeConsent(CONSENT_ALL);
		expect(readConsent()).toBe(CONSENT_ALL);
	});
});

describe('isBannerPath', () => {
	it.each(['/login', '/register', '/success', '/billing/success', '/billing/cancel'])('shows on %s', (path) => {
		expect(isBannerPath(path)).toBe(true);
	});

	it.each(['/', '/app/dashboard', '/candidate-update/abc', '/set-password', '/registered'])('hides on %s', (path) => {
		expect(isBannerPath(path)).toBe(false);
	});
});
