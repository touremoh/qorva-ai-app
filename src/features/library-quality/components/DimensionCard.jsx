import PropTypes from 'prop-types';
import { Box, Paper, Typography } from '@mui/material';
import ScoreBadge from './ScoreBadge.jsx';

const DimensionCard = ({ label, score, icon: Icon, accent, bg, children }) => (
	<Paper elevation={0} sx={{
		border: '1px solid #e2e8f0',
		borderLeft: `3px solid ${accent}`,
		borderRadius: 2.5, p: 2,
		display: 'flex', flexDirection: 'column', gap: 1.25, minWidth: 0,
	}}>
		<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
				<Box sx={{ width: 32, height: 32, borderRadius: 1.5, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: bg }}>
					<Icon sx={{ fontSize: 16, color: accent }} />
				</Box>
				<Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>{label}</Typography>
			</Box>
			<ScoreBadge score={score} />
		</Box>
		{children}
	</Paper>
);
DimensionCard.propTypes = {
	label: PropTypes.string.isRequired,
	score: PropTypes.number.isRequired,
	icon: PropTypes.elementType.isRequired,
	accent: PropTypes.string.isRequired,
	bg: PropTypes.string.isRequired,
	children: PropTypes.node,
};

export default DimensionCard;
