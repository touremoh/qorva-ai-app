export const THEME_GREEN = '#629C44';

export const THEME_GREEN_DARK = '#528035';

export const THEME_GREEN_ALPHA = 'rgba(98, 156, 68, 0.18)';

export const inputSx = {
	'& .MuiOutlinedInput-root': {
		borderRadius: 1.5,
		transition: 'box-shadow 0.25s ease',
		'& fieldset': { transition: 'border-color 0.2s ease, border-width 0.1s ease' },
		'&:hover fieldset': { borderColor: THEME_GREEN },
		'&.Mui-focused': { boxShadow: `0 0 0 3px ${THEME_GREEN_ALPHA}` },
		'&.Mui-focused fieldset': { borderColor: THEME_GREEN, borderWidth: '2px' },
	},
	'& .MuiInputBase-input': { fontSize: '0.84rem' },
};

export const selectSx = {
	borderRadius: 1.5,
	fontSize: '0.84rem',
	transition: 'box-shadow 0.25s ease',
	'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: THEME_GREEN },
	'&.Mui-focused': { boxShadow: `0 0 0 3px ${THEME_GREEN_ALPHA}` },
	'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: THEME_GREEN, borderWidth: '2px' },
};

export const sliderSx = {
	color: THEME_GREEN,
	'& .MuiSlider-thumb': { width: 14, height: 14 },
	'& .MuiSlider-track': { height: 4 },
	'& .MuiSlider-rail': { height: 4, opacity: 0.25 },
};

export const stepperSx = {
	width: '100%',
	'& .MuiStepIcon-root': { color: '#e2e8f0' },
	'& .MuiStepIcon-root.Mui-active': { color: THEME_GREEN },
	'& .MuiStepIcon-root.Mui-completed': { color: THEME_GREEN },
	'& .MuiStepLabel-label': { fontSize: '0.82rem' },
	'& .MuiStepLabel-label.Mui-active': { fontWeight: 600, color: THEME_GREEN },
	'& .MuiStepLabel-label.Mui-completed': { color: THEME_GREEN },
	'& .MuiStepConnector-line': { borderColor: '#e2e8f0' },
	'& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: THEME_GREEN },
	'& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: THEME_GREEN },
};

// ─── Scoring form helpers ─────────────────────────────────────────────────────

export const emptySkill = () => ({ name: '', importance: 'mandatory', weight: 50, minYearsOfExperience: 1, exactSkillOnly: false });

export const AVAILABILITY_STATUSES = ['activelyLooking', 'openButNotSearching', 'notAvailable', 'freelanceOnly'];

export const tabsSx = {
	borderBottom: '1px solid #e2e8f0',
	minHeight: 40,
	px: 2,
	backgroundColor: '#ffffff',
	'& .MuiTabs-indicator': { backgroundColor: THEME_GREEN },
	'& .MuiTab-root': { textTransform: 'none', fontSize: '0.82rem', minHeight: 40, py: 1, color: '#64748b' },
	'& .MuiTab-root.Mui-selected': { color: THEME_GREEN, fontWeight: 600 },
};
