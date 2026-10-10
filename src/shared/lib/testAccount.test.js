import { afterEach, describe, expect, it } from 'vitest';
import { isTestAccount, testAccessEndsAt } from './testAccount.js';
import { setAuthResults } from './session.js';

const auth = (tenant) => ({
	jwt: { access_token: 't', expires_in: 1 },
	user: { id: 'u', email: 'e', firstName: 'f', lastName: 'l', tenantId: 'x', authorities: [], tenant },
});

describe('testAccount', () => {
	afterEach(() => localStorage.clear());

	it('reads a test account and its access end from the sign-in response', () => {
		setAuthResults(auth({ accountType: 'TESTER', accessExpiresAt: '2026-10-15T21:59:59Z' }));
		expect(isTestAccount()).toBe(true);
		expect(testAccessEndsAt()).toBe('2026-10-15T21:59:59Z');
	});

	it('is false for a customer', () => {
		setAuthResults(auth({ subscriptionInfo: {} }));
		expect(isTestAccount()).toBe(false);
		expect(testAccessEndsAt()).toBeNull();
	});
});
