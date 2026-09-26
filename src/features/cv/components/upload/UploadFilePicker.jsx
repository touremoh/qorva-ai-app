import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { SYNC_MAX_FILES } from '../../model/upload.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** Drop zone and file browser, with the selected files and any refused ones. */
const UploadFilePicker = ({ upload }) => {
	const { t } = useTranslation();
	return (
		<>
		<>
			<Box
				onDragOver={(e) => { e.preventDefault(); upload.setIsDragging(true); }}
				onDragLeave={() => upload.setIsDragging(false)}
				onDrop={upload.handleDrop}
				onClick={() => upload.fileInputRef.current?.click()}
				sx={{
					border: `2px dashed ${upload.isDragging ? `${tokens.brand.main}` : `${tokens.line.strong}`}`,
					borderRadius: 2,
					py: 4,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					textAlign: 'center',
					gap: 1,
					cursor: 'pointer',
					backgroundColor: upload.isDragging ? alpha(tokens.brand.main, 0.04) : `${tokens.surface.subtle}`,
					transition: 'all 0.15s ease',
					'&:hover': { borderColor: tokens.brand.main, backgroundColor: alpha(tokens.brand.main, 0.04) },
				}}
			>
				<CloudUploadIcon sx={{ fontSize: 36, color: upload.isDragging ? `${tokens.brand.main}` : `${tokens.ink.subtle}` }} />
				<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: 600, color: tokens.ink.body }}>
					{t('appCVContent.dropHere')}
				</Typography>
				<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.subtle }}>
					{t('appCVContent.browseHint', { max: upload.bulkLimit })}
				</Typography>
				<input
					ref={upload.fileInputRef}
					type="file"
					accept=".pdf,.docx"
					multiple
					onChange={upload.handleFileSelect}
					disabled={upload.isUploading}
					style={{ display: 'none' }}
				/>
			</Box>

			{upload.selectedFiles.length > 0 && (
				<Box sx={{ mt: 2, p: 1.5, backgroundColor: tokens.status.success.pale, borderRadius: 1.5, border: `1px solid ${tokens.status.success.border}` }}>
					<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.status.success.main, fontWeight: 600 }}>
						{t('appCVContent.filesReady', { count: upload.selectedFiles.length })}
					</Typography>
					{upload.selectedFiles.length > SYNC_MAX_FILES && (
						<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.muted, mt: 0.25 }}>
							{t('appCVContent.bulk.willRunInBackground', 'Large batch — analysis will run in the background while you keep working.')}
						</Typography>
					)}
					{upload.confirmBulk && (
						<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.status.warning.strong, mt: 0.25, fontWeight: 600 }}>
							{t('appCVContent.bulk.confirmInfo', 'This will analyze {{count}} resumes and use {{count}} screening actions. Click again to confirm.', { count: upload.selectedFiles.length })}
						</Typography>
					)}
				</Box>
			)}
			{upload.droppedInfo && (
				<Box sx={{ mt: 1, p: 1.25, backgroundColor: tokens.status.warning.pale, borderRadius: 1.5, border: `1px solid ${tokens.status.warning.border}` }}>
					{upload.droppedInfo.overCap > 0 && (
						<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.status.warning.strong, fontWeight: 600 }}>
							{t('appCVContent.bulk.overCap', 'Only the first {{max}} files were kept — your plan imports up to {{max}} at once.', { max: upload.bulkLimit })}
						</Typography>
					)}
					{upload.droppedInfo.rejected > 0 && (
						<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.status.warning.strong }}>
							{t('appCVContent.bulk.rejectedType', '{{count}} unsupported file(s) ignored — only .pdf and .docx are accepted.', { count: upload.droppedInfo.rejected })}
						</Typography>
					)}
				</Box>
			)}
		</>
		</>
	);
};

UploadFilePicker.propTypes = {
	upload: PropTypes.any,
};

export default UploadFilePicker;
