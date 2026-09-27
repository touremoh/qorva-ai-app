import PropTypes from 'prop-types';
import { Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useTranslation } from 'react-i18next';
import UploadActions from './UploadActions.jsx';
import UploadFilePicker from './UploadFilePicker.jsx';
import UploadProgress from './UploadProgress.jsx';
import UploadResults from './UploadResults.jsx';
import BulkImportProgress from './BulkImportProgress.jsx';
import BulkImportSummary from './BulkImportSummary.jsx';
import * as tokens from '../../../../theme/tokens.js';

/** Resume upload: pick files, then progress, per-file results or the bulk import summary. */
const UploadDialog = ({ upload }) => {
	const { t } = useTranslation();
	return (
		<>
		<Dialog
			open={upload.openUploadModal}
			onClose={() => !upload.isUploading && upload.handleCloseUploadDialog()}
			maxWidth="sm"
			fullWidth
			PaperProps={{ sx: { borderRadius: 3 } }}
		>
			<DialogTitle sx={{ px: 3, pt: 3, pb: 1, fontWeight: 700, fontSize: tokens.fontSize.body, color: tokens.ink.strong }}>
				{(upload.uploadResults || upload.bulkSummary) ? t('appCVContent.uploadResults.title', 'Upload results') : t('appCVContent.uploadCV')}
				{!upload.uploadResults && !upload.bulkSummary && (
					<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.muted, fontWeight: 400, mt: 0.25 }}>
						{t('appCVContent.uploadCVInfo', { max: upload.bulkLimit })}
					</Typography>
				)}
			</DialogTitle>
			<DialogContent sx={{ px: 3 }}>
				{upload.bulkSummary ? (
					/* Bulk import finished — aggregate summary (duplicates surface in Library Quality) */
					<BulkImportSummary upload={upload} />
				) : upload.bulkStage ? (
					/* Bulk import running — real counts, not an estimate */
					<BulkImportProgress upload={upload} />
				) : upload.uploadResults ? (
					<UploadResults upload={upload} />
				) : upload.isUploading ? (
					/* Upload / processing progress — shows ETA and what's happening server-side */
					<UploadProgress upload={upload} />
				) : (
					<UploadFilePicker
						upload={upload}
					/>
				)}
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
				<UploadActions upload={upload} />
			</DialogActions>
		</Dialog>
		</>
	);
};

UploadDialog.propTypes = {
	upload: PropTypes.object.isRequired,
};

export default UploadDialog;
