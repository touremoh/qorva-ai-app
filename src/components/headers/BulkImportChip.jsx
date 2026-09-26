// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBulkImport } from '../../contexts/BulkImportContext.jsx';
import * as tokens from '../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

// Always-visible progress for a running bulk import — the user sees it from any tab,
// and clicking it deep-links to the CV library.
const BulkImportChip = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const bulk = useBulkImport();
	const job = bulk?.activeJob;

	if (!job) return null;

	return (
		<Box
			onClick={() => navigate('/app/cvs')}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/app/cvs'); }}
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: 1,
				px: 1.5,
				py: 0.5,
				mr: 1.5,
				borderRadius: 999,
				border: `1px solid ${alpha(tokens.brand.main, 0.35)}`,
				backgroundColor: alpha(tokens.brand.main, 0.08),
				cursor: 'pointer',
				'&:hover': { backgroundColor: alpha(tokens.brand.main, 0.14) },
				'&:focus-visible': { outline: `2px solid ${tokens.brand.main}`, outlineOffset: 2 },
			}}
		>
			<CircularProgress size={13} thickness={5} sx={{ color: tokens.brand.text }} />
			<Typography sx={{ fontSize: tokens.fontSize.small, fontWeight: 600, color: tokens.status.success.text, whiteSpace: 'nowrap' }}>
				{t('appCVContent.bulk.chip', 'Importing {{processed}} / {{total}}', {
					processed: job.processed, total: job.total })}
			</Typography>
			{bulk.etaMinutes != null && (
				<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.brand.text, whiteSpace: 'nowrap' }}>
					{t('appCVContent.bulk.eta', '~{{minutes}} min left', { minutes: bulk.etaMinutes })}
				</Typography>
			)}
		</Box>
	);
};

export default BulkImportChip;
