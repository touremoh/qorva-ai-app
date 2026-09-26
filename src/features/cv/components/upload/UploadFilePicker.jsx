import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { SYNC_MAX_FILES } from '../../model/upload.js';
import { useTranslation } from 'react-i18next';

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
					border: `2px dashed ${upload.isDragging ? '#629C44' : '#cbd5e1'}`,
					borderRadius: 2,
					py: 4,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 1,
					cursor: 'pointer',
					backgroundColor: upload.isDragging ? 'rgba(98,156,68,0.04)' : '#f8fafc',
					transition: 'all 0.15s ease',
					'&:hover': { borderColor: '#629C44', backgroundColor: 'rgba(98,156,68,0.04)' },
				}}
			>
				<CloudUploadIcon sx={{ fontSize: 36, color: upload.isDragging ? '#629C44' : '#94a3b8' }} />
				<Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
					Drag & drop files here
				</Typography>
				<Typography sx={{ fontSize: '0.78rem', color: '#94a3b8' }}>
					or click to browse — .pdf or .docx, up to {upload.bulkLimit} files
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
				<Box sx={{ mt: 2, p: 1.5, backgroundColor: '#f0fdf4', borderRadius: 1.5, border: '1px solid #bbf7d0' }}>
					<Typography sx={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
						{upload.selectedFiles.length} file{upload.selectedFiles.length > 1 ? 's' : ''} ready to upload
					</Typography>
					{upload.selectedFiles.length > SYNC_MAX_FILES && (
						<Typography sx={{ fontSize: '0.74rem', color: '#64748b', mt: 0.25 }}>
							{t('appCVContent.bulk.willRunInBackground', 'Large batch — analysis will run in the background while you keep working.')}
						</Typography>
					)}
					{upload.confirmBulk && (
						<Typography sx={{ fontSize: '0.74rem', color: '#b45309', mt: 0.25, fontWeight: 600 }}>
							{t('appCVContent.bulk.confirmInfo', 'This will analyze {{count}} resumes and use {{count}} screening actions. Click again to confirm.', { count: upload.selectedFiles.length })}
						</Typography>
					)}
				</Box>
			)}
			{upload.droppedInfo && (
				<Box sx={{ mt: 1, p: 1.25, backgroundColor: '#fffbeb', borderRadius: 1.5, border: '1px solid #fde68a' }}>
					{upload.droppedInfo.overCap > 0 && (
						<Typography sx={{ fontSize: '0.76rem', color: '#b45309', fontWeight: 600 }}>
							{t('appCVContent.bulk.overCap', 'Only the first {{max}} files were kept — your plan imports up to {{max}} at once.', { max: upload.bulkLimit })}
						</Typography>
					)}
					{upload.droppedInfo.rejected > 0 && (
						<Typography sx={{ fontSize: '0.76rem', color: '#b45309' }}>
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
