import { describe, expect, it } from 'vitest';
import { scoreColorsFor, scoreTone } from './score.js';

describe('scoreTone', () => {
	it('uses the 70 / 40 thresholds on percentages', () => {
		expect(scoreTone(82)).toBe('good');
		expect(scoreTone(70)).toBe('good');
		expect(scoreTone(69.9)).toBe('fair');
		expect(scoreTone(40)).toBe('fair');
		expect(scoreTone(39)).toBe('poor');
	});

	it('reads 0–1 scores with scale 1', () => {
		expect(scoreTone(0.7, 1)).toBe('good');
		expect(scoreTone(0.4, 1)).toBe('fair');
		expect(scoreTone(0.2, 1)).toBe('poor');
	});

	it('returns today\'s chip colours', () => {
		expect(scoreColorsFor(82)).toMatchObject({ text: '#166534', tint: '#dcfce7', main: '#16a34a' });
		expect(scoreColorsFor(50)).toMatchObject({ text: '#854d0e', tint: '#fef9c3', main: '#d97706' });
		expect(scoreColorsFor(10)).toMatchObject({ text: '#991b1b', tint: '#fee2e2', main: '#dc2626' });
	});
});
