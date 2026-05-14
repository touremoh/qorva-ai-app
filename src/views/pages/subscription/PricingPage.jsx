import React from 'react';
import StripePricingTable from './StripePricingTable.jsx';
import { Box, Divider, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';

const PricingPage = () => {
	const { t } = useTranslation();

	return (
		<Box sx={{
			minHeight: '100vh',
			width: '100vw',
			background: 'linear-gradient(135deg, #f0f4f8 0%, #e8edf2 100%)',
			position: 'fixed',
			top: 0,
			left: 0,
			overflowY: 'auto',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
		}}>
			{/* Top bar */}
			<Box sx={{
				width: '100%',
				px: { xs: 3, md: 5 },
				py: 2,
				display: 'flex',
				alignItems: 'center',
				gap: 1.25,
				borderBottom: '1px solid rgba(226,232,240,0.8)',
				backgroundColor: 'rgba(255,255,255,0.7)',
				backdropFilter: 'blur(8px)',
				flexShrink: 0,
			}}>
				<Box component="img" src="/logo.svg" alt="Qorva" sx={{ width: 28, height: 28 }} />
				<Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
					Qorva
				</Typography>
			</Box>

			{/* Hero header */}
			<Box sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				textAlign: 'center',
				pt: { xs: 5, md: 7 },
				pb: { xs: 3, md: 4 },
				px: 3,
			}}>
				<Box sx={{
					display: 'inline-flex',
					alignItems: 'center',
					gap: 0.75,
					backgroundColor: 'rgba(98,156,68,0.1)',
					border: '1px solid rgba(98,156,68,0.3)',
					borderRadius: 5,
					px: 1.75,
					py: 0.5,
					mb: 2.5,
				}}>
					<DiamondOutlinedIcon sx={{ fontSize: 13, color: '#629C44' }} />
					<Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#629C44', letterSpacing: '0.04em' }}>
						{t('pricing.badge', 'Simple, transparent pricing')}
					</Typography>
				</Box>

				<Typography sx={{
					fontSize: { xs: '1.75rem', md: '2.25rem' },
					fontWeight: 800,
					color: '#0f172a',
					letterSpacing: '-0.03em',
					lineHeight: 1.2,
					mb: 1.25,
				}}>
					{t('pricing.title', 'Choose your plan')}
				</Typography>

				<Typography sx={{
					fontSize: '0.95rem',
					color: '#64748b',
					maxWidth: 460,
					lineHeight: 1.65,
				}}>
					{t('pricing.subtitle', 'Scale your hiring with AI-powered resume screening. Start free, upgrade when you\'re ready.')}
				</Typography>
			</Box>

			<Divider sx={{ width: '100%', maxWidth: 960, borderColor: 'rgba(226,232,240,0.7)', mb: 4 }} />

			{/* Pricing table */}
			<Box sx={{ width: '100%', maxWidth: 1100, px: { xs: 2, md: 4 }, pb: 8 }}>
				<StripePricingTable />
			</Box>

			{/* Footer note */}
			<Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', pb: 4, px: 3, textAlign: 'center', maxWidth: 560 }}>
				{t('pricing.footer', 'Payments are securely processed by Stripe. You can cancel or change your plan at any time.')}
			</Typography>
		</Box>
	);
};

export default PricingPage;
