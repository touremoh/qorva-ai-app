import PropTypes from 'prop-types';
import { Box, Stack, Typography, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import * as tokens from '../../../theme/tokens.js';

/** Confirmation shown once the password is set, while redirecting to login. */
const SetPasswordSuccess = ({ title, message }) => (
	<Stack spacing={3} alignItems="center" textAlign="center">
		<Box
			sx={{
				width: 80, height: 80, borderRadius: '50%',
				display: 'grid', placeItems: 'center',
				backgroundColor: tokens.brand.main,
				boxShadow: `0 10px 30px ${alpha(tokens.brand.main, 0.35)}`,
			}}
			aria-hidden
		>
			<CheckCircleRoundedIcon sx={{ fontSize: 48, color: tokens.ink.inverse }} />
		</Box>
		<Stack spacing={1}>
			<Typography variant="h5" sx={{ fontWeight: 800, color: tokens.ink.strong, letterSpacing: '-0.03em' }}>
				{title}
			</Typography>
			<Typography variant="body2" color="text.secondary">
				{message}
			</Typography>
		</Stack>
		<CircularProgress size={22} sx={{ color: tokens.brand.text }} />
	</Stack>
);

SetPasswordSuccess.propTypes = {
	title: PropTypes.string.isRequired,
	message: PropTypes.string.isRequired,
};

export default SetPasswordSuccess;
