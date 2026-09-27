// Qorva design tokens: the one place colours and type sizes are defined.
//
// Every colour, type size and icon size in the app comes from here. Values follow the readability
// rules of the architecture refactor (guide §5.2): text is at least 12px and body copy 15–16px;
// text colours keep a contrast of 7:1 or more on white; the brand green is for fills and icons,
// and its darker shade (brand.text) is used for green text.

/** Brand green. `main` is for fills and icons; `text` is the green used for text and links. */
export const brand = {
	main: '#629C44',
	hover: '#528035',
	hoverAlt: '#518136',
	pressed: '#4a7a33',
	dark: '#3a6827',
	text: '#4a7a33',
	soft: '#b8d4a8',
	tint: 'rgba(98,156,68,0.08)',
	tintStrong: 'rgba(98,156,68,0.12)',
	border: 'rgba(98,156,68,0.35)',
	contrastText: '#ffffff',
	pale: '#a3c988',
	lime: '#7cb342',
	limePale: '#aed581',
	deep: '#4d7a35',
	olive: '#3f6212',
	mintPale: '#a5d68a',
	leaf: '#8dc96b',
};

/** Text colours, strongest first. `subtle`, `faint` and `faintest` are today's light greys, too faint for body copy. */
export const ink = {
	strong: '#0f172a',
	heading: '#1e293b',
	body: '#334155',
	soft: '#475569',
	muted: '#334155',
	subtle: '#475569',
	inverse: '#ffffff',
	faint: '#475569',
	faintest: '#64748b',
	navy: '#232f3e',
	navyDeep: '#1a2940',
	slateDeep: '#2d3f54',
	gray: '#6b7280',
};

/** Text on dark surfaces (sidebar, dock title bar, brand panels): light greys that stay readable on navy. */
export const onDark = {
	muted: '#94a3b8',
	subtle: '#cbd5e1',
	faint: '#cbd5e1',
	faintest: '#e2e8f0',
};

/** Borders and dividers. `strong` is decorative only, never text. */
export const line = {
	main: '#e2e8f0',
	strong: '#cbd5e1',
};

/** Backgrounds, lightest first. */
export const surface = {
	paper: '#ffffff',
	subtle: '#f8fafc',
	muted: '#f1f5f9',
	dim: '#fafafa',
	cool: '#f0f4f8',
	coolDeep: '#e8edf2',
	greenWhite: '#fafcfa',
	coolAlt: '#e8edf3',
	coolWhite: '#fafcfd',
	greenTint: '#fbfdf9',
	coolPale: '#eef2f7',
};

/** Status colours: `main` for icons and fills, `text` on a `tint` background, `border` around it; the rest are one-off accents. */
export const status = {
	success: { main: '#16a34a', text: '#166534', tint: '#dcfce7', border: '#bbf7d0', strong: '#15803d', teal: '#0f766e', pale: '#f0fdf4', mint: '#86efac', paleAlt: '#ecfdf3', mintPale: '#d1fae5', emerald: '#059669', mintBright: '#6ee7b7' },
	warning: { main: '#b45309', text: '#92400e', tint: '#fef9c3', border: '#fde68a', strong: '#b45309', bright: '#f59e0b', olive: '#a16207', bronze: '#cd7c2f', pale: '#fffbeb', tintAlt: '#fef3c7', border2: '#fcd34d', orange: '#ea580c' },
	error: { main: '#dc2626', text: '#991b1b', tint: '#fee2e2', border: '#fecaca', bright: '#ef4444', dark: '#b91c1c', pale: '#fef2f2', soft: '#fca5a5', whisper: '#fffafa', blush: '#fff5f5' },
	info: { main: '#0369a1', text: '#0369a1', tint: '#e0f2fe', border: '#bae6fd', bright: '#0891b2', blue: '#3b82f6', royal: '#2563eb', deep: '#1d4ed8', pale: '#f0f9ff', sky: '#0284c7', navy: '#1e40af', paleBlue: '#dbeafe', paleAlt: '#eff6ff', ink: '#0c4a6e', borderBlue: '#bfdbfe' },
	accent: { main: '#4f46e5', bright: '#6366f1', violet: '#7c3aed', purple: '#8b5cf6', deep: '#5b21b6', pink: '#db2777' },
};

/** Match-score tones (see shared/lib/score.js): chip text on tint, `main` for strokes, `soft` backgrounds. */
export const score = {
	good: { text: '#166534', tint: '#dcfce7', main: '#16a34a', soft: 'rgba(22,163,74,0.08)', accent: '#629C44' },
	fair: { text: '#854d0e', tint: '#fef9c3', main: '#d97706', soft: 'rgba(217,119,6,0.08)', accent: '#f59e0b' },
	poor: { text: '#991b1b', tint: '#fee2e2', main: '#dc2626', soft: 'rgba(220,38,38,0.08)', accent: '#dc2626' },
};

/** Type scale. The floor is 12px; body copy is 15px (dense) or 16px. */
export const fontSize = {
	micro: '0.75rem',
	caption: '0.8125rem',
	small: '0.875rem',
	body2: '0.9375rem',
	body: '1rem',
	lg: '1.125rem',
	xl: '1.25rem',
	xxl: '1.5rem',
	display: '1.75rem',
	// The big number in the match-score gauge.
	hero: '3.4rem',
};

/** Icon sizes (px), matched to the type scale. */
export const iconSize = {
	xs: 14,
	sm: 16,
	md: 18,
	lg: 20,
	xl: 24,
};

export const fontFamily = '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/** Monospace: named faces first, so the generic `monospace` never falls back to Courier. */
export const fontFamilyMono = 'ui-monospace, SFMono-Regular, Menlo, monospace';

export const radius = {
	sm: 6,
	md: 8,
	lg: 12,
	pill: 999,
};
