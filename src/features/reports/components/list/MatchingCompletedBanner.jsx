import PropTypes from 'prop-types';
import { Box, IconButton, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useTranslation } from 'react-i18next';

/** Tells the user a matching run finished; dismissible. */
const MatchingCompletedBanner = ({ bannerDismissed, matchingCompleted, setBannerDismissed }) => {
	const { t } = useTranslation();
	return (
		<>
		{matchingCompleted && !bannerDismissed && (
			<Box sx={{
				display: 'flex', alignItems: 'center', justifyContent: 'space-between',
				px: 2.5, py: 0.75,
				backgroundColor: 'rgba(98,156,68,0.05)',
				borderBottom: '1px solid rgba(98,156,68,0.12)',
				flexShrink: 0,
			}}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#629C44' }} />
					<Typography sx={{ fontSize: '0.82rem', color: '#3a6827' }}>
						{t('appReportContent.matchingReportsReady')}
					</Typography>
				</Box>
				<IconButton
					size="small"
					onClick={() => setBannerDismissed(true)}
					sx={{ color: '#629C44', opacity: 0.6, '&:hover': { opacity: 1, backgroundColor: 'rgba(98,156,68,0.08)' } }}
				>
					<CloseRoundedIcon sx={{ fontSize: 14 }} />
				</IconButton>
			</Box>
		)}
		</>
	);
};

MatchingCompletedBanner.propTypes = {
	bannerDismissed: PropTypes.any,
	matchingCompleted: PropTypes.any,
	setBannerDismissed: PropTypes.func,
};

export default MatchingCompletedBanner;
