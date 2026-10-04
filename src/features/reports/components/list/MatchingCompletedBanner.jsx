import PropTypes from 'prop-types';
import { Box, IconButton, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** What the last finished run did — reports generated, reports reused, anything that went wrong; dismissible. */
const MatchingCompletedBanner = ({ bannerDismissed, finishedRun, setBannerDismissed }) => {
	const { t } = useTranslation();
	if (!finishedRun || bannerDismissed) return null;
	const issues = (finishedRun.failed ?? 0) > 0 || (finishedRun.skippedJobs ?? 0) > 0 || !!finishedRun.failureReason
		|| finishedRun.status === 'FAILED';
	return (
		<Box sx={{
			display: 'flex', alignItems: 'center', justifyContent: 'space-between',
			px: 2.5, py: 0.75,
			backgroundColor: issues ? 'rgba(245,158,11,0.07)' : alpha(tokens.brand.main, 0.05),
			borderBottom: `1px solid ${issues ? 'rgba(245,158,11,0.18)' : alpha(tokens.brand.main, 0.12)}`,
			flexShrink: 0,
		}}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				{issues
					? <WarningAmberIcon sx={{ fontSize: tokens.iconSize.md, color: tokens.status.warning.main }} />
					: <CheckCircleOutlineIcon sx={{ fontSize: tokens.iconSize.md, color: tokens.brand.text }} />}
				<Typography sx={{ fontSize: tokens.fontSize.body2, color: issues ? tokens.status.warning.text : tokens.brand.dark }}>
					{t('matchingRun.done', { generated: finishedRun.generated ?? 0, reused: finishedRun.reused ?? 0 })}
					{issues && ` ${finishedRun.failureReason === 'quota_exceeded'
						? t('matchingRun.doneQuota')
						: t('matchingRun.doneWithIssues', { failed: finishedRun.failed ?? 0, skipped: finishedRun.skippedJobs ?? 0 })}`}
				</Typography>
			</Box>
			<IconButton
				size="small"
				aria-label={t('matchingRun.dismiss')}
				onClick={() => setBannerDismissed(true)}
				sx={{ color: tokens.brand.text, opacity: 0.6, '&:hover': { opacity: 1, backgroundColor: alpha(tokens.brand.main, 0.08) } }}
			>
				<CloseRoundedIcon sx={{ fontSize: tokens.iconSize.sm }} />
			</IconButton>
		</Box>
	);
};

MatchingCompletedBanner.propTypes = {
	bannerDismissed: PropTypes.bool,
	finishedRun: PropTypes.object,
	setBannerDismissed: PropTypes.func,
};

export default MatchingCompletedBanner;
