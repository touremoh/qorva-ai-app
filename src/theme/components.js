import { brand, fontSize, ink, line } from './tokens.js';

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
	MuiDialog: { styleOverrides: { paper: { borderRadius: 12 } } },
	MuiTooltip: {
		styleOverrides: { tooltip: { fontSize: fontSize.caption, backgroundColor: ink.strong, padding: '6px 10px' } },
	},
	MuiChip: { styleOverrides: { label: { fontWeight: 500 } } },
	MuiTableCell: { styleOverrides: { root: { borderColor: line.main } } },
};
