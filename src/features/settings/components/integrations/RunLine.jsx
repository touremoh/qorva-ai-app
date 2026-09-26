import PropTypes from 'prop-types';
import { Box, CircularProgress, Typography } from '@mui/material';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { useTranslation } from 'react-i18next';
import { GREEN } from '../../model/integrations.js';

const RunLine = ({ run }) => {
	const { t } = useTranslation();
	const when = run.createdAt ? new Date(run.createdAt).toLocaleString() : '—';
	const failureLabel = run.failureReason === 'initial_sync_guard'
		? t('atsIntegrations.runs.initialSyncGuard')
		: run.failureReason === 'quota_exceeded'
			? t('atsIntegrations.runs.quotaExceeded')
			: run.failureReason;
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, borderBottom: '1px solid #f8fafc' }}>
			{['COMPLETED'].includes(run.status)
				? <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 14, color: GREEN }} />
				: ['PENDING', 'RUNNING'].includes(run.status)
					? <CircularProgress size={12} sx={{ color: GREEN }} />
					: <ErrorOutlineOutlinedIcon sx={{ fontSize: 14, color: run.status === 'FAILED' ? '#dc2626' : '#d97706' }} />}
			<Typography sx={{ fontSize: '0.72rem', color: '#475569', flex: 1, minWidth: 0 }} noWrap>
				{when} · {t('atsIntegrations.runs.summary', { imported: run.succeeded, skipped: run.skipped, failed: run.failed })}
				{failureLabel ? ` · ${failureLabel}` : ''}
			</Typography>
		</Box>
	);
};
RunLine.propTypes = {
	run: PropTypes.shape({
		createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		failureReason: PropTypes.string,
		status: PropTypes.string,
		succeeded: PropTypes.number,
		skipped: PropTypes.number,
		failed: PropTypes.number,
	}).isRequired,
};

export default RunLine;
