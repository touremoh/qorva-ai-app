import React, { useState, useMemo } from "react";
import {
	Container,
	Grid2,
	Typography,
	TextField,
	Button,
	Box,
	InputAdornment,
	Alert,
	IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CircularProgress from "@mui/material/CircularProgress";
import apiClient from "../../../../axiosConfig.js";

import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../../components/languages/LanguageSwitcher.jsx';
import { setAuthResults } from "../../../../localStorageManager.js";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

const Login = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false); // NEW toggle state
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
		} else if (!PASSWORD_REGEX.test(values.password)) {
			next.password = t(
				'login.passwordInvalid',
				'8–20 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character'
			);
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
			const response = await apiClient.post(import.meta.env.VITE_APP_API_LOGIN_URL, {
				email,
				rawPassword: password,
			});

			if (response.status === 200) {
				setAuthResults(response.data.data);
				navigate('/');
			} else {
				setFormError(
					t('errors.unexpected', 'Something went wrong. Please try again.')
				);
			}
		} catch (error) {
			const status = error?.response?.status;
			const backend = error?.response?.data;
			if (status === 401) {
				setFormError(
					backend?.message ||
					t('login.invalidCredentials', 'Invalid email or password')
				);
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
		<Container
			maxWidth="xl"
			sx={{
				marginLeft: { xs: 0, md: '5%' },
				marginRight: { xs: 0, md: '5%' },
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100vh'
			}}
		>
			<Box sx={{ width: '100%', maxWidth: { xs: '100vw', md: '100vw' }, boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
				<Grid2 container>
					{/* Part 1: Login Form */}
					<Grid2
						item
						xs={12}
						md={6}
						sx={{
							backgroundColor: 'white',
							padding: { xs: 4, md: 5 },
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center',
							color: '#232F3E'
						}}
					>
						<Typography variant="h4" gutterBottom>
							{t('login.title')}
						</Typography>
						<Typography variant="subtitle1" gutterBottom>
							{t('login.subtitle')}
						</Typography>

						{formError && (
							<Box sx={{ width: '100%', maxWidth: '700px', mt: 2 }}>
								<Alert severity="error" variant="filled">{formError}</Alert>
							</Box>
						)}

						<Box component="form" sx={{ mt: 3, width: '100%', maxWidth: '700px' }} onSubmit={handleLogin} noValidate>
							<TextField
								label={t('login.emailLabel')}
								variant="filled"
								fullWidth
								required
								margin="normal"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								onBlur={handleBlur('email')}
								error={Boolean(touched.email && (errors.email || liveErrors.email))}
								helperText={(touched.email && (errors.email || liveErrors.email)) || ' '}
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
								type={showPassword ? "text" : "password"}   // NEW toggle
								variant="filled"
								fullWidth
								required
								margin="normal"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								onBlur={handleBlur('password')}
								error={Boolean(touched.password && (errors.password || liveErrors.password))}
								helperText={(touched.password && (errors.password || liveErrors.password)) || ' '}
								slotProps={{
									input: {
										startAdornment: (
											<InputAdornment position="start">
												<LockIcon style={{ color: 'green' }} />
											</InputAdornment>
										),
										endAdornment: ( // NEW toggle button
											<InputAdornment position="end">
												<IconButton
													onClick={() => setShowPassword((prev) => !prev)}
													edge="end"
													aria-label={t('login.togglePasswordVisibility', 'Toggle password visibility')}
												>
													{showPassword ? <VisibilityOff /> : <Visibility />}
												</IconButton>
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
								disabled={loading}
							>
								{loading ? <CircularProgress size={24} color="inherit" /> : t('login.signInButton')}
							</Button>

							<Box sx={{ mt: 3 }}>
								<LanguageSwitcher />
							</Box>
						</Box>
					</Grid2>

					{/* Part 2: Sign Up Invitation */}
					<Grid2
						item
						xs={12}
						md={6}
						sx={{
							backgroundColor: '#232F3E',
							color: '#ffffff',
							padding: { xs: 4, md: 5 },
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Typography variant="h6" gutterBottom>
							{t('login.noAccount')}
						</Typography>
						<Button
							variant="outlined"
							sx={{ color: 'white', borderColor: 'white' }}
							onClick={() => navigate('/register')}
						>
							{t('login.signUpButton')}
						</Button>
					</Grid2>
				</Grid2>
			</Box>
		</Container>
	);
};

export default Login;
