// Qorva design tokens: the one place colours and type sizes are defined.
//
// Phase F1 of the architecture refactor: every value reproduces what the screens hard-code today, so
// moving a component from a literal to a token changes no pixel. Phase F12 switches these values to
// the readable set (guide §5.2) in one reviewable diff.

/** Brand green. `main` is for fills and icons; `text` is the green used for text and links. */
export const brand = {
	main: '#629C44',
	hover: '#528035',
	hoverAlt: '#518136',
	pressed: '#4a7a33',
	dark: '#3a6827',
	text: '#629C44',
	soft: '#b8d4a8',
	tint: 'rgba(98,156,68,0.08)',
	tintStrong: 'rgba(98,156,68,0.12)',
	border: 'rgba(98,156,68,0.35)',
	contrastText: '#ffffff',
};

/** Text colours, strongest first. `subtle` is today's light grey text (#94a3b8), too faint for body copy. */
export const ink = {
	strong: '#0f172a',
	heading: '#1e293b',
	body: '#334155',
	soft: '#475569',
	muted: '#64748b',
	subtle: '#94a3b8',
	inverse: '#ffffff',
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
};

/** Status colours: `main` for icons and fills, `text` on a `tint` background, `border` around it. */
export const status = {
	success: { main: '#16a34a', text: '#166534', tint: '#dcfce7', border: '#bbf7d0' },
	warning: { main: '#d97706', text: '#92400e', tint: '#fef9c3', border: '#fde68a', strong: '#b45309', bright: '#f59e0b' },
	error: { main: '#dc2626', text: '#991b1b', tint: '#fee2e2', border: '#fecaca', bright: '#ef4444', dark: '#b91c1c' },
	info: { main: '#0369a1', text: '#0369a1', tint: '#e0f2fe', border: '#bae6fd', bright: '#0891b2' },
	accent: { main: '#4f46e5', bright: '#6366f1', violet: '#7c3aed' },
};

/** Match-score tones (see shared/lib/score.js): chip text on tint, `main` for strokes, `soft` backgrounds. */
export const score = {
	good: { text: '#166534', tint: '#dcfce7', main: '#16a34a', soft: 'rgba(22,163,74,0.08)', accent: '#629C44' },
	fair: { text: '#854d0e', tint: '#fef9c3', main: '#d97706', soft: 'rgba(217,119,6,0.08)', accent: '#f59e0b' },
	poor: { text: '#991b1b', tint: '#fee2e2', main: '#dc2626', soft: 'rgba(220,38,38,0.08)', accent: '#dc2626' },
};

/**
 * Type scale. Named steps replace the ~30 ad-hoc sizes (0.6rem to 1.1rem) in F12; until then
 * components keep their literal sizes so screenshots stay identical.
 */
export const fontSize = {
	micro: '0.625rem',
	tiny: '0.7rem',
	xs: '0.75rem',
	sm: '0.8rem',
	md: '0.875rem',
	base: '1rem',
	lg: '1.125rem',
};

export const fontFamily = '"Roboto", "Helvetica", "Arial", sans-serif';

/** Monospace: named faces first, so the generic `monospace` never falls back to Courier. */
export const fontFamilyMono = 'ui-monospace, SFMono-Regular, Menlo, monospace';

export const radius = { sm: 6, md: 8, lg: 12, pill: 999 };
