import PropTypes from 'prop-types';
import { Box, CircularProgress, LinearProgress, Typography } from '@mui/material';
import { getMatchingPhaseKey } from '../../model/reportList.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** Progress of the running matching, with the current phase. */
const MatchingProgressBanner = ({ matchingElapsed, matchingLoading, matchingProgress, matchingSubmitted }) => {
	const { t } = useTranslation();
	return (
		<>
		{(matchingLoading || matchingSubmitted) && (
			<Box sx={{
				px: 2.5, py: 1.5,
				backgroundColor: alpha(tokens.brand.main, 0.05),
				borderBottom: `1px solid ${alpha(tokens.brand.main, 0.2)}`,
				flexShrink: 0,
			}}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<CircularProgress size={14} thickness={5} sx={{ color: tokens.brand.text }} />
						<Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: tokens.status.success.text }}>
							{t('appReportContent.matchingInProgress')}
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
						<Typography sx={{ fontSize: '0.75rem', color: tokens.brand.text, fontWeight: 600 }}>
							{Math.round(matchingProgress)}%
						</Typography>
						<Typography sx={{ fontSize: '0.75rem', color: tokens.ink.gray }}>
							{matchingElapsed < 60
								? `~${Math.max(0, 60 - matchingElapsed)}s ${t('appReportContent.remaining')}`
								: t('appReportContent.almostDone')
							}
						</Typography>
					</Box>
				</Box>
				<LinearProgress
					variant="determinate"
					value={matchingProgress}
					sx={{
						height: 7, borderRadius: 4,
						backgroundColor: alpha(tokens.brand.main, 0.12),
						'& .MuiLinearProgress-bar': {
							borderRadius: 4,
							background: `linear-gradient(90deg, ${tokens.brand.main} 0%, ${tokens.brand.lime} 60%, ${tokens.brand.limePale} 100%)`,
							transition: 'transform 0.5s linear',
						},
					}}
				/>
				<Typography sx={{ fontSize: '0.72rem', color: tokens.brand.text, mt: 0.75, fontStyle: 'italic' }}>
					{t(`appReportContent.${getMatchingPhaseKey(matchingElapsed)}`)}
				</Typography>
			</Box>
		)}
		</>
	);
};

MatchingProgressBanner.propTypes = {
	matchingElapsed: PropTypes.any,
	matchingLoading: PropTypes.any,
	matchingProgress: PropTypes.any,
	matchingSubmitted: PropTypes.any,
};

export default MatchingProgressBanner;
