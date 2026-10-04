import PropTypes from 'prop-types';
import { Box, CircularProgress, LinearProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** Progress of the matching runs in progress, from what the worker has actually done. */
const MatchingProgressBanner = ({ runs, matchingProgress }) => {
	const { t } = useTranslation();
	if (!runs || runs.length === 0) return null;
	const jobs = runs.reduce((sum, r) => sum + (r.jobIds?.length ?? 0), 0);
	const processed = runs.reduce((sum, r) => sum + (r.processed ?? 0), 0);
	const total = runs.reduce((sum, r) => sum + (r.total ?? 0), 0);
	const queued = runs.every((r) => r.status === 'PENDING');
	return (
		<Box sx={{
			px: 2.5, py: 1.5,
			backgroundColor: alpha(tokens.brand.main, 0.05),
			borderBottom: `1px solid ${alpha(tokens.brand.main, 0.2)}`,
			flexShrink: 0,
		}}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75, gap: 1 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<CircularProgress size={14} thickness={5} sx={{ color: tokens.brand.text }} />
					<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: 600, color: tokens.status.success.text }}>
						{queued ? t('matchingRun.queued') : t('matchingRun.progress', { jobs, processed, total })}
					</Typography>
				</Box>
				<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.brand.text, fontWeight: 600 }}>
					{matchingProgress}%
				</Typography>
			</Box>
			<LinearProgress
				variant={queued ? 'indeterminate' : 'determinate'}
				value={matchingProgress}
				sx={{
					height: 7, borderRadius: 4,
					backgroundColor: alpha(tokens.brand.main, 0.12),
					'& .MuiLinearProgress-bar': {
						borderRadius: 4,
						background: `linear-gradient(90deg, ${tokens.brand.main} 0%, ${tokens.brand.lime} 60%, ${tokens.brand.limePale} 100%)`,
					},
				}}
			/>
			<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle, mt: 0.75 }}>
				{t('matchingRun.canLeave')}
			</Typography>
		</Box>
	);
};

MatchingProgressBanner.propTypes = {
	runs: PropTypes.array,
	matchingProgress: PropTypes.number,
};

export default MatchingProgressBanner;
