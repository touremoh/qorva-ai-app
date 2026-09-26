import PropTypes from 'prop-types';
import { Box, Button, Paper, Typography } from '@mui/material';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import { LinearProgress } from '@mui/material';
import { ACTIVE_JOB_STATUSES } from '../model/libraryQuality.js';
import { useTranslation } from 'react-i18next';

/** Progress of the running (or just finished) re-analysis job, with cancel. */
const JobProgressPanel = ({ activeJob, handleCancelJob }) => {
	const { t } = useTranslation();
	return (
		<>
		{activeJob && (ACTIVE_JOB_STATUSES.has(activeJob.status) || (activeJob.finishedAt && Date.now() - new Date(activeJob.finishedAt).getTime() < 60000)) && (
			<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderLeft: '3px solid #629C44', borderRadius: 2.5, p: 2 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: ACTIVE_JOB_STATUSES.has(activeJob.status) ? 1 : 0 }}>
					<AutorenewRoundedIcon sx={{
						fontSize: 18, color: '#629C44',
						animation: ACTIVE_JOB_STATUSES.has(activeJob.status) ? 'spin 2s linear infinite' : 'none',
						'@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
					}} />
					<Typography sx={{ flex: 1, fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
						{ACTIVE_JOB_STATUSES.has(activeJob.status)
							? t('libraryQuality.jobs.running', 'AI re-analysis in progress — {{processed}}/{{total}} resumes', { processed: activeJob.processed, total: activeJob.total })
							: t(`libraryQuality.jobs.status.${activeJob.status}`, activeJob.status)}
					</Typography>
					{ACTIVE_JOB_STATUSES.has(activeJob.status) && (
						<Button size="small" onClick={handleCancelJob}
							sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>
							{t('libraryQuality.jobs.cancel', 'Cancel')}
						</Button>
					)}
				</Box>
				{ACTIVE_JOB_STATUSES.has(activeJob.status) && (
					<LinearProgress
						variant={activeJob.total > 0 ? 'determinate' : 'indeterminate'}
						value={activeJob.total > 0 ? (activeJob.processed / activeJob.total) * 100 : 0}
						sx={{
							height: 6, borderRadius: 3, backgroundColor: 'rgba(98,156,68,0.12)',
							'& .MuiLinearProgress-bar': { borderRadius: 3, backgroundColor: '#629C44' },
						}}
					/>
				)}
				{!ACTIVE_JOB_STATUSES.has(activeJob.status) && (activeJob.failed > 0 || activeJob.skipped > 0) && (
					<Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', mt: 0.5 }}>
						{t('libraryQuality.jobs.resultDetail', '{{succeeded}} updated · {{failed}} failed · {{skipped}} skipped (no stored text)', {
							succeeded: activeJob.succeeded, failed: activeJob.failed, skipped: activeJob.skipped })}
					</Typography>
				)}
			</Paper>
		)}
		</>
	);
};

JobProgressPanel.propTypes = {
	activeJob: PropTypes.any,
	handleCancelJob: PropTypes.func,
};

export default JobProgressPanel;
