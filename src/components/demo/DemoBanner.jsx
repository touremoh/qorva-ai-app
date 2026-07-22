import { Box, Typography, Button } from '@mui/material';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import { useTranslation } from 'react-i18next';
import { openUpgradeDialog } from '../../utils/demoMode.js';

// Persistent strip shown at the top of the workspace while the account is in
// demo mode. Primary CTA opens the 14-day free-trial upgrade flow (Screen 7).
const DemoBanner = () => {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				flexShrink: 0,
				display: 'flex',
				alignItems: 'center',
				gap: 1.5,
				px: { xs: 2, md: 3 },
				py: 1,
				background: 'linear-gradient(90deg, #1a2940 0%, #232F3E 60%, #2d3f54 100%)',
				borderBottom: '1px solid rgba(98,156,68,0.35)',
			}}
		>
			<ScienceOutlinedIcon sx={{ fontSize: 20, color: '#a3c988', flexShrink: 0 }} />
			<Typography
				sx={{
					color: '#e2e8f0',
					fontSize: { xs: '0.78rem', sm: '0.85rem' },
					fontWeight: 500,
					lineHeight: 1.3,
					flex: 1,
					minWidth: 0,
				}}
			>
				<Box component="span" sx={{ fontWeight: 700, color: '#ffffff' }}>
					{t('demo.bannerTitle', "You're in demo mode")}
				</Box>
				{' — '}
				{t('demo.bannerSubtitle', 'using sample data')}
			</Typography>
			<Button
				size="small"
				variant="contained"
				startIcon={<RocketLaunchRoundedIcon sx={{ fontSize: 16 }} />}
				onClick={() => openUpgradeDialog('banner')}
				sx={{
					flexShrink: 0,
					textTransform: 'none',
					fontWeight: 600,
					fontSize: '0.78rem',
					borderRadius: 1.5,
					px: 1.75,
					backgroundColor: '#629C44',
					boxShadow: '0 2px 8px rgba(98,156,68,0.35)',
					'&:hover': { backgroundColor: '#518136', boxShadow: '0 4px 14px rgba(98,156,68,0.45)' },
				}}
			>
				{t('demo.startTrial', 'Start 14-day free trial')}
			</Button>
		</Box>
	);
};

export default DemoBanner;
