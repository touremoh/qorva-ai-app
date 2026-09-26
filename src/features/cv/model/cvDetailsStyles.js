import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

export const contactChipSx = {
	fontSize: '0.75rem',
	backgroundColor: tokens.surface.muted,
	color: tokens.ink.body,
	height: 24,
	borderRadius: 1,
	'& .MuiChip-icon': { fontSize: 13 },
};

export const techSkillChipSx = {
	fontSize: '0.75rem',
	backgroundColor: alpha(tokens.brand.main, 0.10),
	color: tokens.brand.dark,
	borderRadius: 1,
	height: 24,
	fontWeight: 500,
};

export const softSkillChipSx = {
	fontSize: '0.75rem',
	backgroundColor: tokens.surface.muted,
	color: tokens.ink.soft,
	borderRadius: 1,
	height: 24,
};

export const availLabelSx = {
	fontSize: '0.70rem',
	color: tokens.ink.subtle,
	textTransform: 'uppercase',
	letterSpacing: '0.05em',
	mb: 0.25,
};

export const availValueSx = {
	fontWeight: 700,
	fontSize: '0.88rem',
	color: tokens.ink.strong,
};

export const availabilityStatusChipSx = (status) => {
	const map = {
		activelyLooking:     { backgroundColor: alpha(tokens.brand.main, 0.12),  color: tokens.brand.dark },
		openButNotSearching: { backgroundColor: 'rgba(59,130,246,0.10)', color: tokens.status.info.navy },
		notAvailable:        { backgroundColor: tokens.surface.muted,               color: tokens.ink.muted },
		freelanceOnly:       { backgroundColor: 'rgba(139,92,246,0.10)', color: tokens.status.accent.deep },
	};
	return {
		fontSize: '0.72rem', height: 22, fontWeight: 700, borderRadius: 0.75,
		...(map[status] ?? { backgroundColor: tokens.surface.muted, color: tokens.ink.muted }),
	};
};

export const langThSx = {
	fontWeight: 700,
	fontSize: '0.70rem',
	color: tokens.ink.muted,
	textTransform: 'uppercase',
	letterSpacing: '0.04em',
	backgroundColor: tokens.surface.subtle,
	py: 0.75,
};

// ─── PropTypes ────────────────────────────────────────────────────────────────
