import PropTypes from 'prop-types';
import { Grid2, Typography, TextField, Button, Box, InputAdornment, Alert, IconButton, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CircularProgress from '@mui/material/CircularProgress';
import LanguageSwitcher from '../../../../components/languages/LanguageSwitcher.jsx';
import MfaCodeStep from '../MfaCodeStep.jsx';
import { useTranslation } from 'react-i18next';
import { inputSx } from '../../model/styles.js';

/** Sign-in form: email, password, errors, and the MFA code step when required. */
const LoginFormPanel = ({ completeLogin, email, formError, handleBlur, handleLogin, liveErrors, mfaChallenge, password, restartLogin, setEmail, setPassword, setShowPassword, showPassword, status, touched }) => {
	const { t } = useTranslation();
	return (
		<>
		<Grid2
			size={{ xs: 12, md: 7 }}
			sx={{
				backgroundColor: '#ffffff',
				padding: { xs: '40px 28px', sm: '52px 56px' },
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
			}}
		>
			{/* Logo + brand */}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
				<Box
					component="img"
					src="/logo.svg"
					alt="Qorva"
					sx={{ width: 36, height: 36 }}
				/>
				<Typography
					sx={{
						fontWeight: 700,
						fontSize: '1.25rem',
						color: '#0f172a',
						letterSpacing: '-0.02em',
					}}
				>
					Qorva
				</Typography>
			</Box>

			{mfaChallenge ? (
				<MfaCodeStep
					challenge={mfaChallenge}
					onVerified={completeLogin}
					onRestart={restartLogin}
					inputSx={inputSx}
				/>
			) : (
				<>
				<Typography
					variant="h5"
					sx={{
						fontWeight: 700,
						color: '#0f172a',
						letterSpacing: '-0.03em',
						mb: 0.75,
					}}
				>
					{t('login.title')}
				</Typography>
				<Typography
					variant="body2"
					sx={{ color: '#64748b', mb: 3.5 }}
				>
					{t('login.subtitle')}
				</Typography>

				{formError && (
					<Alert
						severity="error"
						variant="filled"
						sx={{
							mb: 2.5,
							borderRadius: 1.5,
							fontSize: '0.82rem',
						}}
					>
						{formError}
					</Alert>
				)}

				<Box component="form" onSubmit={handleLogin} noValidate>
					<TextField
						label={t('login.emailLabel')}
						variant="outlined"
						fullWidth
						required
						size="small"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						onBlur={handleBlur('email')}
						error={Boolean(touched.email && liveErrors.email)}
						helperText={(touched.email && liveErrors.email) || ' '}
						sx={inputSx}
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<EmailOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
									</InputAdornment>
								),
							},
						}}
					/>

					<TextField
						label={t('login.passwordLabel')}
						type={showPassword ? "text" : "password"}
						variant="outlined"
						fullWidth
						required
						size="small"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						onBlur={handleBlur('password')}
						error={Boolean(touched.password && liveErrors.password)}
						helperText={(touched.password && liveErrors.password) || ' '}
						sx={inputSx}
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<LockOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
									</InputAdornment>
								),
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											onClick={() => setShowPassword((prev) => !prev)}
											edge="end"
											size="small"
											aria-label={t('login.togglePasswordVisibility', 'Toggle password visibility')}
											sx={{ color: '#94a3b8' }}
										>
											{showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
										</IconButton>
									</InputAdornment>
								),
							},
						}}
					/>

					<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
						<Typography
							component={RouterLink}
							to="/forgot-password"
							sx={{ color: '#629C44', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
						>
							{t('login.forgotPassword', 'Forgot password?')}
						</Typography>
					</Box>

					<Button
						type="submit"
						fullWidth
						variant="contained"
						disabled={status !== 'idle'}
						sx={{
							mt: 0.5,
							py: 1.3,
							borderRadius: 1.5,
							fontWeight: 600,
							fontSize: '0.9rem',
							textTransform: 'none',
							letterSpacing: 0,
							backgroundColor: '#629C44',
							boxShadow: '0 2px 8px rgba(98,156,68,0.35)',
							transition: 'background-color 0.2s, box-shadow 0.2s, transform 0.1s',
							'&:hover': {
								backgroundColor: '#518136',
								boxShadow: '0 4px 14px rgba(98,156,68,0.45)',
								transform: 'translateY(-1px)',
							},
							'&:active': { transform: 'translateY(0)' },
							'&.Mui-disabled': status === 'success'
								? { backgroundColor: '#dcfce7', color: '#166534', boxShadow: 'none' }
								: { backgroundColor: '#b8d4a8', color: 'rgba(255,255,255,0.9)', boxShadow: 'none' },
						}}
					>
						{status === 'loading' && (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<CircularProgress size={16} sx={{ color: 'rgba(255,255,255,0.9)' }} />
								{t('login.signingIn', 'Signing you in…')}
							</Box>
						)}
						{status === 'success' && (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
								<CheckCircleRoundedIcon sx={{ fontSize: 19, color: '#16a34a' }} />
								{t('login.signedIn', 'Signed in!')}
							</Box>
						)}
						{status === 'idle' && t('login.signInButton')}
					</Button>
				</Box>
				</>
			)}

			<Divider sx={{ my: 3, borderColor: '#e2e8f0' }} />

			<Box sx={{ display: 'flex', justifyContent: 'center' }}>
				<LanguageSwitcher />
			</Box>
		</Grid2>
		</>
	);
};

LoginFormPanel.propTypes = {
	completeLogin: PropTypes.any,
	email: PropTypes.any,
	formError: PropTypes.any,
	handleBlur: PropTypes.func,
	handleLogin: PropTypes.func,
	liveErrors: PropTypes.any,
	mfaChallenge: PropTypes.any,
	password: PropTypes.any,
	restartLogin: PropTypes.any,
	setEmail: PropTypes.func,
	setPassword: PropTypes.func,
	setShowPassword: PropTypes.func,
	showPassword: PropTypes.bool,
	status: PropTypes.any,
	touched: PropTypes.any,
};

export default LoginFormPanel;
