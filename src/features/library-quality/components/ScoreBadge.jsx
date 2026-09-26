import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { scoreColor } from '../model/libraryQuality.js';
import * as tokens from '../../../theme/tokens.js';

const ScoreBadge = ({ score }) => {
	const { color, bg } = scoreColor(score);
	return (
		<Box sx={{ px: 1, py: 0.2, borderRadius: 1.5, backgroundColor: bg, color, fontSize: tokens.fontSize.body2, fontWeight: 800, lineHeight: 1.6, flexShrink: 0 }}>
			{score}
		</Box>
	);
};
ScoreBadge.propTypes = {
	score: PropTypes.number.isRequired,
};

export default ScoreBadge;
