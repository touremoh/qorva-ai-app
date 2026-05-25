import React, { useEffect, useState } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
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
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import { useTranslation } from 'react-i18next';
import { getCheckoutSuccess } from '../../../services/stripeService.js';

const CheckoutSuccessPage = () => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const [confirming, setConfirming] = useState(true);

	useEffect(() => {
		const sessionId = searchParams.get('session_id');
		getCheckoutSuccess(sessionId)
			.catch(() => {})
			.finally(() => setConfirming(false));
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
					{confirming ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
							<CircularProgress sx={{ color: '#629C44' }} />
						</Box>
					) : (
						<Stack spacing={3} alignItems="center" textAlign="center">
							<Box
								sx={{
									width: 80,
									height: 80,
									borderRadius: '50%',
									display: 'grid',
									placeItems: 'center',
									backgroundColor: '#629C44',
									boxShadow: '0 10px 30px rgba(98,156,68,0.35)',
								}}
								aria-hidden
							>
								<CheckCircleRoundedIcon sx={{ fontSize: 50, color: '#fff' }} />
							</Box>

							<Stack spacing={1}>
								<Typography
									variant="h4"
									sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}
								>
									{t('checkoutSuccess.title', 'Payment Successful!')}
								</Typography>
								<Typography variant="body1" color="text.secondary">
									{t('checkoutSuccess.subtitle', 'Your subscription is now active. Welcome to Qorva AI!')}
								</Typography>
							</Stack>

							<Divider flexItem />

							<Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
								{t(
									'checkoutSuccess.emailNote',
									'We\'ve sent a confirmation email to your inbox. Sign in to start hiring smarter.'
								)}
							</Typography>

							<Button
								component={RouterLink}
								to="/login"
								variant="contained"
								size="large"
								startIcon={<LoginRoundedIcon />}
								sx={{
									mt: 1,
									px: 4,
									py: 1.25,
									borderRadius: 1.5,
									textTransform: 'none',
									fontWeight: 700,
									backgroundColor: '#629C44',
									boxShadow: '0 2px 8px rgba(98,156,68,0.35)',
									'&:hover': {
										backgroundColor: '#518136',
										boxShadow: '0 4px 14px rgba(98,156,68,0.45)',
									},
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
