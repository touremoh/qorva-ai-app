import PropTypes from 'prop-types';
import { Box, IconButton, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** Tells the user a matching run finished; dismissible. */
const MatchingCompletedBanner = ({ bannerDismissed, matchingCompleted, setBannerDismissed }) => {
	const { t } = useTranslation();
	return (
		<>
		{matchingCompleted && !bannerDismissed && (
			<Box sx={{
				display: 'flex', alignItems: 'center', justifyContent: 'space-between',
				px: 2.5, py: 0.75,
				backgroundColor: alpha(tokens.brand.main, 0.05),
				borderBottom: `1px solid ${alpha(tokens.brand.main, 0.12)}`,
				flexShrink: 0,
			}}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<CheckCircleOutlineIcon sx={{ fontSize: tokens.iconSize.md, color: tokens.brand.text }} />
					<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.brand.dark }}>
						{t('appReportContent.matchingReportsReady')}
					</Typography>
				</Box>
				<IconButton
					size="small"
					onClick={() => setBannerDismissed(true)}
					sx={{ color: tokens.brand.text, opacity: 0.6, '&:hover': { opacity: 1, backgroundColor: alpha(tokens.brand.main, 0.08) } }}
				>
					<CloseRoundedIcon sx={{ fontSize: tokens.iconSize.sm }} />
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
