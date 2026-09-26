import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress, LinearProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

/** Staging and analysis counts of a running bulk import. */
const BulkImportProgress = ({ upload }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			py: 2.5, px: 2.5, my: 1,
			backgroundColor: 'rgba(98,156,68,0.05)',
			border: '1px solid rgba(98,156,68,0.2)',
			borderRadius: 2,
		}}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<CircularProgress size={14} thickness={5} sx={{ color: '#629C44' }} />
					<Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#166534' }}>
						{upload.bulkStage === 'staging'
							? t('appCVContent.bulk.staging', 'Uploading files… {{staged}} of {{total}}', { staged: upload.bulkStaged, total: upload.bulkTotal })
							: t('appCVContent.bulk.processing', 'Importing resumes… {{processed}} of {{total}}', {
								processed: upload.bulkView?.processed ?? 0, total: upload.bulkTotal })}
					</Typography>
				</Box>
				<Typography sx={{ fontSize: '0.78rem', color: '#629C44', fontWeight: 600 }}>
					{Math.round(upload.bulkStage === 'staging'
						? (upload.bulkTotal ? (upload.bulkStaged / upload.bulkTotal) * 30 : 0)
						: 30 + (upload.bulkTotal ? ((upload.bulkView?.processed ?? 0) / upload.bulkTotal) * 70 : 0))}%
				</Typography>
			</Box>
			<LinearProgress
				variant="determinate"
				value={upload.bulkStage === 'staging'
					? (upload.bulkTotal ? (upload.bulkStaged / upload.bulkTotal) * 30 : 0)
					: 30 + (upload.bulkTotal ? ((upload.bulkView?.processed ?? 0) / upload.bulkTotal) * 70 : 0)}
				sx={{
					height: 8, borderRadius: 4,
					backgroundColor: 'rgba(98,156,68,0.12)',
					'& .MuiLinearProgress-bar': {
						borderRadius: 4,
						background: 'linear-gradient(90deg, #629C44 0%, #7cb342 60%, #aed581 100%)',
						transition: 'transform 0.5s linear',
					},
				}}
			/>
			<Typography sx={{ fontSize: '0.78rem', color: '#629C44', mt: 1, fontStyle: 'italic' }}>
				{upload.bulkStage === 'staging'
					? t('appCVContent.bulk.stagingHint', 'Files are being uploaded — analysis starts when staging completes.')
					: t('appCVContent.bulk.processingHint', 'Analysis runs on our servers — you can close this window and imported resumes will keep appearing in your library.')}
				{upload.bulkStage === 'processing' && upload.bulkImport?.etaMinutes != null && (
					` ${t('appCVContent.bulk.eta', '~{{minutes}} min left', { minutes: upload.bulkImport.etaMinutes })}`
				)}
			</Typography>
		</Box>
		</>
	);
};

BulkImportProgress.propTypes = {
	upload: PropTypes.any,
};

export default BulkImportProgress;
