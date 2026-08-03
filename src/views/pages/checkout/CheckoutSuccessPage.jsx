import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
	Box,
	Container,
	Paper,
	Typography,
	Button,
	Stack,
	Divider,
	CircularProgress,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import { useTranslation } from 'react-i18next';
import { getCheckoutSuccess } from '../../../services/stripeService.js';
import { refreshToken } from '../../../services/authService.js';
import { setAuthResults } from '../../../../localStorageManager.js';
import { isDemoUser } from '../../../utils/demoMode.js';
import { AUTH_TOKEN } from '../../../constants.js';

// Activation is driven by a Stripe webhook and may lag a few seconds after the
// browser returns from Checkout, so we poll the token refresh endpoint until
// userAccountStatus flips from DEMO to ACTIVE.
const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 24; // ~60s

const CheckoutSuccessPage = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const hasToken = Boolean(localStorage.getItem(AUTH_TOKEN));
	// phase: 'activating' | 'active' | 'timeout' | 'legacy'
	const [phase, setPhase] = useState(hasToken ? 'activating' : 'legacy');
	const pollsRef = useRef(0);
	const timerRef = useRef(null);

	useEffect(() => {
		const sessionId = searchParams.get('session_id');
		// Best-effort backend notification (safe to ignore failures).
		getCheckoutSuccess(sessionId).catch(() => {});

		// No auth token → this is not an in-app demo upgrade; fall back to the
		// legacy "sign in" confirmation.
		if (!hasToken) return;

		const poll = async () => {
			pollsRef.current += 1;
			try {
				const response = await refreshToken();
				if (response.status === 200 && response.data?.data) {
					setAuthResults(response.data.data);
					if (!isDemoUser()) {
						setPhase('active');
						return;
					}
				}
			} catch {
				// keep polling — activation may still be settling
			}
			if (pollsRef.current >= MAX_POLLS) {
				setPhase('timeout');
				return;
			}
			timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
		};

		poll();
		return () => clearTimeout(timerRef.current);
	}, []);

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
					{phase === 'activating' ? (
						<Stack spacing={3} alignItems="center" textAlign="center">
							<CircularProgress sx={{ color: '#629C44' }} />
							<Stack spacing={1}>
								<Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
									{t('checkoutSuccess.activatingTitle', 'Activating your trial…')}
								</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
									{t('checkoutSuccess.activatingSubtitle', "We're confirming your payment and unlocking full access. This only takes a few seconds.")}
								</Typography>
							</Stack>
						</Stack>
					) : phase === 'active' ? (
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
								<RocketLaunchRoundedIcon sx={{ fontSize: 46, color: '#fff' }} />
							</Box>
							<Stack spacing={1}>
								<Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
									{t('checkoutSuccess.trialStartedTitle', 'Trial started!')}
								</Typography>
								<Typography variant="body1" color="text.secondary" sx={{ maxWidth: 440 }}>
									{t('checkoutSuccess.trialStartedSubtitle', 'Your 14-day free trial is active and full access is unlocked. Your workspace is ready for real data.')}
								</Typography>
							</Stack>
							<Divider flexItem />
							<Button
								onClick={() => navigate('/')}
								variant="contained"
								size="large"
								startIcon={<RocketLaunchRoundedIcon />}
								sx={{
									mt: 1, px: 4, py: 1.25, borderRadius: 1.5,
									textTransform: 'none', fontWeight: 700,
									backgroundColor: '#629C44',
									boxShadow: '0 2px 8px rgba(98,156,68,0.35)',
									'&:hover': { backgroundColor: '#518136', boxShadow: '0 4px 14px rgba(98,156,68,0.45)' },
								}}
							>
								{t('checkoutSuccess.goToWorkspace', 'Go to your workspace')}
							</Button>
						</Stack>
					) : phase === 'timeout' ? (
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
								<CheckCircleRoundedIcon sx={{ fontSize: 46, color: '#fff' }} />
							</Box>
							<Stack spacing={1}>
								<Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
									{t('checkoutSuccess.pendingTitle', 'Payment received')}
								</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440 }}>
									{t('checkoutSuccess.pendingSubtitle', "Your trial is being activated. It can take a moment — open your workspace and it'll unlock automatically.")}
								</Typography>
							</Stack>
							<Button
								onClick={() => navigate('/')}
								variant="contained"
								size="large"
								sx={{
									mt: 1, px: 4, py: 1.25, borderRadius: 1.5,
									textTransform: 'none', fontWeight: 700,
									backgroundColor: '#629C44',
									boxShadow: '0 2px 8px rgba(98,156,68,0.35)',
									'&:hover': { backgroundColor: '#518136' },
								}}
							>
								{t('checkoutSuccess.goToWorkspace', 'Go to your workspace')}
							</Button>
						</Stack>
					) : (
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
								<CheckCircleRoundedIcon sx={{ fontSize: 50, color: '#fff' }} />
							</Box>
							<Stack spacing={1}>
								<Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
									{t('checkoutSuccess.title', 'Payment Successful!')}
								</Typography>
								<Typography variant="body1" color="text.secondary">
									{t('checkoutSuccess.subtitle', 'Your subscription is now active. Welcome to Qorva AI!')}
								</Typography>
							</Stack>
							<Divider flexItem />
							<Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
								{t('checkoutSuccess.emailNote', "We've sent a confirmation email to your inbox. Sign in to start hiring smarter.")}
							</Typography>
							<Button
								component={RouterLink}
								to="/login"
								variant="contained"
								size="large"
								startIcon={<LoginRoundedIcon />}
								sx={{
									mt: 1, px: 4, py: 1.25, borderRadius: 1.5,
									textTransform: 'none', fontWeight: 700,
									backgroundColor: '#629C44',
									boxShadow: '0 2px 8px rgba(98,156,68,0.35)',
									'&:hover': { backgroundColor: '#518136', boxShadow: '0 4px 14px rgba(98,156,68,0.45)' },
								}}
							>
								{t('checkoutSuccess.cta', 'Sign In to Qorva')}
							</Button>
							<Typography variant="caption" color="text.secondary">
								{t('checkoutSuccess.help', 'Need help? Contact us at support@qorva.ai')}
							</Typography>
						</Stack>
					)}
				</Paper>
			</Container>
		</Box>
	);
};

export default CheckoutSuccessPage;
