
export const contactChipSx = {
	fontSize: '0.75rem',
	backgroundColor: '#f1f5f9',
	color: '#334155',
	height: 24,
	borderRadius: 1,
	'& .MuiChip-icon': { fontSize: 13 },
};

export const techSkillChipSx = {
	fontSize: '0.75rem',
	backgroundColor: 'rgba(98,156,68,0.10)',
	color: '#3a6827',
	borderRadius: 1,
	height: 24,
	fontWeight: 500,
};

export const softSkillChipSx = {
	fontSize: '0.75rem',
	backgroundColor: '#f1f5f9',
	color: '#475569',
	borderRadius: 1,
	height: 24,
};

export const availLabelSx = {
	fontSize: '0.70rem',
	color: '#94a3b8',
	textTransform: 'uppercase',
	letterSpacing: '0.05em',
	mb: 0.25,
};

export const availValueSx = {
	fontWeight: 700,
	fontSize: '0.88rem',
	color: '#0f172a',
};

export const availabilityStatusChipSx = (status) => {
	const map = {
		activelyLooking:     { backgroundColor: 'rgba(98,156,68,0.12)',  color: '#3a6827' },
		openButNotSearching: { backgroundColor: 'rgba(59,130,246,0.10)', color: '#1e40af' },
		notAvailable:        { backgroundColor: '#f1f5f9',               color: '#64748b' },
		freelanceOnly:       { backgroundColor: 'rgba(139,92,246,0.10)', color: '#5b21b6' },
	};
	return {
		fontSize: '0.72rem', height: 22, fontWeight: 700, borderRadius: 0.75,
		...(map[status] ?? { backgroundColor: '#f1f5f9', color: '#64748b' }),
	};
};

export const langThSx = {
	fontWeight: 700,
	fontSize: '0.70rem',
	color: '#64748b',
	textTransform: 'uppercase',
	letterSpacing: '0.04em',
	backgroundColor: '#f8fafc',
	py: 0.75,
};

// ─── PropTypes ────────────────────────────────────────────────────────────────
