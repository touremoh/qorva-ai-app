import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress, LinearProgress } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { UPLOAD_ESTIMATE_SECONDS, getUploadPhaseKey } from '../../model/upload.js';
import { useTranslation } from 'react-i18next';

/** Estimated progress and current phase of a synchronous upload. */
const UploadProgress = ({ upload }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			py: 2.5,
			px: 2.5,
			my: 1,
			backgroundColor: 'rgba(98,156,68,0.05)',
			border: '1px solid rgba(98,156,68,0.2)',
			borderRadius: 2,
		}}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					{upload.uploadComplete
						? <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
						: <CircularProgress size={14} thickness={5} sx={{ color: '#629C44' }} />}
					<Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#166534' }}>
						{upload.uploadComplete
							? t('appCVContent.uploadComplete')
							: t('appCVContent.uploadProgressTitle')}
					</Typography>
				</Box>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<Typography sx={{ fontSize: '0.78rem', color: '#629C44', fontWeight: 600 }}>
						{Math.round(upload.uploadProgress)}%
					</Typography>
					{!upload.uploadComplete && (
						<Typography sx={{ fontSize: '0.78rem', color: '#6b7280' }}>
							{upload.uploadElapsed < UPLOAD_ESTIMATE_SECONDS
								? `~${Math.max(0, UPLOAD_ESTIMATE_SECONDS - upload.uploadElapsed)}s ${t('appCVContent.remaining')}`
								: t('appCVContent.almostDone')}
						</Typography>
					)}
				</Box>
			</Box>
			<LinearProgress
				variant="determinate"
				value={upload.uploadProgress}
				sx={{
					height: 8,
					borderRadius: 4,
					backgroundColor: 'rgba(98,156,68,0.12)',
					'& .MuiLinearProgress-bar': {
						borderRadius: 4,
						background: 'linear-gradient(90deg, #629C44 0%, #7cb342 60%, #aed581 100%)',
						transition: 'transform 0.5s linear',
					},
				}}
			/>
			{!upload.uploadComplete && (
				<Typography sx={{ fontSize: '0.78rem', color: '#629C44', mt: 1, fontStyle: 'italic' }}>
					{t(`appCVContent.${getUploadPhaseKey(upload.uploadElapsed)}`)}
				</Typography>
			)}
		</Box>
		</>
	);
};

UploadProgress.propTypes = {
	upload: PropTypes.any,
};

export default UploadProgress;
