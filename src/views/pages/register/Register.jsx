import React, { useState, useMemo } from 'react';
import {
	Grid2,
	Typography,
	TextField,
	Button,
	Box,
	InputAdornment,
	Alert,
	IconButton,
	Divider,
	Stepper,
	Step,
	StepLabel,
	Paper,
	CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import apiClient from '../../../../axiosConfig.js';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../../components/languages/LanguageSwitcher.jsx';
import { TENANT_ID, USER_ID } from '../../../constants.js';
import QorvaPricingTable from './QorvaPricingTable.jsx';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

const acceptedLanguages = ['en', 'fr', 'de', 'es', 'pt', 'it', 'nl'];

const STEPS_KEYS = ['registration.step1', 'registration.step2'];

const UserRegistration = () => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();

	const [step, setStep] = useState(0);
	const [userInfo, setUserInfo] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		companyName: '',
	});
	const [touched, setTouched] = useState({
		firstName: false,
		lastName: false,
		email: false,
		password: false,
		companyName: false,
	});
	const [errors, setErrors] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		companyName: '',
	});
	const [selectedPriceId, setSelectedPriceId] = useState('');
	const [formError, setFormError] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	const validate = (values) => {
		const next = { firstName: '', lastName: '', email: '', password: '', companyName: '' };
		if (!values.firstName?.trim()) next.firstName = t('registration.firstNameRequired', 'First name is required');
		if (!values.lastName?.trim()) next.lastName = t('registration.lastNameRequired', 'Last name is required');
		if (!values.companyName?.trim()) next.companyName = t('registration.companyNameRequired', 'Company name is required');
		if (!values.email) {
			next.email = t('registration.emailRequired', 'Email is required');
		} else if (!EMAIL_REGEX.test(values.email)) {
			next.email = t('registration.emailInvalid', 'Enter a valid business email');
		}
		if (!values.password) {
			next.password = t('registration.passwordRequired', 'Password is required');
		} else if (!PASSWORD_REGEX.test(values.password)) {
			next.password = t('registration.passwordInvalid', '8–20 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character');
		}
		return next;
	};

	const liveErrors = useMemo(() => validate(userInfo), [userInfo]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setUserInfo((prev) => ({ ...prev, [name]: value }));
	};

	const handleBlur = (field) => () => {
		setTouched((prev) => ({ ...prev, [field]: true }));
		setErrors((prev) => ({ ...prev, [field]: liveErrors[field] }));
	};

	const handleNext = () => {
		setFormError('');
		const finalErrors = validate(userInfo);
		setErrors(finalErrors);
		setTouched({ firstName: true, lastName: true, email: true, password: true, companyName: true });
		if (Object.values(finalErrors).some(Boolean)) return;
		setStep(1);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handleSubmit = async () => {
		if (!selectedPriceId) {
			setFormError(t('pricing.noPlanSelected', 'Please select a plan to continue.'));
			return;
		}
		setFormError('');
		setLoading(true);
		try {
			const currentLang = acceptedLanguages.includes(i18n.language) ? i18n.language : 'en';
			const response = await apiClient.post(
				import.meta.env.VITE_APP_API_REGISTER_URL,
				{ ...userInfo, priceId: selectedPriceId, languageCode: currentLang },
				{ headers: { 'Accept-Language': currentLang } }
			);
			if (response.status === 200) {
				localStorage.clear();
				localStorage.setItem(TENANT_ID, response.data?.data?.tenantId);
				localStorage.setItem(USER_ID, response.data?.data?.userId);
				localStorage.setItem('SELECTED_PRICE_ID', selectedPriceId);
				window.location.href = response.data?.data?.checkoutUrl;
			} else {
				setFormError(t('registration.errorMessage', 'Something went wrong. Please try again.'));
			}
		} catch (error) {
			const status = error?.response?.status;
			const backend = error?.response?.data;
			if (status >= 400 && status < 500) {
				setFormError(backend?.message || t('registration.clientError', 'Request error. Check your input.'));
			} else if (status >= 500) {
				setFormError(backend?.message || t('registration.serverError', 'Server error. Please try again later.'));
			} else {
				setFormError(backend?.message || t('registration.networkError', 'Network error. Check your connection.'));
			}
		} finally {
			setLoading(false);
		}
	};

	const trustItems = [
		{ title: t('registration.freeTrialTitle'), desc: t('registration.freeTrial') },
		{ title: t('registration.cancelAnytimeTitle'), desc: t('registration.cancelAnytime') },
		{ title: t('registration.dataDeletedTitle'), desc: t('registration.dataDeleted') },
	];

	return (
		<Box
			sx={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100vw',
				height: '100vh',
				overflowY: 'auto',
				overflowX: 'hidden',
				background: 'linear-gradient(135deg, #f0f4f8 0%, #e8edf2 100%)',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				pb: 6,
			}}
		>
			{/* Top bar */}
			<Box
				sx={{
					width: '100%',
					borderBottom: '1px solid rgba(226,232,240,0.8)',
					backgroundColor: 'rgba(255,255,255,0.75)',
					backdropFilter: 'blur(8px)',
					flexShrink: 0,
					position: 'sticky',
					top: 0,
					zIndex: 10,
				}}
			>
				<Box
					sx={{
						width: '100%',
						maxWidth: { xs: '100%', sm: '95%', md: '980px', lg: '1100px' },
						mx: 'auto',
						px: { xs: 3, md: 0 },
						py: 1.75,
						display: 'flex',
						alignItems: 'center',
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
						<Box component="img" src="/logo.svg" alt="Qorva" sx={{ width: 30, height: 30 }} />
						<Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
							Qorva
						</Typography>
					</Box>
					<Box sx={{ ml: 'auto' }}>
						<LanguageSwitcher />
					</Box>
				</Box>
			</Box>

			{/* Stepper */}
			<Box
				sx={{
					width: '100%',
					maxWidth: 1100,
					px: { xs: 2, md: 4 },
					pt: 4,
					pb: 2.5,
					transition: 'max-width 0.3s ease',
				}}
			>
				<Stepper
					activeStep={step}
					sx={{
						'& .MuiStepLabel-root .Mui-completed': { color: '#629C44' },
						'& .MuiStepLabel-root .Mui-active': { color: '#629C44' },
						'& .MuiStepIcon-root.Mui-active': { color: '#629C44' },
						'& .MuiStepIcon-root.Mui-completed': { color: '#629C44' },
					}}
				>
					{STEPS_KEYS.map((key, idx) => (
						<Step key={idx}>
							<StepLabel>{t(key)}</StepLabel>
						</Step>
					))}
				</Stepper>
			</Box>

			{/* Step 0: Account details */}
			{step === 0 && (
				<Box
					sx={{
						width: { xs: '100%', sm: '95%', md: '980px', lg: '1100px' },
						borderRadius: { xs: 0, sm: 3 },
						overflow: 'hidden',
						boxShadow: { xs: 'none', sm: '0 24px 64px rgba(0,0,0,0.14)' },
					}}
				>
					<Grid2 container>
						{/* Left: Form panel */}
						<Grid2
							size={{ xs: 12, md: 7 }}
							sx={{
								backgroundColor: '#ffffff',
								padding: { xs: '36px 28px', sm: '44px 52px' },
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
							}}
						>
							<Typography
								variant="h5"
								sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.03em', mb: 0.5 }}
							>
								{t('registration.title')}
							</Typography>
							<Typography variant="body2" sx={{ color: '#64748b', mb: 2.5 }}>
								{t('registration.panel.subtext')}
							</Typography>

							{formError && (
								<Alert
									severity="error"
									variant="filled"
									sx={{ mb: 2, borderRadius: 1.5, fontSize: '0.82rem' }}
								>
									{formError}
								</Alert>
							)}

							<Box component="form" noValidate onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
								<Grid2 container spacing={1.5}>
									<Grid2 size={{ xs: 12, sm: 6 }}>
										<TextField
											label={t('registration.firstName')}
											name="firstName"
											variant="outlined"
											fullWidth
											required
											size="small"
											value={userInfo.firstName}
											onChange={handleChange}
											onBlur={handleBlur('firstName')}
											error={Boolean(touched.firstName && liveErrors.firstName)}
											helperText={(touched.firstName && liveErrors.firstName) || ' '}
											sx={inputSx}
											slotProps={{
												input: {
													startAdornment: (
														<InputAdornment position="start">
															<PersonOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
														</InputAdornment>
													),
												},
											}}
										/>
									</Grid2>
									<Grid2 size={{ xs: 12, sm: 6 }}>
										<TextField
											label={t('registration.lastName')}
											name="lastName"
											variant="outlined"
											fullWidth
											required
											size="small"
											value={userInfo.lastName}
											onChange={handleChange}
											onBlur={handleBlur('lastName')}
											error={Boolean(touched.lastName && liveErrors.lastName)}
											helperText={(touched.lastName && liveErrors.lastName) || ' '}
											sx={inputSx}
											slotProps={{
												input: {
													startAdornment: (
														<InputAdornment position="start">
															<PersonOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
														</InputAdornment>
													),
												},
											}}
										/>
									</Grid2>
									<Grid2 size={{ xs: 12 }}>
										<TextField
											label={t('registration.email')}
											name="email"
											type="email"
											variant="outlined"
											fullWidth
											required
											size="small"
											value={userInfo.email}
											onChange={handleChange}
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
									</Grid2>
									<Grid2 size={{ xs: 12 }}>
										<TextField
											label={t('registration.password')}
											name="password"
											type={showPassword ? 'text' : 'password'}
											variant="outlined"
											fullWidth
											required
											size="small"
											value={userInfo.password}
											onChange={handleChange}
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
																aria-label={t('registration.togglePasswordVisibility')}
																sx={{ color: '#94a3b8' }}
															>
																{showPassword
																	? <VisibilityOff sx={{ fontSize: 18 }} />
																	: <Visibility sx={{ fontSize: 18 }} />}
															</IconButton>
														</InputAdornment>
													),
												},
											}}
										/>
									</Grid2>
									<Grid2 size={{ xs: 12 }}>
										<TextField
											label={t('registration.companyName')}
											name="companyName"
											variant="outlined"
											fullWidth
											required
											size="small"
											value={userInfo.companyName}
											onChange={handleChange}
											onBlur={handleBlur('companyName')}
											error={Boolean(touched.companyName && liveErrors.companyName)}
											helperText={(touched.companyName && liveErrors.companyName) || ' '}
											sx={{ ...inputSx, mb: 0 }}
											slotProps={{
												input: {
													startAdornment: (
														<InputAdornment position="start">
															<BusinessOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
														</InputAdornment>
													),
												},
											}}
										/>
									</Grid2>
								</Grid2>

								<Button
									type="submit"
									fullWidth
									variant="contained"
									sx={{
										mt: 2,
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
									}}
								>
									{t('registration.next', 'Next: Choose Plan')}
								</Button>
							</Box>

							<Divider sx={{ my: 2.5, borderColor: '#e2e8f0' }} />

							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Typography sx={{ color: '#64748b', fontSize: '0.82rem' }}>
									{t('registration.alreadyHaveAccount')}
									{' '}
									<Typography
										component="span"
										onClick={() => navigate('/login')}
										sx={{
											color: '#629C44',
											fontSize: '0.82rem',
											fontWeight: 600,
											cursor: 'pointer',
											'&:hover': { textDecoration: 'underline' },
										}}
									>
										{t('registration.signIn')}
									</Typography>
								</Typography>
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
								background: 'rgba(98,156,68,0.12)', pointerEvents: 'none',
							}} />
							<Box sx={{
								position: 'absolute', bottom: -80, left: -40,
								width: 280, height: 280, borderRadius: '50%',
								background: 'rgba(37,99,235,0.1)', pointerEvents: 'none',
							}} />

							<Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
								<Box sx={{
									display: 'inline-flex', alignItems: 'center', gap: 1,
									backgroundColor: 'rgba(98,156,68,0.18)',
									border: '1px solid rgba(98,156,68,0.35)',
									borderRadius: 5, px: 2, py: 0.6, mb: 3,
								}}>
									<Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#629C44' }} />
									<Typography sx={{ fontSize: '0.75rem', color: '#a3c988', fontWeight: 500 }}>
										{t('login.panel.badge')}
									</Typography>
								</Box>

								<Typography sx={{
									fontSize: '1.65rem', fontWeight: 700, color: '#ffffff',
									lineHeight: 1.3, letterSpacing: '-0.03em', mb: 3,
								}}>
									{t('registration.panel.headline')}
								</Typography>

								{trustItems.map((item) => (
									<Box key={item.title} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
										<Box sx={{
											width: 20, height: 20, mt: '2px', borderRadius: '50%', flexShrink: 0,
											backgroundColor: 'rgba(98,156,68,0.2)',
											border: '1px solid rgba(98,156,68,0.5)',
											display: 'flex', alignItems: 'center', justifyContent: 'center',
										}}>
											<Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#629C44' }} />
										</Box>
										<Box>
											<Typography sx={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 600, lineHeight: 1.3 }}>
												{item.title}
											</Typography>
											<Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
												{item.desc}
											</Typography>
										</Box>
									</Box>
								))}
							</Box>
						</Grid2>
					</Grid2>
				</Box>
			)}

			{/* Step 1: Plan selection */}
			{step === 1 && (
				<Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: '95%', md: '980px', lg: '1100px' }, px: { xs: 2, md: 4 } }}>
					<Paper
						sx={{
							p: { xs: 3, md: 4.5 },
							borderRadius: 3,
							boxShadow: '0 24px 64px rgba(0,0,0,0.1)',
						}}
					>
						<Box sx={{ textAlign: 'center', mb: 3.5 }}>
							<Typography
								sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.85rem' }, color: '#0f172a', letterSpacing: '-0.03em', mb: 0.75 }}
							>
								{t('pricing.chooseYourPlan', 'Choose Your Plan')}
							</Typography>
							<Typography sx={{ color: '#64748b', fontSize: '0.95rem', maxWidth: 500, mx: 'auto' }}>
								{t('pricing.stepSubtitle', 'Start free, upgrade when you\'re ready. Cancel anytime.')}
							</Typography>
						</Box>

						{formError && (
							<Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>
								{formError}
							</Alert>
						)}

						<QorvaPricingTable selectedPriceId={selectedPriceId} onSelectPlan={setSelectedPriceId} />

						<Divider sx={{ my: 3.5, borderColor: '#e2e8f0' }} />

						<Box sx={{
							display: 'flex',
							flexDirection: { xs: 'column-reverse', sm: 'row' },
							justifyContent: 'space-between',
							alignItems: 'stretch',
							gap: 1.5,
						}}>
							<Button
								variant="outlined"
								onClick={() => { setStep(0); setFormError(''); }}
								disabled={loading}
								sx={{
									borderRadius: 1.5,
									textTransform: 'none',
									fontWeight: 500,
									borderColor: '#e2e8f0',
									color: '#64748b',
									py: { xs: 1.3, sm: 1 },
									mt: 2,
									'&:hover': { borderColor: '#cbd5e1', backgroundColor: '#f8fafc' },
								}}
							>
								{t('registration.back', 'Back')}
							</Button>

							<Button
								variant="contained"
								onClick={handleSubmit}
								disabled={loading || !selectedPriceId}
								sx={{
									px: 4,
									py: 1.3,
									mt: 2,
									borderRadius: 1.5,
									fontWeight: 600,
									fontSize: '0.9rem',
									textTransform: 'none',
									backgroundColor: '#629C44',
									boxShadow: '0 2px 8px rgba(98,156,68,0.35)',
									'&:hover': {
										backgroundColor: '#518136',
										boxShadow: '0 4px 14px rgba(98,156,68,0.45)',
									},
									'&.Mui-disabled': { backgroundColor: '#b8d4a8', boxShadow: 'none' },
								}}
							>
								{loading
									? <CircularProgress size={20} sx={{ color: 'rgba(255,255,255,0.8)' }} />
									: t('registration.continueToCheckout', 'Continue to Checkout')}
							</Button>
						</Box>

						<Typography sx={{ mt: 2.5, color: '#94a3b8', fontSize: '0.72rem', textAlign: 'center' }}>
							{t('pricing.footer', 'Payments are securely processed by Stripe. You can cancel or change your plan at any time.')}
						</Typography>
					</Paper>
				</Box>
			)}
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

export default UserRegistration;
