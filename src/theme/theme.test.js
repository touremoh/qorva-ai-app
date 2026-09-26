import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { theme, tokens } from './index.js';

describe('theme', () => {
	it('keeps MUI defaults for the keys MUI components read (until the F12 switch)', () => {
		const muiDefault = createTheme();
		expect(theme.palette.primary).toEqual(muiDefault.palette.primary);
		expect(theme.palette.text).toEqual(muiDefault.palette.text);
		expect(theme.typography.fontFamily).toBe(muiDefault.typography.fontFamily);
		expect(theme.typography.body2).toEqual(muiDefault.typography.body2);
	});

	it('exposes the Qorva tokens as palette paths usable from sx', () => {
		expect(theme.palette.brand.main).toBe(tokens.brand.main);
		expect(theme.palette.ink.muted).toBe(tokens.ink.muted);
		expect(theme.palette.line.main).toBe(tokens.line.main);
		expect(theme.palette.surface.subtle).toBe(tokens.surface.subtle);
		expect(theme.palette.status.error.text).toBe(tokens.status.error.text);
	});
});
