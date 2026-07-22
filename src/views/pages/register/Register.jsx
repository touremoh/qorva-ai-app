import { useState, useMemo } from 'react';
import {
	Grid2,
	Typography,
	TextField,
	Button,
	Box,
	InputAdornment,
	Alert,
	MenuItem,
	Divider,
	CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { registerUser } from '../../../services/registrationService.js';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../../components/languages/LanguageSwitcher.jsx';
import { RECRUITMENT_TYPES, ORGANIZATION_SIZES } from '../../../constants.js';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

const UserRegistration = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [userInfo, setUserInfo] = useState({
		firstName: '',
		lastName: '',
		email: '',
		organizationName: '',
		recruitmentType: '',
		organizationSize: '',
	});
	const [touched, setTouched] = useState({});
	const [formError, setFormError] = useState('');
	const [accountExists, setAccountExists] = useState(false);
	const [loading, setLoading] = useState(false);

	const validate = (values) => {
		const next = {};
		if (!values.firstName?.trim()) next.firstName = t('registration.firstNameRequired', 'First name is required');
		if (!values.lastName?.trim()) next.lastName = t('registration.lastNameRequired', 'Last name is required');
		if (!values.organizationName?.trim()) next.organizationName = t('registration.organizationNameRequired', 'Organization name is required');
		if (!values.recruitmentType) next.recruitmentType = t('registration.recruitmentTypeRequired', 'Please select a recruitment type');
		if (!values.organizationSize) next.organizationSize = t('registration.organizationSizeRequired', 'Please select an organization size');
		if (!values.email) {
			next.email = t('registration.emailRequired', 'Email is required');
		} else if (!EMAIL_REGEX.test(values.email)) {
			next.email = t('registration.emailInvalid', 'Enter a valid business email');
		}
		return next;
	};

	const liveErrors = useMemo(() => validate(userInfo), [userInfo]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setUserInfo((prev) => ({ ...prev, [name]: value }));
		if (accountExists) setAccountExists(false);
	};

	const handleBlur = (field) => () => {
		setTouched((prev) => ({ ...prev, [field]: true }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setFormError('');
		setAccountExists(false);
		const finalErrors = validate(userInfo);
		setTouched({
			firstName: true, lastName: true, email: true,
			organizationName: true, recruitmentType: true, organizationSize: true,
		});
		if (Object.keys(finalErrors).length) return;

		setLoading(true);
		try {
			const response = await registerUser(userInfo);
			if (response.status === 200 && response.data?.data?.success) {
				navigate('/success', { state: { email: userInfo.email } });
			} else {
				setFormError(t('registration.errorMessage', 'Something went wrong. Try again.'));
			}
		} catch (error) {
			const status = error?.response?.status;
			const backend = error?.response?.data;
			if (status === 406 || backend?.errorCode === 'error.user.already_exists') {
				setAccountExists(true);
			} else if (status >= 400 && status < 500) {
				setFormError(backend?.message || t('registration.clientError', 'Request error. Check your input.'));
			} else if (status >= 500) {
				setFormError(backend?.message || t('registration.serverError', 'Server issue. Please try later.'));
			} else {
				setFormError(backend?.message || t('registration.networkError', 'Network issue. Check your connection.'));
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
						maxWidth: { xs: '100%', sm: '95%', md: '860px', lg: '920px' },
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

			<Box
				sx={{
					width: { xs: '100%', sm: '95%', md: '860px', lg: '920px' },
					mt: { xs: 0, sm: 4 },
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
							{t('registration.demoSubtext', 'Create your free demo workspace — no credit card, no payment.')}
						</Typography>

						{formError && (
							<Alert severity="error" variant="filled" sx={{ mb: 2, borderRadius: 1.5, fontSize: '0.82rem' }}>
								{formError}
							</Alert>
						)}

						{accountExists && (
							<Alert
								severity="info"
								sx={{ mb: 2, borderRadius: 1.5, fontSize: '0.82rem' }}
								action={
									<Button color="inherit" size="small" onClick={() => navigate('/login')}>
										{t('registration.signIn', 'Sign in')}
									</Button>
								}
							>
								{t('registration.accountExists', 'An account with this email already exists. Please log in.')}
							</Alert>
						)}

						<Box component="form" noValidate onSubmit={handleSubmit}>
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
										label={t('registration.organizationName')}
										name="organizationName"
										variant="outlined"
										fullWidth
										required
										size="small"
										value={userInfo.organizationName}
										onChange={handleChange}
										onBlur={handleBlur('organizationName')}
										error={Boolean(touched.organizationName && liveErrors.organizationName)}
										helperText={(touched.organizationName && liveErrors.organizationName) || ' '}
										sx={inputSx}
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
								<Grid2 size={{ xs: 12 }}>
									<TextField
										select
										label={t('registration.recruitmentType')}
										name="recruitmentType"
										variant="outlined"
										fullWidth
										required
										size="small"
										value={userInfo.recruitmentType}
										onChange={handleChange}
										onBlur={handleBlur('recruitmentType')}
										error={Boolean(touched.recruitmentType && liveErrors.recruitmentType)}
										helperText={(touched.recruitmentType && liveErrors.recruitmentType) || ' '}
										sx={inputSx}
										slotProps={{
											input: {
												startAdornment: (
													<InputAdornment position="start">
														<WorkOutlineOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
													</InputAdornment>
												),
											},
										}}
									>
										{RECRUITMENT_TYPES.map((value) => (
											<MenuItem key={value} value={value}>
												{t(`recruitment.${value}`)}
											</MenuItem>
										))}
									</TextField>
								</Grid2>
								<Grid2 size={{ xs: 12 }}>
									<TextField
										select
										label={t('registration.organizationSize')}
										name="organizationSize"
										variant="outlined"
										fullWidth
										required
										size="small"
										value={userInfo.organizationSize}
										onChange={handleChange}
										onBlur={handleBlur('organizationSize')}
										error={Boolean(touched.organizationSize && liveErrors.organizationSize)}
										helperText={(touched.organizationSize && liveErrors.organizationSize) || ' '}
										sx={{ ...inputSx, mb: 0 }}
										slotProps={{
											input: {
												startAdornment: (
													<InputAdornment position="start">
														<GroupsOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
													</InputAdornment>
												),
											},
										}}
									>
										{ORGANIZATION_SIZES.map((size) => (
											<MenuItem key={size} value={size}>
												{t('registration.orgSizeEmployees', '{{size}} employees', { size })}
											</MenuItem>
										))}
									</TextField>
								</Grid2>
							</Grid2>

							<Button
								type="submit"
								fullWidth
								variant="contained"
								disabled={loading}
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
									'&.Mui-disabled': { backgroundColor: '#b8d4a8', boxShadow: 'none' },
								}}
							>
								{loading
									? <CircularProgress size={20} sx={{ color: 'rgba(255,255,255,0.8)' }} />
									: t('registration.createDemoAccount', 'Create Free Demo Account')}
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
