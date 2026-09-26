// The button looks in use across screens, in one place. Phase F12 folds them into the theme's
// MUI button variants; until then each keeps its exact current size.

/** Solid green, pill radius: the main action on settings screens. */
export const brandPillButtonSx = {
	backgroundColor: 'brand.main', borderRadius: 2, textTransform: 'none',
	fontSize: '0.82rem', fontWeight: 600, boxShadow: 'none',
	'&:hover': { backgroundColor: 'brand.pressed', boxShadow: 'none' },
};

/** Solid green, compact radius. */
export const brandButtonSx = (fontSize) => ({
	textTransform: 'none', fontSize, fontWeight: 600, borderRadius: 1.5, boxShadow: 'none',
	backgroundColor: 'brand.main', '&:hover': { backgroundColor: 'brand.hover' },
});

/** Outlined neutral, compact radius. */
export const outlinedButtonSx = (fontSize) => ({
	textTransform: 'none', fontSize, fontWeight: 600, borderRadius: 1.5,
	color: 'ink.body', borderColor: 'line.main', '&:hover': { borderColor: 'line.strong', backgroundColor: 'surface.subtle' },
});

/** Text-only neutral (cancel, secondary actions). */
export const textButtonSx = (fontSize) => ({ textTransform: 'none', fontSize, color: 'ink.muted', borderRadius: 1.5 });
