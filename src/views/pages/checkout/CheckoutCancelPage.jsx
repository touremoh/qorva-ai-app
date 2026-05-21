import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../axiosConfig.js';
import { TENANT_ID, USER_ID } from '../../../constants.js';

const CheckoutCancelPage = () => {
	const { t } = useTranslation();
	const [confirming, setConfirming] = useState(true);
	const [retryLoading, setRetryLoading] = useState(false);
	const [retryError, setRetryError] = useState('');

	const tenantId = localStorage.getItem(TENANT_ID);
	const userId = localStorage.getItem(USER_ID);
	const priceId = localStorage.getItem('SELECTED_PRICE_ID');
	const canRetry = Boolean(tenantId && userId && priceId);

	useEffect(() => {
		apiClient
			.get(import.meta.env.VITE_APP_API_STRIPE_CANCEL_URL)
			.catch(() => {})
			.finally(() => setConfirming(false));
	}, []);

	const handleRetry = async () => {
		if (!canRetry) return;
		setRetryLoading(true);
		setRetryError('');
		try {
			const response = await apiClient.post(
				import.meta.env.VITE_APP_API_CHECKOUT_SESSION_URL,
				{ tenantId, userId, priceId }
			);
			const checkoutUrl = response.data?.data?.checkoutUrl;
			if (checkoutUrl) {
				window.location.href = checkoutUrl;
			} else {
				setRetryError(t('checkoutCancel.retryError', 'Could not restart checkout. Please try again.'));
			}
		} catch {
			setRetryError(t('checkoutCancel.retryError', 'Could not restart checkout. Please try again.'));
		} finally {
			setRetryLoading(false);
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
									backgroundColor: '#f1f5f9',
									boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
								}}
								aria-hidden
							>
								<CancelRoundedIcon sx={{ fontSize: 50, color: '#94a3b8' }} />
							</Box>

							<Stack spacing={1}>
								<Typography
									variant="h4"
									sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}
								>
									{t('checkoutCancel.title', 'Payment Cancelled')}
								</Typography>
								<Typography variant="body1" color="text.secondary">
									{t('checkoutCancel.subtitle', 'No charge was made. Your account has been created — you just need to complete checkout.')}
								</Typography>
							</Stack>

							<Divider flexItem />

							{retryError && (
								<Typography variant="body2" color="error">
									{retryError}
								</Typography>
							)}

							<Stack spacing={1.5} sx={{ width: '100%' }}>
								{canRetry && (
									<Button
										variant="contained"
										size="large"
										startIcon={retryLoading ? null : <ReplayRoundedIcon />}
										onClick={handleRetry}
										disabled={retryLoading}
										sx={{
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
										{retryLoading
											? <CircularProgress size={20} sx={{ color: 'rgba(255,255,255,0.8)' }} />
											: t('checkoutCancel.retry', 'Retry Payment')}
									</Button>
								)}

								<Button
									component={RouterLink}
									to="/register"
									variant="outlined"
									size="large"
									sx={{
										py: 1.25,
										borderRadius: 1.5,
										textTransform: 'none',
										fontWeight: 600,
										borderColor: '#e2e8f0',
										color: '#64748b',
										'&:hover': { borderColor: '#cbd5e1', backgroundColor: '#f8fafc' },
									}}
								>
									{t('checkoutCancel.startOver', 'Start Over')}
								</Button>
							</Stack>

							<Typography variant="caption" color="text.secondary">
								{t('checkoutCancel.help', 'Need help? Contact us at support@qorva.ai')}
							</Typography>
						</Stack>
					)}
				</Paper>
			</Container>
		</Box>
	);
};

export default CheckoutCancelPage;
