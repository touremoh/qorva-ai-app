import { useState, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
	Box,
	Container,
	Paper,
	Typography,
	TextField,
	Button,
	Stack,
	InputAdornment,
	CircularProgress,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import { useTranslation } from 'react-i18next';
import { resendActivation } from '../../../services/authService.js';
import LanguageSwitcher from '../../../components/languages/LanguageSwitcher.jsx';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

const ResendActivation = () => {
	const { t } = useTranslation();
	const [email, setEmail] = useState('');
	const [touched, setTouched] = useState(false);
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);

	const emailError = useMemo(() => {
		if (!email) return t('resendActivation.emailRequired', 'Email is required');
		if (!EMAIL_REGEX.test(email)) return t('resendActivation.emailInvalid', 'Please enter a valid email address');
		return '';
	}, [email, t]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setTouched(true);
		if (emailError) return;
		setLoading(true);
		try {
			// Always resolves with { data: true } — no account enumeration.
			await resendActivation(email);
		} catch {
			// Intentionally ignored: never reveal whether the account exists.
		} finally {
			setLoading(false);
			setSent(true);
		}
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
					{sent ? (
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
								<MarkEmailReadRoundedIcon sx={{ fontSize: 46, color: '#fff' }} />
							</Box>
							<Stack spacing={1}>
								<Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
									{t('resendActivation.sentTitle', 'Check your inbox')}
								</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
									{t('resendActivation.sentMessage', "If that email exists, we've sent a link to activate your account and set your password.")}
								</Typography>
							</Stack>
							<Button
								component={RouterLink}
								to="/login"
								variant="contained"
								sx={{
									mt: 1, px: 4, py: 1.2, borderRadius: 1.5,
									textTransform: 'none', fontWeight: 700,
									backgroundColor: '#629C44',
									boxShadow: '0 2px 8px rgba(98,156,68,0.35)',
									'&:hover': { backgroundColor: '#518136' },
								}}
							>
								{t('resendActivation.backToLogin', 'Back to login')}
							</Button>
						</Stack>
					) : (
						<>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
								<Box component="img" src="/logo.svg" alt="Qorva" sx={{ width: 34, height: 34 }} />
								<Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#0f172a' }}>Qorva</Typography>
							</Box>

							<Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.03em', mb: 0.75 }}>
								{t('resendActivation.title', 'Resend activation link')}
							</Typography>
							<Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
								{t('resendActivation.subtitle', "Enter your email and we'll send you a fresh link to activate your account and set your password.")}
							</Typography>

							<Box component="form" onSubmit={handleSubmit} noValidate>
								<TextField
									label={t('resendActivation.emailLabel', 'Work email')}
									type="email"
									variant="outlined"
									fullWidth
									required
									size="small"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									onBlur={() => setTouched(true)}
									error={Boolean(touched && emailError)}
									helperText={(touched && emailError) || ' '}
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
										: t('resendActivation.submit', 'Send link')}
								</Button>
							</Box>

							<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
								<Typography
									component={RouterLink}
									to="/login"
									sx={{ color: '#629C44', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
								>
									{t('resendActivation.backToLogin', 'Back to login')}
								</Typography>
								<LanguageSwitcher />
							</Stack>
						</>
					)}
				</Paper>
			</Container>
		</Box>
	);
};

const inputSx = {
	mb: 0.5,
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

export default ResendActivation;
