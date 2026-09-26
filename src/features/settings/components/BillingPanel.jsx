import PropTypes from 'prop-types';
import SectionHeader from '../../../shared/ui/SectionHeader.jsx';
import { Box, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import UpgradeButton from '../../../components/demo/UpgradeButton.jsx';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';

/** Subscription management: opens the Stripe billing portal. */
const BillingPanel = ({ demo, handleOpenBillingPortal, loadingPortal }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ maxWidth: 480 }}>
			{demo ? (
				<UpgradeButton reason="billing" variant="outlined" size="small" />
			) : (
			<Paper
				elevation={0}
				onClick={handleOpenBillingPortal}
				role="button" tabIndex={0}
				onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenBillingPortal(); }}
				sx={{
					border: `1px solid ${tokens.line.main}`, borderTop: `3px solid ${tokens.brand.main}`,
					borderRadius: 2.5, p: 2.5,
					cursor: loadingPortal ? 'default' : 'pointer',
					transition: 'box-shadow 0.15s ease, background-color 0.15s ease',
					'&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.08)', backgroundColor: tokens.surface.greenWhite },
					'&:active': { transform: 'scale(0.998)' },
					display: 'flex', flexDirection: 'column', gap: 1.5,
				}}
			>
				<SectionHeader icon={CreditCardOutlinedIcon} label={t('accountSettings.manageBilling')} />
				{loadingPortal ? (
					<Stack alignItems="center" spacing={1} sx={{ py: 2 }}>
						<CircularProgress size={22} sx={{ color: tokens.brand.text }} />
						<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.muted }}>
							{t('accountSettings.openingBillingPortal', 'Opening billing portal…')}
						</Typography>
					</Stack>
				) : (
					<>
						<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.soft, lineHeight: 1.65 }}>
							{t('accountSettings.manageBillingHint')}
						</Typography>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pt: 1.5, mt: 0.5, borderTop: `1px solid ${tokens.surface.muted}` }}>
							<OpenInNewOutlinedIcon sx={{ fontSize: tokens.iconSize.sm, color: tokens.brand.text }} />
							<Typography sx={{ fontSize: tokens.fontSize.small, fontWeight: 600, color: tokens.brand.text }}>
								{t('accountSettings.manageBillingLink')}
							</Typography>
						</Box>
					</>
				)}
			</Paper>
			)}
			<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle, lineHeight: 1.6, px: 0.5, mt: 2 }}>
				{t('accountSettings.footerHint')}
			</Typography>
		</Box>
		</>
	);
};

BillingPanel.propTypes = {
	demo: PropTypes.bool,
	handleOpenBillingPortal: PropTypes.func,
	loadingPortal: PropTypes.any,
};

export default BillingPanel;
