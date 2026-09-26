import PropTypes from 'prop-types';
import { Chip } from '@mui/material';
import { ATS_LABELS } from '../../model/atsLabels.js';

/** Tiny "via <ATS>" origin badge for CVs imported through an integration. */
const AtsSourceChip = ({ cv }) => {
	const ref = cv.atsRefs?.[0];
	if (!ref) return null;
	return (
		<Chip
			label={ATS_LABELS[ref.provider] || ref.provider}
			size="small"
			sx={{
				height: 16, fontSize: '0.6rem', fontWeight: 700, ml: 0.5,
				color: '#0369a1', backgroundColor: 'rgba(3,105,161,0.08)',
				'& .MuiChip-label': { px: 0.75 },
			}}
		/>
	);
};

AtsSourceChip.propTypes = { cv: PropTypes.object.isRequired };

export default AtsSourceChip;
