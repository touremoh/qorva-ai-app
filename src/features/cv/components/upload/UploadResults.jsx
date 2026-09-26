import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

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
					sx={{ alignSelf: 'flex-end', textTransform: 'none', fontWeight: 600, color: tokens.brand.text, fontSize: tokens.fontSize.small }}
				>
					{t('appCVContent.uploadResults.replaceAll', 'Replace all old versions')}
				</Button>
			)}
			{upload.uploadResults.map((result, i) => {
				const isDuplicate = result.status === 'DUPLICATE_DETECTED';
				const isFailed = result.status === 'FAILED';
				return (
					<Box key={i} sx={{
						border: `1px solid ${tokens.line.main}`, borderRadius: 1.5, px: 1.5, py: 1,
						display: 'flex', flexDirection: 'column', gap: 0.5,
					}}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							{isFailed
								? <ErrorOutlineIcon sx={{ fontSize: tokens.iconSize.md, color: tokens.status.error.main, flexShrink: 0 }} />
								: isDuplicate && !result.resolution
									? <WarningAmberRoundedIcon sx={{ fontSize: tokens.iconSize.md, color: tokens.status.warning.bright, flexShrink: 0 }} />
									: <CheckCircleRoundedIcon sx={{ fontSize: tokens.iconSize.md, color: tokens.status.success.main, flexShrink: 0 }} />}
							<Typography sx={{ flex: 1, fontSize: tokens.fontSize.body2, fontWeight: 600, color: tokens.ink.strong, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
								{result.fileName}
							</Typography>
							{result.warnings?.length > 0 && !isFailed && (
								<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.status.warning.strong, flexShrink: 0 }}>
									{result.warnings.map(w => t(`appCVContent.uploadWarnings.${w}`, w)).join(' · ')}
								</Typography>
							)}
						</Box>
						{isFailed && (
							<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.status.error.main }}>
								{t('appCVContent.uploadResults.failed', 'This file could not be processed.')}
							</Typography>
						)}
						{isDuplicate && (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
								<Typography sx={{ flex: 1, fontSize: tokens.fontSize.small, color: tokens.ink.muted, minWidth: 180 }}>
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
											sx={{ textTransform: 'none', fontWeight: 600, fontSize: tokens.fontSize.caption, color: tokens.brand.text }}>
											{t('appCVContent.uploadResults.replace', 'Replace old version')}
										</Button>
										<Button size="small" onClick={() => upload.handleKeepBoth(result)}
											sx={{ textTransform: 'none', fontWeight: 600, fontSize: tokens.fontSize.caption, color: tokens.ink.muted }}>
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
