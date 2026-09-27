import { describe, expect, it } from 'vitest';
import { formatLongDate, formatUsdCents } from './format.js';

describe('format', () => {
	it('shows an em dash for missing values', () => {
		expect(formatLongDate(null)).toBe('—');
		expect(formatUsdCents(undefined)).toBe('—');
	});

	it('formats dates and cents', () => {
		expect(formatLongDate('2026-03-12T10:00:00Z')).toMatch(/2026/);
		expect(formatUsdCents(4900)).toMatch(/49\.00/);
	});
});
