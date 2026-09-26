import { brand, ink, line, status, surface } from './tokens.js';

/**
 * MUI palette. The standard keys (primary, text, …) keep MUI's defaults for now, because MUI's own
 * components read them and changing them would repaint every screen; F12 points them at the tokens.
 * The Qorva keys are addressable from `sx` as strings, e.g. `color: 'ink.muted'`.
 */
export const palette = {
	brand,
	ink,
	line,
	surface,
	status,
};
