import { describe, expect, it } from 'vitest';
import { theme, tokens } from './index.js';

describe('theme', () => {
	it('uses the readable tokens for the keys MUI components read', () => {
		expect(theme.palette.primary.main).toBe(tokens.brand.pressed);
		expect(theme.palette.text.primary).toBe(tokens.ink.strong);
		expect(theme.palette.text.secondary).toBe(tokens.ink.body);
		expect(theme.typography.fontFamily).toContain('Inter');
		expect(theme.typography.body2.fontSize).toBe('0.9375rem');
		expect(theme.typography.caption.fontSize).toBe('0.8125rem');
	});

	it('never goes under 12px for text', () => {
		const rem = (v) => parseFloat(v) * 16;
		Object.values(tokens.fontSize).forEach((size) => expect(rem(size)).toBeGreaterThanOrEqual(12));
	});

	it('exposes the Qorva tokens as palette paths usable from sx', () => {
		expect(theme.palette.brand.main).toBe(tokens.brand.main);
		expect(theme.palette.ink.muted).toBe(tokens.ink.muted);
		expect(theme.palette.onDark.subtle).toBe(tokens.onDark.subtle);
		expect(theme.palette.status.error.text).toBe(tokens.status.error.text);
	});
});
