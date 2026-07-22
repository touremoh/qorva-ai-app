import React, { useState, useMemo } from "react";
import {
	Grid2,
	Typography,
	TextField,
	Button,
	Box,
	InputAdornment,
	Alert,
	IconButton,
	Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CircularProgress from "@mui/material/CircularProgress";
import { login as loginUser } from '../../../services/authService.js';
import { createCheckoutSession } from '../../../services/registrationService.js';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../../components/languages/LanguageSwitcher.jsx';
import { setAuthResults } from "../../../../localStorageManager.js";
import { DASHBOARD_STATUSES, NEEDS_PAYMENT_STATUSES, ACCOUNT_STATUS_DEMO } from '../../../constants.js';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

const Login = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [touched, setTouched] = useState({ email: false, password: false });
	const [errors, setErrors] = useState({ email: "", password: "" });
	const [formError, setFormError] = useState("");
	const [loading, setLoading] = useState(false);

	const validate = (values) => {
		const next = { email: "", password: "" };
		if (!values.email) {
			next.email = t('login.emailRequired', 'Email is required');
		} else if (!EMAIL_REGEX.test(values.email)) {
			next.email = t('login.emailInvalid', 'Please enter a valid email address');
		}
		if (!values.password) {
			next.password = t('login.passwordRequired', 'Password is required');
		}
		return next;
	};

	const liveErrors = useMemo(() => validate({ email, password }), [email, password]);

	const handleBlur = (field) => () => {
		setTouched((prev) => ({ ...prev, [field]: true }));
		setErrors((prev) => ({ ...prev, [field]: liveErrors[field] }));
	};

	const handleLogin = async (e) => {
		e.preventDefault();
		setFormError("");
		const finalErrors = validate({ email, password });
		setErrors(finalErrors);
		setTouched({ email: true, password: true });
		if (Object.values(finalErrors).some(Boolean)) return;

		setLoading(true);
		try {
			const response = await loginUser(email, password);

			if (response.status === 200) {
				const { user } = response.data.data;
				const subscriptionStatus = user.tenant?.subscriptionInfo?.subscriptionStatus;

				// Demo accounts enter the workspace directly — no active subscription
				// is required; the UI runs in restricted demo mode with sample data.
				if (user.userAccountStatus === ACCOUNT_STATUS_DEMO) {
					setAuthResults(response.data.data);
					navigate('/');
				} else if (DASHBOARD_STATUSES.includes(subscriptionStatus)) {
					setAuthResults(response.data.data);
					navigate('/');
				} else if (NEEDS_PAYMENT_STATUSES.includes(subscriptionStatus)) {
					const tenantId = user.tenantId;
					const userId = user.id;
					const priceId = user.tenant?.subscriptionInfo?.priceId;
					try {
						const checkoutRes = await createCheckoutSession({ tenantId, userId, priceId });
						const checkoutUrl = checkoutRes.data?.data?.checkoutUrl;
						if (checkoutUrl) {
							window.location.href = checkoutUrl;
						} else {
							setFormError(t('login.checkoutError', 'Could not initiate checkout. Please contact support.'));
						}
					} catch {
						setFormError(t('login.checkoutError', 'Could not initiate checkout. Please contact support.'));
					}
				} else {
					setFormError(t('login.subscriptionInactive', 'Your account is not active. Please contact support.'));
				}
			} else {
				setFormError(t('errors.unexpected', 'Something went wrong. Please try again.'));
			}
		} catch (error) {
			const status = error?.response?.status;
			const backend = error?.response?.data;
			if (status === 401) {
				setFormError(backend?.message || t('login.invalidCredentials', 'Invalid email or password'));
			} else if (status >= 400 && status < 500) {
				setFormError(backend?.message || t('errors.client', 'Request error.'));
			} else if (status >= 500) {
				setFormError(t('errors.server', 'Server error. Please try again later.'));
			} else {
				setFormError(t('errors.network', 'Network error. Check your connection.'));
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			sx={{
				minHeight: '100vh',
				width: '100vw',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: 'linear-gradient(135deg, #f0f4f8 0%, #e8edf2 100%)',
				position: 'fixed',
				top: 0,
				left: 0,
			}}
		>
			<Box
				sx={{
					width: { xs: '100%', sm: '90%', md: '780px', lg: '860px' },
					height: { xs: '100%', sm: 'auto' },
					minHeight: { xs: '100vh', sm: 'auto' },
					borderRadius: { xs: 0, sm: 3 },
					overflow: 'hidden',
					boxShadow: { xs: 'none', sm: '0 24px 64px rgba(0,0,0,0.14)' },
				}}
			>
				<Grid2 container sx={{ height: '100%' }}>

					{/* Left: Form panel */}
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
								error={Boolean(touched.email && (errors.email || liveErrors.email))}
								helperText={(touched.email && (errors.email || liveErrors.email)) || ' '}
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
								error={Boolean(touched.password && (errors.password || liveErrors.password))}
								helperText={(touched.password && (errors.password || liveErrors.password)) || ' '}
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

							<Button
								type="submit"
								fullWidth
								variant="contained"
								disabled={loading}
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
									'&.Mui-disabled': { backgroundColor: '#b8d4a8', boxShadow: 'none' },
								}}
							>
								{loading
									? <CircularProgress size={20} sx={{ color: 'rgba(255,255,255,0.8)' }} />
									: t('login.signInButton')
								}
							</Button>
						</Box>

						<Divider sx={{ my: 3, borderColor: '#e2e8f0' }} />

						<Box sx={{ display: 'flex', justifyContent: 'center' }}>
							<LanguageSwitcher />
						</Box>
					</Grid2>

					{/* Right: Brand panel */}
					<Grid2
						size={{ xs: 12, md: 5 }}
						sx={{
							background: 'linear-gradient(160deg, #1a2940 0%, #232F3E 55%, #2d3f54 100%)',
							padding: { xs: '40px 28px', sm: '52px 44px' },
							display: { xs: 'none', md: 'flex' },
							flexDirection: 'column',
							justifyContent: 'space-between',
							position: 'relative',
							overflow: 'hidden',
						}}
					>
						{/* Decorative circles */}
						<Box sx={{
							position: 'absolute', top: -60, right: -60,
							width: 220, height: 220, borderRadius: '50%',
							background: 'rgba(98,156,68,0.12)',
							pointerEvents: 'none',
						}} />
						<Box sx={{
							position: 'absolute', bottom: -80, left: -40,
							width: 280, height: 280, borderRadius: '50%',
							background: 'rgba(37,99,235,0.1)',
							pointerEvents: 'none',
						}} />

						{/* Top content */}
						<Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
							<Box
								sx={{
									display: 'inline-flex',
									alignItems: 'center',
									gap: 1,
									backgroundColor: 'rgba(98,156,68,0.18)',
									border: '1px solid rgba(98,156,68,0.35)',
									borderRadius: 5,
									px: 2,
									py: 0.6,
									mb: 3,
								}}
							>
								<Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#629C44' }} />
								<Typography sx={{ fontSize: '0.75rem', color: '#a3c988', fontWeight: 500 }}>
									{t('login.panel.badge')}
								</Typography>
							</Box>

							<Typography
								sx={{
									fontSize: '1.65rem',
									fontWeight: 700,
									color: '#ffffff',
									lineHeight: 1.3,
									letterSpacing: '-0.03em',
									mb: 2,
								}}
							>
								{t('login.panel.headline')}
							</Typography>

							<Typography
								sx={{
									fontSize: '0.875rem',
									color: '#94a3b8',
									lineHeight: 1.65,
									maxWidth: 280,
									mb: 3.5,
								}}
							>
								{t('login.panel.subtext')}
							</Typography>

							{/* Feature bullets */}
							{[
								t('login.panel.bullet1'),
								t('login.panel.bullet2'),
								t('login.panel.bullet3'),
							].map((label) => (
								<Box key={label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
									<Box
										sx={{
											width: 20, height: 20, mt: '2px', borderRadius: '50%', flexShrink: 0,
											backgroundColor: 'rgba(98,156,68,0.2)',
											border: '1px solid rgba(98,156,68,0.5)',
											display: 'flex', alignItems: 'center', justifyContent: 'center',
										}}
									>
										<Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#629C44' }} />
									</Box>
									<Typography sx={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4 }}>
										{label}
									</Typography>
								</Box>
							))}
						</Box>

						{/* Bottom CTA */}
						<Box sx={{ position: 'relative', zIndex: 1 }}>
							<Typography sx={{ color: '#94a3b8', fontSize: '0.82rem', mb: 0.5 }}>
								{t('login.noAccount')}
							</Typography>
							<Typography sx={{ color: '#64748b', fontSize: '0.75rem', mb: 1.5 }}>
								{t('login.panel.freeToStart')}
							</Typography>
							<Button
								variant="outlined"
								onClick={() => navigate('/register')}
								sx={{
									color: '#ffffff',
									borderColor: 'rgba(255,255,255,0.25)',
									borderRadius: 1.5,
									textTransform: 'none',
									fontWeight: 500,
									fontSize: '0.85rem',
									px: 2.5,
									py: 0.9,
									backdropFilter: 'blur(4px)',
									backgroundColor: 'rgba(255,255,255,0.04)',
									transition: 'border-color 0.2s, background-color 0.2s',
									'&:hover': {
										borderColor: 'rgba(255,255,255,0.55)',
										backgroundColor: 'rgba(255,255,255,0.09)',
									},
								}}
							>
								{t('login.signUpButton')}
							</Button>
						</Box>
					</Grid2>

					{/* Mobile: sign-up row */}
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

				</Grid2>
			</Box>
		</Box>
	);
};

const inputSx = {
	mb: 0.5,
	'& .MuiOutlinedInput-root': {
		borderRadius: 1.5,
		backgroundColor: '#f8fafc',
		transition: 'background-color 0.2s',
		'&:hover': { backgroundColor: '#f1f5f9' },
		'&.Mui-focused': { backgroundColor: '#ffffff' },
		'& fieldset': { borderColor: '#e2e8f0' },
		'&:hover fieldset': { borderColor: '#cbd5e1' },
		'&.Mui-focused fieldset': { borderColor: '#629C44', borderWidth: 1.5 },
	},
	'& .MuiInputLabel-root.Mui-focused': { color: '#629C44' },
};

export default Login;
