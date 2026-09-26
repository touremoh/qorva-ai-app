import { afterEach, describe, expect, it } from 'vitest';
import { AUTH_TOKEN, TOKEN_EXPIRY, USER_AUTHORITIES, USER_EMAIL } from '../../constants.js';
import { hasPermission, storeAccessToken } from './session.js';

describe('session', () => {
	afterEach(() => localStorage.clear());

	it('replaces only the token, keeping the rest of the session', () => {
		localStorage.setItem(USER_EMAIL, 'ada@a.qorva.test');
		storeAccessToken({ access_token: 'fresh', expires_in: 123 });
		expect(localStorage.getItem(AUTH_TOKEN)).toBe('fresh');
		expect(localStorage.getItem(TOKEN_EXPIRY)).toBe('123');
		expect(localStorage.getItem(USER_EMAIL)).toBe('ada@a.qorva.test');
		storeAccessToken(undefined);
		expect(localStorage.getItem(AUTH_TOKEN)).toBe('fresh');
	});

	it('allows an action only when the authorities say ALLOWED', () => {
		localStorage.setItem(USER_AUTHORITIES, JSON.stringify([
			{ action: 'MANAGE_USERS', permission: 'ALLOWED' },
			{ action: 'DELETE_CV', permission: 'DENIED' },
		]));
		expect(hasPermission('MANAGE_USERS')).toBe(true);
		expect(hasPermission('DELETE_CV')).toBe(false);
		expect(hasPermission('VIEW_JOB')).toBe(false);
		localStorage.setItem(USER_AUTHORITIES, '{broken');
		expect(hasPermission('MANAGE_USERS')).toBe(false);
	});
});
