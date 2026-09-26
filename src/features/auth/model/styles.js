export const inputSx = {
	mb: 0.5,
	'& .MuiOutlinedInput-root': {
		borderRadius: 1.5,
		backgroundColor: '#f8fafc',
		transition: 'background-color 0.2s',
		'&:hover': { backgroundColor: '#f1f5f9' },
		'&.Mui-focused': { backgroundColor: '#ffffff' },
		'& fieldset': { borderColor: '#e2e8f0' },
		'&:hover fieldset': { borderColor: '#cbd5e1' },
		'&.Mui-focused fieldset': { borderColor: '#629C44', borderWidth: 1.5 },
	},
	'& .MuiInputLabel-root.Mui-focused': { color: '#629C44' },
};
