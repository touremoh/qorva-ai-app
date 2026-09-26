import PropTypes from 'prop-types';
import { Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

/** Buttons under the upload dialog: close, continue in background, cancel or upload. */
const UploadActions = ({ upload }) => {
	const { t } = useTranslation();
	return (
		<>
		{(upload.uploadResults || upload.bulkSummary) ? (
			<Button
				onClick={upload.handleCloseUploadDialog}
				variant="contained"
				sx={{
					textTransform: 'none',
					backgroundColor: '#629C44',
					'&:hover': { backgroundColor: '#528035' },
					borderRadius: 1.5,
					boxShadow: 'none',
					fontWeight: 600,
					minWidth: 120,
				}}
			>
				{t('appCVContent.uploadResults.done', 'Done')}
			</Button>
		) : upload.bulkStage ? (
			<>
				<Button
					onClick={upload.handleCancelBulk}
					sx={{ textTransform: 'none', color: '#dc2626', borderRadius: 1.5 }}
				>
					{t('appCVContent.bulk.cancelImport', 'Cancel import')}
				</Button>
				{upload.bulkStage === 'processing' && (
					<Button
						onClick={upload.handleContinueInBackground}
						variant="outlined"
						sx={{ textTransform: 'none', color: '#629C44', borderColor: '#629C44', borderRadius: 1.5, fontWeight: 600 }}
					>
						{t('appCVContent.bulk.continueInBackground', 'Continue in background')}
					</Button>
				)}
			</>
		) : (
			<>
				<Button
					onClick={upload.handleCloseUploadDialog}
					disabled={upload.isUploading}
					sx={{ textTransform: 'none', color: '#64748b', borderRadius: 1.5 }}
				>
					{t('appCVContent.cancel')}
				</Button>
				<Button
					onClick={upload.handleUploadCV}
					disabled={upload.isUploading || upload.selectedFiles.length === 0}
					variant="contained"
					sx={{
						textTransform: 'none',
						backgroundColor: upload.confirmBulk ? '#b45309' : '#629C44',
						'&:hover': { backgroundColor: upload.confirmBulk ? '#92400e' : '#528035' },
						borderRadius: 1.5,
						boxShadow: 'none',
						fontWeight: 600,
						minWidth: 120,
					}}
				>
					{upload.isUploading
						? <CircularProgress size={18} color="inherit" />
						: upload.confirmBulk
							? t('appCVContent.bulk.confirmButton', 'Confirm import of {{count}} files', { count: upload.selectedFiles.length })
							: t('appCVContent.uploadFiles')}
				</Button>
			</>
		)}
		</>
	);
};

UploadActions.propTypes = {
	upload: PropTypes.any,
};

export default UploadActions;
