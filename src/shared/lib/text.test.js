import { describe, expect, it } from 'vitest';
import { getInitials, toLabel } from './text.js';

describe('getInitials', () => {
	it('takes the first letter of the first two words', () => {
		expect(getInitials('Oliver Whitfield')).toBe('OW');
		expect(getInitials('mary ann smith')).toBe('MA');
		expect(getInitials('Cher')).toBe('C');
	});

	it('ignores extra and leading spaces (D7: the old copies gave "A" or "undefined"-free gaps)', () => {
		expect(getInitials('  Ana   Maria ')).toBe('AM');
	});

	it('takes parts as given, e.g. first and last name', () => {
		expect(getInitials(['Mary Ann', 'Smith'])).toBe('MS');
		expect(getInitials(['', 'Smith'])).toBe('S');
	});

	it('falls back when there is nothing to use', () => {
		expect(getInitials('')).toBe('');
		expect(getInitials(null, '?')).toBe('?');
		expect(getInitials(['', undefined], '?')).toBe('?');
	});
});

describe('toLabel', () => {
	it('splits camelCase and snake_case and capitalises', () => {
		expect(toLabel('tShaped')).toBe('T Shaped');
		expect(toLabel('individual_contributor')).toBe('Individual contributor');
		expect(toLabel('')).toBe('');
	});
});
