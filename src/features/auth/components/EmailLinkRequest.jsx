import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
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
import { resendActivation, forgotPassword } from '../api/authService.js';
import LanguageSwitcher from '../../../components/languages/LanguageSwitcher.jsx';
import { EMAIL_REGEX } from '../../../shared/lib/validators.js';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';


// One "enter your email, we'll send you a link" page for both public flows.
// The variant picks the endpoint and the i18n namespace; layout and behaviour are identical.
const VARIANTS = {
	activation: {
		request: resendActivation,
		ns: 'resendActivation',
		defaults: {
			title: 'Resend activation link',
			subtitle: "Enter your email and we'll send you a fresh link to activate your account and set your password.",
			sentMessage: "If that email exists, we've sent a link to activate your account and set your password.",
			submit: 'Send link',
		},
	},
	forgot: {
		request: forgotPassword,
		ns: 'forgotPassword',
		defaults: {
			title: 'Forgot your password?',
			subtitle: "Enter your email and we'll send you a link to choose a new password.",
			sentMessage: "If that email exists, we've sent a link to reset your password. It's valid for 1 hour.",
			submit: 'Send reset link',
		},
	},
};

const EmailLinkRequest = ({ variant = 'activation' }) => {
	const { t } = useTranslation();
	const { request, ns, defaults } = VARIANTS[variant] ?? VARIANTS.activation;
	const [email, setEmail] = useState('');
	const [touched, setTouched] = useState(false);
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);

	const emailError = useMemo(() => {
		if (!email) return t(`${ns}.emailRequired`, 'Email is required');
		if (!EMAIL_REGEX.test(email)) return t(`${ns}.emailInvalid`, 'Please enter a valid email address');
		return '';
	}, [email, t, ns]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setTouched(true);
		if (emailError) return;
		setLoading(true);
		try {
			// Always resolves with { data: true } — no account enumeration.
			await request(email);
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
				background: `linear-gradient(135deg, ${tokens.surface.cool} 0%, ${tokens.surface.coolDeep} 100%)`,
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
									backgroundColor: tokens.brand.main,
									boxShadow: `0 10px 30px ${alpha(tokens.brand.main, 0.35)}`,
								}}
								aria-hidden
							>
								<MarkEmailReadRoundedIcon sx={{ fontSize: 46, color: tokens.ink.inverse }} />
							</Box>
							<Stack spacing={1}>
								<Typography variant="h5" sx={{ fontWeight: 800, color: tokens.ink.strong, letterSpacing: '-0.03em' }}>
									{t(`${ns}.sentTitle`, 'Check your inbox')}
								</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
									{t(`${ns}.sentMessage`, defaults.sentMessage)}
								</Typography>
							</Stack>
							<Button
								component={RouterLink}
								to="/login"
								variant="contained"
								sx={{
									mt: 1, px: 4, py: 1.2, borderRadius: 1.5,
									textTransform: 'none', fontWeight: 700,
									backgroundColor: tokens.brand.main,
									boxShadow: `0 2px 8px ${alpha(tokens.brand.main, 0.35)}`,
									'&:hover': { backgroundColor: tokens.brand.hoverAlt },
								}}
							>
								{t(`${ns}.backToLogin`, 'Back to login')}
							</Button>
						</Stack>
					) : (
						<>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
								<Box component="img" src="/logo.svg" alt="Qorva" sx={{ width: 34, height: 34 }} />
								<Typography sx={{ fontWeight: 700, fontSize: tokens.fontSize.xl, color: tokens.ink.strong }}>Qorva</Typography>
							</Box>

							<Typography variant="h5" sx={{ fontWeight: 700, color: tokens.ink.strong, letterSpacing: '-0.03em', mb: 0.75 }}>
								{t(`${ns}.title`, defaults.title)}
							</Typography>
							<Typography variant="body2" sx={{ color: tokens.ink.muted, mb: 3 }}>
								{t(`${ns}.subtitle`, defaults.subtitle)}
							</Typography>

							<Box component="form" onSubmit={handleSubmit} noValidate>
								<TextField
									label={t(`${ns}.emailLabel`, 'Work email')}
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
									sx={fieldSpacingSx}
									slotProps={{
										input: {
											startAdornment: (
												<InputAdornment position="start">
													<EmailOutlinedIcon sx={{ fontSize: tokens.iconSize.lg, color: tokens.ink.subtle }} />
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
										fontWeight: 600, fontSize: tokens.fontSize.body, textTransform: 'none',
										backgroundColor: tokens.brand.main,
										boxShadow: `0 2px 8px ${alpha(tokens.brand.main, 0.35)}`,
										'&:hover': { backgroundColor: tokens.brand.hoverAlt, boxShadow: `0 4px 14px ${alpha(tokens.brand.main, 0.45)}` },
										'&.Mui-disabled': { backgroundColor: tokens.brand.soft, boxShadow: 'none' },
									}}
								>
									{loading
										? <CircularProgress size={20} sx={{ color: 'rgba(255,255,255,0.8)' }} />
										: t(`${ns}.submit`, defaults.submit)}
								</Button>
							</Box>

							<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
								<Typography
									component={RouterLink}
									to="/login"
									sx={{ color: tokens.brand.text, fontSize: tokens.fontSize.body2, fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
								>
									{t(`${ns}.backToLogin`, 'Back to login')}
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

// Field look comes from the theme (MuiOutlinedInput); only the spacing is set here.
const fieldSpacingSx = { mb: 0.5 };

EmailLinkRequest.propTypes = {
	variant: PropTypes.oneOf(['activation', 'forgot']),
};

export default EmailLinkRequest;
