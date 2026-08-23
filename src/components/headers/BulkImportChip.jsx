// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBulkImport } from '../../contexts/BulkImportContext.jsx';

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
				border: '1px solid rgba(98,156,68,0.35)',
				backgroundColor: 'rgba(98,156,68,0.08)',
				cursor: 'pointer',
				'&:hover': { backgroundColor: 'rgba(98,156,68,0.14)' },
				'&:focus-visible': { outline: '2px solid #629C44', outlineOffset: 2 },
			}}
		>
			<CircularProgress size={13} thickness={5} sx={{ color: '#629C44' }} />
			<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#166534', whiteSpace: 'nowrap' }}>
				{t('appCVContent.bulk.chip', 'Importing {{processed}} / {{total}}', {
					processed: job.processed, total: job.total })}
			</Typography>
			{bulk.etaMinutes != null && (
				<Typography sx={{ fontSize: '0.72rem', color: '#629C44', whiteSpace: 'nowrap' }}>
					{t('appCVContent.bulk.eta', '~{{minutes}} min left', { minutes: bulk.etaMinutes })}
				</Typography>
			)}
		</Box>
	);
};

export default BulkImportChip;
