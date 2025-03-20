// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { Grid2, Typography, TextField, Button, Box, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../../axiosConfig.js';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../../components/languages/LanguageSwitcher.jsx';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import BusinessIcon from '@mui/icons-material/Business';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const UserRegistration = () => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const [userInfo, setUserInfo] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		companyName: ''
	});
	const [showPassword, setShowPassword] = useState(false);
	const [currentMessage, setCurrentMessage] = useState(0);
	const [loading, setLoading] = useState(false); // State for loader
	const messages = [
		{
			title: t('registration.freeTrialTitle'),
			message: t('registration.freeTrial')
		},
		{
			title: t('registration.cancelAnytimeTitle'),
			message: t('registration.cancelAnytime')
		},
		{
			title: t('registration.dataDeletedTitle'),
			message: t('registration.dataDeleted')
		}
	];

	// List of accepted languages
	const acceptedLanguages = ['en', 'fr', 'de', 'es', 'pt', 'it', 'nl'];

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentMessage((prev) => (prev + 1) % messages.length);
		}, 5000);
		return () => clearInterval(interval);
	}, [messages.length]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setUserInfo((prevState) => ({ ...prevState, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true); // Show loader
		try {
			// Detect the current language and set it in the headers
			const currentLang = acceptedLanguages.includes(i18n.language) ? i18n.language : 'en';

			const response = await apiClient.post(
				import.meta.env.VITE_APP_API_REGISTER_URL,
				userInfo,
				{
					headers: {
						'Accept-Language': currentLang,
					},
				}
			);

			if (response.status === 200) {
				navigate('/success');
			} else {
				navigate('/error', {
					state: {
						errorCode: response.status,
						errorMessage: t('registration.errorMessage'),
					},
				});
			}
		} catch (error) {
			console.error('Registration failed', error);
			navigate('/error', {
				state: {
					errorCode: error.response?.status || 500,
					errorMessage: error.message || t('registration.errorMessage'),
				},
			});
		} finally {
			setLoading(false); // Hide loader
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword((prev) => !prev);
	};

	return (
		<Grid2 container sx={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'absolute', top: 0, left: 0 }}>
			{/* Section 1: Animated Sales Messages */}
			<Grid2 item xs={4.8} sx={{ width: '40%', height: '100%', backgroundColor: '#232F3E', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
				<Typography variant="h4" align="center" gutterBottom sx={{ color: '#FF9900', fontFamily: 'Arial' }}>
					{messages[currentMessage].title}
				</Typography>
				<Typography variant="h5" align="center" sx={{ fontStyle: 'italic', fontFamily: 'Arial' }}>
					{messages[currentMessage].message}
				</Typography>
			</Grid2>

			{/* Section 2: User Registration Form */}
			<Grid2 item xs={7.2} sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', justifyContent: 'center', width: '60%' }}>
				<Box sx={{ boxShadow: 3, borderRadius: 2, padding: 4, color: '#232F3E', backgroundColor: 'white', width: '60%' }}>
					<Typography variant="h4" gutterBottom>
						{t('registration.title')}
					</Typography>
					<form onSubmit={handleSubmit}>
						<Grid2 container spacing={2}>
							<Grid2 item xs={12} sx={{ width: '48.5%' }}>
								<TextField
									label={t('registration.firstName')}
									name="firstName"
									variant="filled"
									fullWidth
									required
									value={userInfo.firstName}
									onChange={handleChange}
									slotProps={{
										input: {
											startAdornment: (
												<InputAdornment position="start">
													<PersonIcon style={{ color: 'green' }} />
												</InputAdornment>
											)
										}
									}}
								/>
							</Grid2>
							<Grid2 item xs={12} sx={{ width: '48.5%' }}>
								<TextField
									label={t('registration.lastName')}
									name="lastName"
									variant="filled"
									fullWidth
									required
									value={userInfo.lastName}
									onChange={handleChange}
									slotProps={{
										input: {
											startAdornment: (
												<InputAdornment position="start">
													<PersonIcon style={{ color: 'green' }} />
												</InputAdornment>
											)
										}
									}}
								/>
							</Grid2>
							<Grid2 item xs={12} sx={{ width: '100%' }}>
								<TextField
									label={t('registration.email')}
									name="email"
									type="email"
									variant="filled"
									fullWidth
									required
									value={userInfo.email}
									onChange={handleChange}
									slotProps={{
										input: {
											startAdornment: (
												<InputAdornment position="start">
													<EmailIcon style={{ color: 'green' }} />
												</InputAdornment>
											)
										}
									}}
								/>
							</Grid2>
							<Grid2 item xs={12} sx={{ width: '100%' }}>
								<TextField
									label={t('registration.password')}
									name="password"
									type={showPassword ? 'text' : 'password'}
									variant="filled"
									fullWidth
									required
									value={userInfo.password}
									onChange={handleChange}
									slotProps={{
										input: {
											startAdornment: (
												<InputAdornment position="start">
													<LockIcon style={{ color: 'green' }} />
												</InputAdornment>
											),
											endAdornment: (
												<InputAdornment position="end">
													<IconButton onClick={togglePasswordVisibility} edge="end">
														{showPassword ? <VisibilityOff /> : <Visibility />}
													</IconButton>
												</InputAdornment>
											)
										}
									}}
								/>
							</Grid2>
							<Grid2 item xs={12} sx={{ width: '100%' }}>
								<TextField
									label={t('registration.companyName')}
									name="companyName"
									variant="filled"
									fullWidth
									required
									value={userInfo.companyName}
									onChange={handleChange}
									slotProps={{
										input: {
											startAdornment: (
												<InputAdornment position="start">
													<BusinessIcon style={{ color: 'green' }} />
												</InputAdornment>
											)
										}
									}}
								/>
							</Grid2>
						</Grid2>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 4, backgroundColor: '#629C44' }}
							disabled={loading} // Disable button during loading
						>
							{loading ? <CircularProgress size={24} color="inherit" /> : t('registration.registerButton')}
						</Button>
						<Box sx={{ mt: 2 }}>
							<LanguageSwitcher />
						</Box>
					</form>
				</Box>
			</Grid2>
		</Grid2>
	);
};

export default UserRegistration;
