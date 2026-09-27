import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import * as tokens from '../../../../theme/tokens.js';

const SectionTitle = ({ label }) => (
	<Typography sx={{ fontWeight: 700, fontSize: tokens.fontSize.small, color: tokens.ink.soft, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.5, mt: 0.5 }}>
		{label}
	</Typography>
);

SectionTitle.propTypes = {
	label: PropTypes.node,
};

export default SectionTitle;
