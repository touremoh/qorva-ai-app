import { Box, Paper, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import * as tokens from '../../../theme/tokens.js';

const KPICard = ({ label, value, icon: Icon, accent, bg }) => (
	<Paper elevation={0} sx={{
		border: `1px solid ${tokens.line.main}`,
		borderLeft: `3px solid ${accent}`,
		borderRadius: 2.5, p: 2,
		display: 'flex', alignItems: 'center', gap: 1.5,
		transition: 'box-shadow 0.15s ease',
		'&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.07)' },
	}}>
		<Box sx={{ width: 42, height: 42, borderRadius: 2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: bg }}>
			<Icon sx={{ fontSize: tokens.iconSize.lg, color: accent }} />
		</Box>
		<Box sx={{ minWidth: 0 }}>
			<Typography sx={{ fontSize: tokens.fontSize.xxl, fontWeight: 800, color: tokens.ink.strong, lineHeight: 1 }}>
				{Number.isFinite(value) ? value.toLocaleString() : 0}
			</Typography>
			<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.muted, fontWeight: 500, mt: 0.25, lineHeight: 1.3 }}>
				{label}
			</Typography>
		</Box>
	</Paper>
);
KPICard.propTypes = {
	label: PropTypes.string.isRequired,
	value: PropTypes.number,
	icon: PropTypes.elementType.isRequired,
	accent: PropTypes.string.isRequired,
	bg: PropTypes.string.isRequired,
};

export default KPICard;
