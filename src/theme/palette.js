import { brand, ink, line, onDark, status, surface } from './tokens.js';

/**
 * MUI palette. The standard keys point at the tokens, so MUI's own components (inputs, tabs,
 * checkboxes, helper text) follow the same readable colours. The Qorva keys are also addressable
 * from `sx` as strings, e.g. `color: 'ink.muted'`.
 */
export const palette = {
	mode: 'light',
	primary: { main: brand.pressed, light: brand.main, dark: brand.dark, contrastText: '#ffffff' },
	error: { main: status.error.main },
	warning: { main: status.warning.main },
	info: { main: status.info.main },
	success: { main: status.success.main },
	text: { primary: ink.strong, secondary: ink.body, disabled: ink.faintest },
	divider: line.main,
	background: { default: surface.subtle, paper: surface.paper },
	brand,
	ink,
	onDark,
	line,
	surface,
	status,
};
