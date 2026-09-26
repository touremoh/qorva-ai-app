import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useTranslation } from 'react-i18next';

/** Final counts of a finished (or cancelled) bulk import. */
const BulkImportSummary = ({ upload }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, py: 0.5 }}>
			<Box sx={{
				py: 2, px: 2,
				backgroundColor: upload.bulkSummary.failed > 0 || upload.bulkSummary.skipped > 0 ? '#fffbeb' : '#f0fdf4',
				border: `1px solid ${upload.bulkSummary.failed > 0 || upload.bulkSummary.skipped > 0 ? '#fde68a' : '#bbf7d0'}`,
				borderRadius: 2,
				display: 'flex', alignItems: 'center', gap: 1.25,
			}}>
				{upload.bulkSummary.status === 'CANCELLED'
					? <ErrorOutlineIcon sx={{ fontSize: 22, color: '#64748b' }} />
					: upload.bulkSummary.failed > 0 || upload.bulkSummary.skipped > 0
						? <WarningAmberRoundedIcon sx={{ fontSize: 22, color: '#f59e0b' }} />
						: <CheckCircleRoundedIcon sx={{ fontSize: 22, color: '#16a34a' }} />}
				<Box>
					<Typography sx={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
						{upload.bulkSummary.status === 'CANCELLED'
							? t('appCVContent.bulk.cancelled', 'Import cancelled')
							: t('appCVContent.bulk.imported', '{{succeeded}} of {{total}} resumes imported', {
								succeeded: upload.bulkSummary.succeeded, total: upload.bulkSummary.total })}
					</Typography>
					<Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
						{upload.bulkSummary.failed > 0 && t('appCVContent.bulk.failedCount', '{{count}} failed', { count: upload.bulkSummary.failed })}
						{upload.bulkSummary.failed > 0 && upload.bulkSummary.skipped > 0 && ' · '}
						{upload.bulkSummary.skipped > 0 && (upload.bulkSummary.failureReason === 'quota_exceeded'
							? t('appCVContent.bulk.skippedQuota', '{{count}} skipped — your plan\'s screening limit was reached', { count: upload.bulkSummary.skipped })
							: t('appCVContent.bulk.skippedCount', '{{count}} skipped', { count: upload.bulkSummary.skipped }))}
					</Typography>
				</Box>
			</Box>
			{Array.isArray(upload.bulkSummary.errorSamples) && upload.bulkSummary.errorSamples.length > 0 && (
				<Box sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, px: 1.5, py: 1, maxHeight: 180, overflowY: 'auto' }}>
					<Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#b45309', mb: 0.5 }}>
						{t('appCVContent.bulk.errorSamples', 'Files with errors')}
					</Typography>
					{upload.bulkSummary.errorSamples.map((sample, i) => (
						<Typography key={i} sx={{ fontSize: '0.72rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
							{sample}
						</Typography>
					))}
				</Box>
			)}
			<Typography sx={{ fontSize: '0.76rem', color: '#94a3b8' }}>
				{t('appCVContent.bulk.duplicatesHint', 'Possible duplicates are flagged in Library Quality after import.')}
			</Typography>
		</Box>
		</>
	);
};

BulkImportSummary.propTypes = {
	upload: PropTypes.any,
};

export default BulkImportSummary;
