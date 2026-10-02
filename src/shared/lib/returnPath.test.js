import { describe, expect, it } from 'vitest';
import { loginPath, safeReturnPath } from './returnPath.js';

describe('safeReturnPath', () => {
	it('accepts app pages with their filters', () => {
		expect(safeReturnPath('/app/copilot?tab=activity&status=AWAITING_APPROVAL')).toBe('/app/copilot?tab=activity&status=AWAITING_APPROVAL');
		expect(safeReturnPath('/app')).toBe('/app');
	});

	it('refuses anything that could leave the app', () => {
		for (const raw of ['//evil.test', '/app//evil.test', 'https://evil.test/app/x', '/login', '/\\evil.test', '/app/\\evil',
			'javascript:alert(1)', '/application', '', null, undefined, `/app/${'x'.repeat(2001)}`, '/app/x\nSet-Cookie']) {
			expect(safeReturnPath(raw)).toBeNull();
		}
	});
});

describe('loginPath', () => {
	it('carries the page to come back to', () => {
		expect(loginPath({ expired: true, from: '/app/copilot?tab=activity' }))
			.toBe('/login?expired=1&next=%2Fapp%2Fcopilot%3Ftab%3Dactivity');
	});

	it('drops a page outside the app', () => {
		expect(loginPath({ from: '//evil.test' })).toBe('/login');
		expect(loginPath({ expired: true })).toBe('/login?expired=1');
	});
});
