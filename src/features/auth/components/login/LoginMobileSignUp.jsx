import PropTypes from 'prop-types';
import { Grid2, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

/** Sign-up prompt shown under the form on small screens. */
const LoginMobileSignUp = ({ navigate }) => {
	const { t } = useTranslation();
	return (
		<>
		<Grid2
			size={{ xs: 12 }}
			sx={{
				display: { xs: 'flex', md: 'none' },
				backgroundColor: '#232F3E',
				padding: '20px 28px',
				alignItems: 'center',
				justifyContent: 'space-between',
			}}
		>
			<Typography sx={{ color: '#94a3b8', fontSize: '0.82rem' }}>
				{t('login.noAccount')}
			</Typography>
			<Button
				variant="outlined"
				onClick={() => navigate('/register')}
				size="small"
				sx={{
					color: '#ffffff',
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
