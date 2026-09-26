import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress, LinearProgress } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { UPLOAD_ESTIMATE_SECONDS, getUploadPhaseKey } from '../../model/upload.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** Estimated progress and current phase of a synchronous upload. */
const UploadProgress = ({ upload }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			py: 2.5,
			px: 2.5,
			my: 1,
			backgroundColor: alpha(tokens.brand.main, 0.05),
			border: `1px solid ${alpha(tokens.brand.main, 0.2)}`,
			borderRadius: 2,
		}}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					{upload.uploadComplete
						? <CheckCircleRoundedIcon sx={{ fontSize: tokens.iconSize.lg, color: tokens.status.success.main }} />
						: <CircularProgress size={14} thickness={5} sx={{ color: tokens.brand.text }} />}
					<Typography sx={{ fontSize: tokens.fontSize.body, fontWeight: 600, color: tokens.status.success.text }}>
						{upload.uploadComplete
							? t('appCVContent.uploadComplete')
							: t('appCVContent.uploadProgressTitle')}
					</Typography>
				</Box>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.brand.text, fontWeight: 600 }}>
						{Math.round(upload.uploadProgress)}%
					</Typography>
					{!upload.uploadComplete && (
						<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.gray }}>
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
					backgroundColor: alpha(tokens.brand.main, 0.12),
					'& .MuiLinearProgress-bar': {
						borderRadius: 4,
						background: `linear-gradient(90deg, ${tokens.brand.main} 0%, ${tokens.brand.lime} 60%, ${tokens.brand.limePale} 100%)`,
						transition: 'transform 0.5s linear',
					},
				}}
			/>
			{!upload.uploadComplete && (
				<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.brand.text, mt: 1, fontStyle: 'italic' }}>
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
