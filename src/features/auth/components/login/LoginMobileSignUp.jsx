import PropTypes from 'prop-types';
import { Grid2, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** Sign-up prompt shown under the form on small screens. */
const LoginMobileSignUp = ({ navigate }) => {
	const { t } = useTranslation();
	return (
		<>
		<Grid2
			size={{ xs: 12 }}
			sx={{
				display: { xs: 'flex', md: 'none' },
				backgroundColor: tokens.ink.navy,
				padding: '20px 28px',
				alignItems: 'center',
				justifyContent: 'space-between',
			}}
		>
			<Typography sx={{ color: tokens.ink.subtle, fontSize: '0.82rem' }}>
				{t('login.noAccount')}
			</Typography>
			<Button
				variant="outlined"
				onClick={() => navigate('/register')}
				size="small"
				sx={{
					color: tokens.ink.inverse,
					borderColor: 'rgba(255,255,255,0.3)',
					textTransform: 'none',
					borderRadius: 1.5,
					fontWeight: 500,
					'&:hover': { borderColor: 'rgba(255,255,255,0.6)' },
				}}
			>
				{t('login.signUpButton')}
			</Button>
		</Grid2>
		</>
	);
};

LoginMobileSignUp.propTypes = {
	navigate: PropTypes.any,
};

export default LoginMobileSignUp;
