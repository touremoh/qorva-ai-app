import { brand, fontSize, ink, line, surface } from './tokens.js';

/** MUI component overrides: one button, dialog, tooltip and focus style across the app. */
export const components = {
	MuiButton: {
		defaultProps: { disableElevation: true },
		styleOverrides: { root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 } },
	},
	MuiButtonBase: {
		styleOverrides: {
			root: { '&.Mui-focusVisible': { outline: `2px solid ${brand.main}`, outlineOffset: 2 } },
		},
	},
	// One field style everywhere: soft grey fill, darker on hover, white with a green border when focused.
	MuiOutlinedInput: {
		styleOverrides: {
			root: {
				borderRadius: 6,
				backgroundColor: surface.subtle,
				transition: 'background-color 0.2s',
				'&:hover': { backgroundColor: surface.muted },
				'&.Mui-focused': { backgroundColor: surface.paper },
				'& .MuiOutlinedInput-notchedOutline': { borderColor: line.main },
				'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: line.strong },
				'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: brand.main, borderWidth: 1.5 },
			},
		},
	},
	MuiInputLabel: { styleOverrides: { root: { '&.Mui-focused': { color: brand.text } } } },
	MuiDialog: { styleOverrides: { paper: { borderRadius: 12 } } },
	MuiTooltip: {
		styleOverrides: { tooltip: { fontSize: fontSize.caption, backgroundColor: ink.strong, padding: '6px 10px' } },
	},
	MuiChip: { styleOverrides: { label: { fontWeight: 500 } } },
	MuiTableCell: { styleOverrides: { root: { borderColor: line.main } } },
};
