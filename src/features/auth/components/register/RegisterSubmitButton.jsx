import PropTypes from 'prop-types';
import { Button, Box, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useTranslation } from 'react-i18next';
import { PROGRESS_STEPS } from '../../model/registration.js';
import * as tokens from '../../../../theme/tokens.js';

/** Submit button that narrates the registration progress: idle → progress steps → done. */
const RegisterSubmitButton = ({ status, progressStep }) => {
	const { t } = useTranslation();
	return (
		<Button
			type="submit"
			fullWidth
			variant="contained"
			disabled={status !== 'idle'}
			sx={{
				mt: 2,
				py: 1.3,
				borderRadius: 1.5,
				fontWeight: 600,
				fontSize: tokens.fontSize.body,
				textTransform: 'none',
				letterSpacing: 0,
				backgroundColor: tokens.brand.main,
				boxShadow: `0 2px 8px ${alpha(tokens.brand.main, 0.35)}`,
				transition: 'background-color 0.2s, box-shadow 0.2s, transform 0.1s',
				'&:hover': {
					backgroundColor: tokens.brand.hoverAlt,
					boxShadow: `0 4px 14px ${alpha(tokens.brand.main, 0.45)}`,
					transform: 'translateY(-1px)',
				},
				'&:active': { transform: 'translateY(0)' },
				'&.Mui-disabled': status === 'success'
					? { backgroundColor: tokens.status.success.tint, color: tokens.status.success.text, boxShadow: 'none' }
					: { backgroundColor: tokens.brand.soft, color: 'rgba(255,255,255,0.9)', boxShadow: 'none' },
			}}
		>
			{status === 'loading' && (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<CircularProgress size={16} sx={{ color: 'rgba(255,255,255,0.9)' }} />
					{t(PROGRESS_STEPS[progressStep].key, PROGRESS_STEPS[progressStep].fallback)}
				</Box>
			)}
			{status === 'success' && (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
					<CheckCircleRoundedIcon sx={{ fontSize: tokens.iconSize.lg, color: tokens.status.success.main }} />
					{t('registration.progress.done', 'Account created!')}
				</Box>
			)}
			{status === 'idle' && t('registration.createFreeAccount', 'Create free account')}
		</Button>
	);
};

RegisterSubmitButton.propTypes = {
	status: PropTypes.oneOf(['idle', 'loading', 'success']).isRequired,
	progressStep: PropTypes.number,
};

export default RegisterSubmitButton;
