import { readFileSync } from 'node:fs';
import { API_BASE } from './constants.js';
import * as K from '../../src/constants.js';

// Real responses of tenant A's screens, exported by the backend suite
// (qorva-ai: AppFixtureExportIntegrationTest). Regenerate after an intended API change.
const FIXTURE = JSON.parse(readFileSync(new URL('../fixtures/api.json', import.meta.url), 'utf8'));

export const loginResponse = () => FIXTURE['POST /auth/login'].body;

const ok = (data) => ({ status: 200, body: { code: 200, data, timestamp: '2026-09-15T08:00:00Z' } });

// Calls the fixture cannot answer from a recorded response.
const SYNTHETIC = {
	'POST /auth/token/validate': () => ok(true),
	'POST /auth/token/refresh': () => FIXTURE['POST /auth/login'],
	'GET /mailbox-connections/me': () => ({ status: 204, body: null }),
	'GET /tenants/logo': () => ({ status: 404, body: null }),
};

/**
 * Serves every request to the fake API from the fixture. Unknown requests answer 404 and are
 * recorded in the returned list, so a test can assert that a screen needed nothing it doesn't have.
 */
export async function mockApi(page, overrides = {}) {
	const unknown = [];
	// Nothing outside the app and the fake API (analytics, fonts, CDNs): keeps runs deterministic.
	await page.route((url) => !url.href.startsWith(API_BASE) && !['localhost', '127.0.0.1'].includes(url.hostname),
		(route) => route.abort());
	await page.route(`${API_BASE}/**`, async (route) => {
		const request = route.request();
		const url = new URL(request.url());
		const key = `${request.method()} ${url.pathname}`;
		const entry = overrides[key]?.(request) ?? SYNTHETIC[key]?.(request) ?? FIXTURE[key];
		if (!entry) {
			unknown.push(key);
			return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ errorCode: 'error.http.not_found' }) });
		}
		return route.fulfill({
			status: entry.status,
			contentType: 'application/json',
			body: entry.body == null ? '' : JSON.stringify(entry.body),
		});
	});
	return unknown;
}

/** Puts the browser in the state a successful sign-in leaves it in, exactly as setAuthResults() writes it. */
export async function signIn(page) {
	const { jwt, user } = loginResponse().data;
	const subscriptionStatus = user.tenant?.subscriptionInfo?.subscriptionStatus ?? user.subscriptionStatus ?? '';
	const entries = {
		[K.QORVA_USER_LANGUAGE]: 'en',
		[K.AUTH_TOKEN]: jwt.access_token,
		[K.TOKEN_EXPIRY]: String(jwt.expires_in),
		[K.USER_ID]: user.id,
		[K.USER_EMAIL]: user.email,
		[K.USER_FIRST_NAME]: user.firstName,
		[K.USER_LAST_NAME]: user.lastName,
		[K.TENANT_ID]: user.tenantId,
		[K.SUBSCRIPTION_STATUS]: subscriptionStatus,
		[K.USER_ACCOUNT_STATUS]: user.userAccountStatus ?? '',
		[K.USER_AUTHORITIES]: JSON.stringify(user.authorities ?? []),
	};
	// Only on the first navigation of the test, so the app's own writes (logout, language) stick.
	await page.addInitScript((entries) => {
		if (sessionStorage.getItem('e2e:signed-in')) return;
		sessionStorage.setItem('e2e:signed-in', '1');
		Object.entries(entries).forEach(([key, value]) => localStorage.setItem(key, value));
	}, entries);
}

export const seededTenant = () => {
	const { user } = loginResponse().data;
	const cvIds = Object.keys(FIXTURE).filter((k) => /^GET \/cvs\/[0-9a-f]{24}$/.test(k)).map((k) => k.split('/').pop());
	return { user, cvIds };
};
