import { Box, Chip, Paper, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import ScoreGaugeSmall from './ScoreGaugeSmall.jsx';
import { THEME_GREEN, getBg, getColor } from '../../model/reportDetails.js';

const DetailScoreCard = ({ icon: Icon, label, score, explanation }) => {
	const color = getColor(score);
	return (
		<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, pb: 0.75, borderBottom: `2px solid ${THEME_GREEN}` }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
					<Icon sx={{ fontSize: 14, color: THEME_GREEN }} />
					<Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: THEME_GREEN, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
						{label}
					</Typography>
				</Box>
				<Chip label={`${score}%`} size="small"
					sx={{ height: 18, fontSize: '0.68rem', fontWeight: 700, backgroundColor: getBg(score), color }} />
			</Box>
			<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
				<ScoreGaugeSmall value={score} />
				<Typography sx={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55, flex: 1, pt: 0.5 }}>
					{explanation}
				</Typography>
			</Box>
		</Paper>
	);
};
DetailScoreCard.propTypes = {
	icon: PropTypes.elementType.isRequired,
	label: PropTypes.node,
	score: PropTypes.number.isRequired,
	explanation: PropTypes.node,
};

// ─── Main component ───────────────────────────────────────────────────────────

export default DetailScoreCard;
