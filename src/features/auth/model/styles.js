import * as tokens from '../../../theme/tokens.js';
export const inputSx = {
	mb: 0.5,
	'& .MuiOutlinedInput-root': {
		borderRadius: 1.5,
		backgroundColor: tokens.surface.subtle,
		transition: 'background-color 0.2s',
		'&:hover': { backgroundColor: tokens.surface.muted },
		'&.Mui-focused': { backgroundColor: tokens.surface.paper },
		'& fieldset': { borderColor: tokens.line.main },
		'&:hover fieldset': { borderColor: tokens.line.strong },
		'&.Mui-focused fieldset': { borderColor: tokens.brand.main, borderWidth: 1.5 },
	},
	'& .MuiInputLabel-root.Mui-focused': { color: tokens.brand.text },
};
