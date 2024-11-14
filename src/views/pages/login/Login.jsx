import React, { useState } from "react";
import { Container, Grid2, Typography, TextField, Button, Box, InputAdornment, MenuItem, Select, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../../components/languages/LanguageSwitcher.jsx';

const Login = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSignUpClick = () => {
		navigate('/register');
	};

	const handleSignInClick = async (e) => {
		e.preventDefault();
		try {
			// Encrypt the password (dummy method for now)
			const encryptedPassword = encryptPassword(password);

			// Send login data to backend
			const response = await axios.post(`${process.env.REACT_APP_API_LOGIN_URL}`, {
				email,
				password: encryptedPassword
			});

			if (response.status === 200) {
				navigate('/');
			}
		} catch (error) {
			console.error("Login failed", error);
		}
	};

	const encryptPassword = (password) => {
		// Dummy encryption logic - to be updated later
		return password.split('').reverse().join('');
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
						<Box component="form" sx={{ mt: 3, width: '100%', maxWidth: '700px' }} onSubmit={handleSignInClick}>
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
							<Button type="submit" fullWidth variant="contained" sx={{ backgroundColor: '#629C44', mt: 2 }}>
								{t('login.signInButton')}
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
