import PropTypes from 'prop-types';
import { Typography } from '@mui/material';

const SectionTitle = ({ label }) => (
	<Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1.5, mt: 0.5 }}>
		{label}
	</Typography>
);

SectionTitle.propTypes = {
	label: PropTypes.node,
};

export default SectionTitle;
