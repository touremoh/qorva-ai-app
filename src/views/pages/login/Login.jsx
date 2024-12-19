import React, { useState } from "react";
import { Container, Grid2, Typography, TextField, Button, Box, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import CircularProgress from "@mui/material/CircularProgress";
import apiClient from "../../../../axiosConfig.js";

import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../../components/languages/LanguageSwitcher.jsx';

const Login = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false); // State for loader

	const handleSignUpClick = () => {
		navigate('/register');
	};

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true); // Show loader
		try {
			const response = await apiClient.post(import.meta.env.VITE_APP_API_LOGIN_URL, {
				email: email,
				rawPassword: password,
			});

			if (response.status === 200 && response.data?.data?.access_token) {
				const { access_token, expires_in } = response.data.data;

				// Save the access token and expiration time in localStorage
				localStorage.setItem('authToken', access_token);
				localStorage.setItem('tokenExpiry', expires_in);

				console.log('Login successful. Access token saved.');

				// Redirect to the home page
				navigate('/');
			} else {
				console.error('Unexpected response format', response);
				// Redirect to the error page
				navigate('/error', {
					state: {
						errorCode: response.status,
						errorMessage: t('errors.generic.message')
					},
				});
			}
		} catch (error) {
			console.error('Login failed:', error.message);
			// Redirect to the error page
			navigate('/error', {
				state: {
					errorCode: error.response?.status || 500,
					errorMessage: error.message || t('errors.generic.message')
				},
			});
		} finally {
			setLoading(false); // Hide loader
		}
	};

	return (
		<Container maxWidth="xl" sx={{
			marginLeft: { xs: 0, md: '5%' },
			marginRight: { xs: 0, md: '5%' },
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			height: '100vh'
		}}>
			<Box sx={{ width: '100%', maxWidth: { xs: '100vw', md: '100vw' }, boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
				<Grid2 container>
					{/* Part 1: Login Form */}
					<Grid2 item xs={12} md={6} sx={{ backgroundColor: 'white', padding: { xs: 4, md: 5 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#232F3E' }}>
						<Typography variant="h4" gutterBottom>
							{t('login.title')}
						</Typography>
						<Typography variant="subtitle1" gutterBottom>
							{t('login.subtitle')}
						</Typography>
						<Box component="form" sx={{ mt: 3, width: '100%', maxWidth: '700px' }} onSubmit={handleLogin}>
							<TextField
								label={t('login.emailLabel')}
								variant="filled"
								fullWidth
								required
								margin="normal"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
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
							<TextField
								label={t('login.passwordLabel')}
								type="password"
								variant="filled"
								fullWidth
								required
								margin="normal"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								slotProps={{
									input: {
										startAdornment: (
											<InputAdornment position="start">
												<LockIcon style={{ color: 'green' }} />
											</InputAdornment>
										)
									}
								}}
							/>
							<Button
								type="submit"
								fullWidth
								variant="contained"
								sx={{ backgroundColor: '#629C44', mt: 2 }}
								disabled={loading} // Disable button during loading
							>
								{loading ? <CircularProgress size={24} color="inherit" /> : t('login.signInButton')}
							</Button>
							<Box sx={{ mt: 3 }}>
								<LanguageSwitcher />
							</Box>
						</Box>
					</Grid2>

					{/* Part 2: Sign Up Invitation */}
					<Grid2 item xs={12} md={6} sx={{ backgroundColor: '#232F3E', color: '#ffffff', padding: { xs: 4, md: 5 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
						<Typography variant="h6" gutterBottom>
							{t('login.noAccount')}
						</Typography>
						<Button variant="outlined" sx={{ color: 'white', borderColor: 'white' }} onClick={handleSignUpClick}>
							{t('login.signUpButton')}
						</Button>
					</Grid2>
				</Grid2>
			</Box>
		</Container>
	);
};

export default Login;
