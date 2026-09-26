import { Paper } from '@mui/material';
import PropTypes from 'prop-types';

const Card = ({ children, sx }) => (
	<Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0', ...sx }}>
		{children}
	</Paper>
);

Card.propTypes = {
	children: PropTypes.node,
	sx: PropTypes.object,
};

// ─── Main component ───────────────────────────────────────────────────────────

export default Card;
