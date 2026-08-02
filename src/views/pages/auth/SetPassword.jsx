import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
	Box,
	Container,
	Paper,
	Typography,
	TextField,
	Button,
	Stack,
	InputAdornment,
	IconButton,
	Alert,
	CircularProgress,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useTranslation } from 'react-i18next';
import { setPassword as setPasswordRequest } from '../../../services/authService.js';
import { QORVA_USER_LANGUAGE, SUPPORTED_LANGUAGES } from '../../../constants.js';

const MIN_PASSWORD_LENGTH = 8;
// Requires lower, upper, digit and any non-alphanumeric character, 8–64 chars.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/;

const SetPassword = () => {
	const { t, i18n } = useTranslation();
	const { lang } = useParams();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const token = searchParams.get('token');

	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [touched, setTouched] = useState({});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	// linkError: 'invalid' (401) | 'used' (409) | 'generic'
	const [linkError, setLinkError] = useState('');

	// Honour the language segment from the email link.
	useEffect(() => {
		if (lang && SUPPORTED_LANGUAGES.includes(lang) && i18n.language !== lang) {
			i18n.changeLanguage(lang);
			localStorage.setItem(QORVA_USER_LANGUAGE, lang);
		}
	}, [lang, i18n]);

	const errors = useMemo(() => {
		const next = {};
		if (!password) {
			next.password = t('setPassword.passwordRequired', 'Password is required');
		} else if (password.length < MIN_PASSWORD_LENGTH) {
			next.password = t('setPassword.passwordTooShort', 'Password must be at least 8 characters');
		} else if (!PASSWORD_REGEX.test(password)) {
			next.password = t(
				'setPassword.passwordInvalid',
				'8–64 characters with at least 1 uppercase, 1 lowercase, 1 number and 1 special character'
			);
		}
		if (!confirm) {
			next.confirm = t('setPassword.confirmRequired', 'Please confirm your password');
		} else if (confirm !== password) {
			next.confirm = t('setPassword.passwordMismatch', 'Passwords do not match');
		}
		return next;
	}, [password, confirm, t]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLinkError('');
		setTouched({ password: true, confirm: true });
		if (Object.keys(errors).length) return;
		if (!token) {
			setLinkError('invalid');
			return;
		}
		setLoading(true);
		try {
			const response = await setPasswordRequest(token, password);
			if (response.data?.data === true) {
				setSuccess(true);
				setTimeout(() => navigate('/login'), 2500);
			} else {
				setLinkError('generic');
			}
		} catch (error) {
			const status = error?.response?.status;
			const code = error?.response?.data?.errorCode;
			if (status === 401 || code === 'error.auth.set_password_token_invalid') {
				setLinkError('invalid');
			} else if (status === 409 || code === 'error.auth.set_password_token_used') {
				setLinkError('used');
			} else {
				setLinkError('generic');
			}
		} finally {
			setLoading(false);
		}
	};

	const renderLinkError = () => {
		if (!linkError) return null;
		const config = {
			invalid: {
				message: t('setPassword.errorInvalid', 'This link is invalid or has expired.'),
				action: (
					<Button color="inherit" size="small" component={RouterLink} to="/resend-activation">
						{t('setPassword.requestNewLink', 'Request a new link')}
					</Button>
				),
			},
			used: {
				message: t('setPassword.errorUsed', 'This link has already been used.'),
				action: (
					<Button color="inherit" size="small" component={RouterLink} to="/login">
						{t('setPassword.goToLogin', 'Log in')}
					</Button>
				),
			},
			generic: {
				message: t('setPassword.errorGeneric', 'Something went wrong. Please try again.'),
				action: null,
			},
		}[linkError];

		return (
			<Alert severity="error" sx={{ mb: 2, borderRadius: 1.5, fontSize: '0.82rem' }} action={config.action}>
				{config.message}
			</Alert>
		);
	};

	return (
		<Box
			sx={{
				height: '100vh',
				width: '100vw',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: 'linear-gradient(135deg, #f0f4f8 0%, #e8edf2 100%)',
				px: 2,
				position: 'fixed',
				top: 0,
				left: 0,
			}}
		>
			<Container maxWidth="sm">
				<Paper
					elevation={0}
					sx={{
						borderRadius: 3,
						px: { xs: 3, sm: 5 },
						py: { xs: 4, sm: 5.5 },
						boxShadow: '0 24px 64px rgba(0,0,0,0.1)',
						border: '1px solid rgba(226,232,240,0.8)',
					}}
				>
					{success ? (
						<Stack spacing={3} alignItems="center" textAlign="center">
							<Box
								sx={{
									width: 80, height: 80, borderRadius: '50%',
									display: 'grid', placeItems: 'center',
									backgroundColor: '#629C44',
									boxShadow: '0 10px 30px rgba(98,156,68,0.35)',
								}}
								aria-hidden
							>
								<CheckCircleRoundedIcon sx={{ fontSize: 48, color: '#fff' }} />
							</Box>
							<Stack spacing={1}>
								<Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
									{t('setPassword.successTitle', 'Password set!')}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{t('setPassword.successMessage', 'Your account is now active. Redirecting you to login…')}
								</Typography>
							</Stack>
							<CircularProgress size={22} sx={{ color: '#629C44' }} />
						</Stack>
					) : (
						<>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
								<Box component="img" src="/logo.svg" alt="Qorva" sx={{ width: 34, height: 34 }} />
								<Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#0f172a' }}>Qorva</Typography>
							</Box>

							<Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.03em', mb: 0.75 }}>
								{t('setPassword.title', 'Set your password')}
							</Typography>
							<Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
								{t('setPassword.subtitle', 'Choose a password to activate your account.')}
							</Typography>

							{renderLinkError()}

							<Box component="form" onSubmit={handleSubmit} noValidate>
								<TextField
									label={t('setPassword.newPassword', 'New password')}
									type={showPassword ? 'text' : 'password'}
									variant="outlined"
									fullWidth
									required
									size="small"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									onBlur={() => setTouched((p) => ({ ...p, password: true }))}
									error={Boolean(touched.password && errors.password)}
									helperText={(touched.password && errors.password) || t('setPassword.passwordHint', 'At least 8 characters, with an uppercase, a lowercase, a number and a special character')}
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
														onClick={() => setShowPassword((p) => !p)}
														edge="end"
														size="small"
														aria-label={t('setPassword.togglePasswordVisibility', 'Toggle password visibility')}
														sx={{ color: '#94a3b8' }}
													>
														{showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
													</IconButton>
												</InputAdornment>
											),
										},
									}}
								/>

								<TextField
									label={t('setPassword.confirmPassword', 'Confirm password')}
									type={showPassword ? 'text' : 'password'}
									variant="outlined"
									fullWidth
									required
									size="small"
									value={confirm}
									onChange={(e) => setConfirm(e.target.value)}
									onBlur={() => setTouched((p) => ({ ...p, confirm: true }))}
									error={Boolean(touched.confirm && errors.confirm)}
									helperText={(touched.confirm && errors.confirm) || ' '}
									sx={inputSx}
									slotProps={{
										input: {
											startAdornment: (
												<InputAdornment position="start">
													<LockOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
												</InputAdornment>
											),
										},
									}}
								/>

								<Button
									type="submit"
									fullWidth
									variant="contained"
									disabled={loading}
									sx={{
										mt: 0.5, py: 1.3, borderRadius: 1.5,
										fontWeight: 600, fontSize: '0.9rem', textTransform: 'none',
										backgroundColor: '#629C44',
										boxShadow: '0 2px 8px rgba(98,156,68,0.35)',
										'&:hover': { backgroundColor: '#518136', boxShadow: '0 4px 14px rgba(98,156,68,0.45)' },
										'&.Mui-disabled': { backgroundColor: '#b8d4a8', boxShadow: 'none' },
									}}
								>
									{loading
										? <CircularProgress size={20} sx={{ color: 'rgba(255,255,255,0.8)' }} />
										: t('setPassword.submit', 'Set password & activate')}
								</Button>
							</Box>
						</>
					)}
				</Paper>
			</Container>
		</Box>
	);
};

const inputSx = {
	mb: 1.5,
	'& .MuiOutlinedInput-root': {
		borderRadius: 1.5,
		backgroundColor: '#f8fafc',
		'&.Mui-focused': { backgroundColor: '#ffffff' },
		'& fieldset': { borderColor: '#e2e8f0' },
		'&:hover fieldset': { borderColor: '#cbd5e1' },
		'&.Mui-focused fieldset': { borderColor: '#629C44', borderWidth: 1.5 },
	},
	'& .MuiInputLabel-root.Mui-focused': { color: '#629C44' },
};

export default SetPassword;
