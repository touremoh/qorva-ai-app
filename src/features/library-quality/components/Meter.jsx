import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import * as tokens from '../../../theme/tokens.js';

const Meter = ({ label, count, percentage, accent }) => (
	<Box>
		<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.35 }}>
			<Typography sx={{ fontSize: '0.69rem', color: tokens.ink.soft, fontWeight: 500 }}>{label}</Typography>
			<Typography sx={{ fontSize: '0.69rem', color: tokens.ink.muted, fontWeight: 600 }}>
				{count} · {Number(percentage).toFixed(1)}%
			</Typography>
		</Box>
		<Box sx={{ height: 5, backgroundColor: tokens.surface.muted, borderRadius: 4, overflow: 'hidden' }}>
			<Box sx={{ height: '100%', width: `${percentage}%`, backgroundColor: accent, borderRadius: 4, transition: 'width 0.6s ease' }} />
		</Box>
	</Box>
);
Meter.propTypes = {
	label: PropTypes.string.isRequired,
	count: PropTypes.number.isRequired,
	percentage: PropTypes.number.isRequired,
	accent: PropTypes.string.isRequired,
};

export default Meter;
