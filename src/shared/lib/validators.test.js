import { describe, expect, it } from 'vitest';
import { isStrongPassword, isValidEmail } from './validators.js';

describe('validators', () => {
	it('accepts normal addresses and rejects malformed ones', () => {
		expect(isValidEmail('ada@example.co.uk')).toBe(true);
		expect(isValidEmail(' ada@example.com ')).toBe(true);
		expect(isValidEmail('ada@example')).toBe(false);
		expect(isValidEmail('')).toBe(false);
	});

	it('requires the four character classes and 8–64 characters', () => {
		expect(isStrongPassword('Correct-Horse-9')).toBe(true);
		expect(isStrongPassword('correct-horse-9')).toBe(false);
		expect(isStrongPassword('Short-9')).toBe(false);
		expect(isStrongPassword(`Aa1!${'x'.repeat(61)}`)).toBe(false);
	});
});
