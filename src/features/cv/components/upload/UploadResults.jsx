import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useTranslation } from 'react-i18next';

/** Per-file upload results, with duplicate resolution (replace or keep both). */
const UploadResults = ({ upload }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, py: 0.5 }}>
			{upload.uploadResults.filter(r => r.status === 'DUPLICATE_DETECTED' && !r.resolution).length > 1 && (
				<Button
					size="small"
					onClick={upload.handleReplaceAll}
					sx={{ alignSelf: 'flex-end', textTransform: 'none', fontWeight: 600, color: '#629C44', fontSize: '0.76rem' }}
				>
					{t('appCVContent.uploadResults.replaceAll', 'Replace all old versions')}
				</Button>
			)}
			{upload.uploadResults.map((result, i) => {
				const isDuplicate = result.status === 'DUPLICATE_DETECTED';
				const isFailed = result.status === 'FAILED';
				return (
					<Box key={i} sx={{
						border: '1px solid #e2e8f0', borderRadius: 1.5, px: 1.5, py: 1,
						display: 'flex', flexDirection: 'column', gap: 0.5,
					}}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							{isFailed
								? <ErrorOutlineIcon sx={{ fontSize: 17, color: '#dc2626', flexShrink: 0 }} />
								: isDuplicate && !result.resolution
									? <WarningAmberRoundedIcon sx={{ fontSize: 17, color: '#f59e0b', flexShrink: 0 }} />
									: <CheckCircleRoundedIcon sx={{ fontSize: 17, color: '#16a34a', flexShrink: 0 }} />}
							<Typography sx={{ flex: 1, fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
								{result.fileName}
							</Typography>
							{result.warnings?.length > 0 && !isFailed && (
								<Typography sx={{ fontSize: '0.68rem', color: '#b45309', flexShrink: 0 }}>
									{result.warnings.map(w => t(`appCVContent.uploadWarnings.${w}`, w)).join(' · ')}
								</Typography>
							)}
						</Box>
						{isFailed && (
							<Typography sx={{ fontSize: '0.74rem', color: '#dc2626' }}>
								{t('appCVContent.uploadResults.failed', 'This file could not be processed.')}
							</Typography>
						)}
						{isDuplicate && (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
								<Typography sx={{ flex: 1, fontSize: '0.74rem', color: '#64748b', minWidth: 180 }}>
									{result.resolution === 'REPLACED'
										? t('appCVContent.uploadResults.replaced', 'Old version replaced.')
										: result.resolution === 'KEPT'
											? t('appCVContent.uploadResults.kept', 'Both versions kept.')
											: t('appCVContent.uploadResults.duplicateOf', 'Matches existing {{name}} (added {{date}})', {
												name: result.match?.existingName || '—',
												date: result.match?.existingCreatedAt ? new Date(result.match.existingCreatedAt).toLocaleDateString() : '—',
											})}
								</Typography>
								{!result.resolution && (
									<>
										<Button size="small" onClick={() => upload.handleReplaceDuplicate(result)}
											sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.72rem', color: '#629C44' }}>
											{t('appCVContent.uploadResults.replace', 'Replace old version')}
										</Button>
										<Button size="small" onClick={() => upload.handleKeepBoth(result)}
											sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.72rem', color: '#64748b' }}>
											{t('appCVContent.uploadResults.keepBoth', 'Keep both')}
										</Button>
									</>
								)}
							</Box>
						)}
					</Box>
				);
			})}
		</Box>
		</>
	);
};

UploadResults.propTypes = {
	upload: PropTypes.any,
};

export default UploadResults;
