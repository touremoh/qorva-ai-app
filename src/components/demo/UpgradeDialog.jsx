import { useState, useEffect, useCallback } from 'react';
import {
	Dialog,
	DialogContent,
	Box,
	Typography,
	Button,
	IconButton,
	Alert,
	CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import { useTranslation } from 'react-i18next';
import QorvaPricingTable from '../../views/pages/register/QorvaPricingTable.jsx';
import { upgradeSubscription } from '../../services/subscriptionService.js';
import { OPEN_UPGRADE_EVENT } from '../../utils/demoMode.js';

// Global host for the demo → paid upgrade flow (Screen 7). Mounted once inside
// the authenticated shell; opens in response to the OPEN_UPGRADE_EVENT window
// event dispatched by the demo banner, gated CTAs, or the global 403 handler.
const UpgradeDialog = () => {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState('banner');
	const [selectedPriceId, setSelectedPriceId] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		const handler = (e) => {
			setReason(e.detail?.reason || 'banner');
			setError('');
			setOpen(true);
		};
		window.addEventListener(OPEN_UPGRADE_EVENT, handler);
		return () => window.removeEventListener(OPEN_UPGRADE_EVENT, handler);
	}, []);

	const handleClose = useCallback(() => {
		if (loading) return;
		setOpen(false);
	}, [loading]);

	const handleUpgrade = async () => {
		if (!selectedPriceId) {
			setError(t('demo.selectPlanFirst', 'Please select a plan to continue.'));
			return;
		}
		setError('');
		setLoading(true);
		try {
			const response = await upgradeSubscription(selectedPriceId);
			const checkoutUrl = response.data?.data?.checkoutUrl;
			if (checkoutUrl) {
				window.location.href = checkoutUrl;
			} else {
				setError(t('demo.upgradeError', 'Could not start checkout. Please try again.'));
				setLoading(false);
			}
		} catch {
			setError(t('demo.upgradeError', 'Could not start checkout. Please try again.'));
			setLoading(false);
		}
	};

	const subtitle = reason === 'forbidden'
		? t('demo.upgradeForbiddenSubtitle', 'That action needs a paid plan. Start your 14-day free trial to unlock full access.')
		: t('demo.upgradeSubtitle', 'Unlock uploads, job posts, team management and unlimited reports. 14 days free, cancel anytime.');

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="lg"
			fullWidth
			scroll="body"
			slotProps={{ paper: { sx: { borderRadius: 3, overflow: 'hidden' } } }}
		>
			<Box sx={{ position: 'relative', px: { xs: 2.5, sm: 4 }, pt: { xs: 3, sm: 4 }, textAlign: 'center' }}>
				<IconButton
					onClick={handleClose}
					disabled={loading}
					sx={{ position: 'absolute', top: 12, right: 12, color: '#94a3b8' }}
					aria-label={t('demo.close', 'Close')}
				>
					<CloseRoundedIcon />
				</IconButton>
				<Box
					sx={{
						display: 'inline-flex', alignItems: 'center', gap: 1,
						backgroundColor: 'rgba(98,156,68,0.12)',
						border: '1px solid rgba(98,156,68,0.3)',
						borderRadius: 5, px: 2, py: 0.6, mb: 2,
					}}
				>
					<RocketLaunchRoundedIcon sx={{ fontSize: 16, color: '#629C44' }} />
					<Typography sx={{ fontSize: '0.78rem', color: '#518136', fontWeight: 600 }}>
						{t('demo.startTrial', 'Start 14-day free trial')}
					</Typography>
				</Box>
				<Typography sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.75rem' }, color: '#0f172a', letterSpacing: '-0.03em', mb: 0.75 }}>
					{t('demo.upgradeTitle', 'Upgrade your workspace')}
				</Typography>
				<Typography sx={{ color: '#64748b', fontSize: '0.92rem', maxWidth: 560, mx: 'auto' }}>
					{subtitle}
				</Typography>
			</Box>

			<DialogContent sx={{ px: { xs: 2, sm: 4 }, pt: 3 }}>
				{error && (
					<Alert severity="error" sx={{ mb: 2.5, borderRadius: 1.5 }}>
						{error}
					</Alert>
				)}

				<QorvaPricingTable selectedPriceId={selectedPriceId} onSelectPlan={setSelectedPriceId} />

				<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
					<Button
						variant="contained"
						onClick={handleUpgrade}
						disabled={loading || !selectedPriceId}
						sx={{
							px: 5, py: 1.4, borderRadius: 1.5,
							fontWeight: 600, fontSize: '0.95rem', textTransform: 'none',
							backgroundColor: '#629C44',
							boxShadow: '0 2px 8px rgba(98,156,68,0.35)',
							'&:hover': { backgroundColor: '#518136', boxShadow: '0 4px 14px rgba(98,156,68,0.45)' },
							'&.Mui-disabled': { backgroundColor: '#b8d4a8', boxShadow: 'none' },
						}}
					>
						{loading
							? <CircularProgress size={22} sx={{ color: 'rgba(255,255,255,0.85)' }} />
							: t('demo.startTrialCta', 'Start free trial')}
					</Button>
				</Box>

				<Typography sx={{ mt: 2, mb: 1, color: '#94a3b8', fontSize: '0.72rem', textAlign: 'center' }}>
					{t('demo.stripeNote', 'Secure checkout by Stripe. Your 14-day trial starts today — cancel anytime.')}
				</Typography>
			</DialogContent>
		</Dialog>
	);
};

export default UpgradeDialog;
