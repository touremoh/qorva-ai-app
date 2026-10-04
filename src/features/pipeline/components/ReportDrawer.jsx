import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Drawer, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import AppMatchingReportDetails from '../../reports/components/AppMatchingReportDetails.jsx';
import { getReport } from '../api/pipelineService.js';
import * as tokens from '../../../theme/tokens.js';

/**
 * The full report of a card, beside the board. Its status chip moves the card on the board too. Focus isn't
 * trapped, so the email composer opened from the report stays editable.
 */
const ReportDrawer = ({ reportId, onClose, onStatusChange }) => {
	const { t } = useTranslation();
	const [report, setReport] = useState(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		if (!reportId) return undefined;
		let cancelled = false;
		setReport(null);
		setFailed(false);
		getReport(reportId)
			.then((res) => { if (!cancelled) setReport(res?.data?.data ?? null); })
			.catch(() => { if (!cancelled) setFailed(true); });
		return () => { cancelled = true; };
	}, [reportId]);

	const changeStatus = onStatusChange ? async (current, status) => {
		const updated = await onStatusChange(current, status);
		if (updated) setReport((prev) => ({ ...prev, ...updated }));
	} : undefined;

	return (
		<Drawer anchor="right" open={Boolean(reportId)} onClose={onClose} disableEnforceFocus disableRestoreFocus
			PaperProps={{ sx: { width: { xs: '100%', md: 'min(960px, 92vw)' }, backgroundColor: tokens.surface.subtle } }}>
			<Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, backgroundColor: tokens.surface.paper, borderBottom: `1px solid ${tokens.line.main}` }}>
				<Typography sx={{ flex: 1, fontSize: tokens.fontSize.body2, fontWeight: 700, color: tokens.ink.strong }}>
					{report?.candidateInfo?.candidateName ?? t('pipeline.report')}
				</Typography>
				<IconButton size="small" onClick={onClose} aria-label={t('pipeline.close')}><CloseIcon sx={{ fontSize: tokens.iconSize.md }} /></IconButton>
			</Box>
			<Box data-testid="pipeline-report-drawer" sx={{ flex: 1, minHeight: 0 }}>
				{failed && <Typography sx={{ p: 3, fontSize: tokens.fontSize.body2, color: tokens.status.error.text }}>{t('pipeline.errors.report')}</Typography>}
				{!failed && !report && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={24} /></Box>}
				{report && <AppMatchingReportDetails reportData={report} onStatusChange={changeStatus} />}
			</Box>
		</Drawer>
	);
};

ReportDrawer.propTypes = {
	reportId: PropTypes.string,
	onClose: PropTypes.func.isRequired,
	onStatusChange: PropTypes.func,
};

export default ReportDrawer;
