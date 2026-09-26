import PropTypes from 'prop-types';
import { Box, CircularProgress, LinearProgress, Typography } from '@mui/material';
import { getMatchingPhaseKey } from '../../model/reportList.js';
import { useTranslation } from 'react-i18next';

/** Progress of the running matching, with the current phase. */
const MatchingProgressBanner = ({ matchingElapsed, matchingLoading, matchingProgress, matchingSubmitted }) => {
	const { t } = useTranslation();
	return (
		<>
		{(matchingLoading || matchingSubmitted) && (
			<Box sx={{
				px: 2.5, py: 1.5,
				backgroundColor: 'rgba(98,156,68,0.05)',
				borderBottom: '1px solid rgba(98,156,68,0.2)',
				flexShrink: 0,
			}}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<CircularProgress size={14} thickness={5} sx={{ color: '#629C44' }} />
						<Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#166534' }}>
							{t('appReportContent.matchingInProgress')}
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
						<Typography sx={{ fontSize: '0.75rem', color: '#629C44', fontWeight: 600 }}>
							{Math.round(matchingProgress)}%
						</Typography>
						<Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
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
						backgroundColor: 'rgba(98,156,68,0.12)',
						'& .MuiLinearProgress-bar': {
							borderRadius: 4,
							background: 'linear-gradient(90deg, #629C44 0%, #7cb342 60%, #aed581 100%)',
							transition: 'transform 0.5s linear',
						},
					}}
				/>
				<Typography sx={{ fontSize: '0.72rem', color: '#629C44', mt: 0.75, fontStyle: 'italic' }}>
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
