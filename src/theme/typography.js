import { fontFamily, fontSize } from './tokens.js';

/** MUI typography: Inter, body 16px, dense body 15px, captions 13px, nothing under 12px. */
export const typography = {
	fontFamily,
	htmlFontSize: 16,
	fontSize: 15,
	h1: { fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.2 },
	h2: { fontSize: '1.875rem', fontWeight: 700, lineHeight: 1.25 },
	h3: { fontSize: fontSize.display, fontWeight: 700, lineHeight: 1.3 },
	h4: { fontSize: fontSize.xxl, fontWeight: 700, lineHeight: 1.3 },
	h5: { fontSize: fontSize.xl, fontWeight: 600, lineHeight: 1.35 },
	h6: { fontSize: '1.0625rem', fontWeight: 600, lineHeight: 1.4 },
	subtitle1: { fontSize: fontSize.body, fontWeight: 500 },
	subtitle2: { fontSize: fontSize.body2, fontWeight: 600 },
	body1: { fontSize: fontSize.body, lineHeight: 1.55 },
	body2: { fontSize: fontSize.body2, lineHeight: 1.5 },
	caption: { fontSize: fontSize.caption, lineHeight: 1.45 },
	overline: { fontSize: fontSize.micro, fontWeight: 700, letterSpacing: '0.06em', lineHeight: 1.6 },
	button: { fontSize: fontSize.body2, fontWeight: 600, textTransform: 'none' },
};
