import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, FormControl, MenuItem, Paper, Select, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import SectionHeader from '../../../shared/ui/SectionHeader.jsx';
import { getPipeline } from '../api/dashboardService.js';
import { PIPELINE_COLUMNS, PIPELINE_PERIODS, formatHoursToShortlist, isPipelineEmpty, periodRange } from '../model/pipeline.js';
import { statusChipSx } from '../../reports/model/reportStatus.js';
import * as tokens from '../../../theme/tokens.js';

const cellSx = { fontSize: tokens.fontSize.small, py: 1, px: 1.25, whiteSpace: 'nowrap' };

/**
 * Where candidates stand and who moved them: current counts per status, then per recruiter the moves into each
 * status in the period and the median time from a report to its shortlist. Filtered by period and job.
 */
const PipelineCard = ({ t, jobs }) => {
	const [days, setDays] = useState(PIPELINE_PERIODS[0]);
	const [jobPostId, setJobPostId] = useState('');
	const [data, setData] = useState(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		getPipeline({ ...periodRange(days), jobPostId: jobPostId || undefined })
			.then((res) => { if (!cancelled) { setData(res?.data ?? null); setFailed(false); } })
			.catch(() => { if (!cancelled) setFailed(true); });
		return () => { cancelled = true; };
	}, [days, jobPostId]);

	if (failed) return null;

	const shortlistTime = (hours) => {
		const f = formatHoursToShortlist(hours);
		return f ? t(`dashboard.pipeline.${f.unit}`, { count: f.value }) : '—';
	};

	return (
		<Paper elevation={0} data-testid="pipeline-card" sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, p: 2.5, minWidth: 0 }}>
			<SectionHeader sx={{ pb: 1.5 }} icon={ViewKanbanOutlinedIcon} label={t('dashboard.sections.pipeline')}
				action={(
					<Box sx={{ display: 'flex', gap: 1 }}>
						<FormControl size="small">
							<Select value={jobPostId} displayEmpty onChange={(e) => setJobPostId(e.target.value)}
								inputProps={{ 'aria-label': t('dashboard.pipeline.job') }}
								sx={{ fontSize: tokens.fontSize.small, borderRadius: 1.5, maxWidth: 220 }}>
								<MenuItem value="" sx={{ fontSize: tokens.fontSize.small }}>{t('dashboard.pipeline.allJobs')}</MenuItem>
								{(jobs ?? []).map((job) => (
									<MenuItem key={job.jobPostId} value={job.jobPostId} sx={{ fontSize: tokens.fontSize.small }}>{job.jobPostTitle}</MenuItem>
								))}
							</Select>
						</FormControl>
						<FormControl size="small">
							<Select value={days} onChange={(e) => setDays(e.target.value)} inputProps={{ 'aria-label': t('dashboard.pipeline.period') }}
								sx={{ fontSize: tokens.fontSize.small, borderRadius: 1.5 }}>
								{[...PIPELINE_PERIODS].sort((a, b) => a - b).map((d) => (
									<MenuItem key={d} value={d} sx={{ fontSize: tokens.fontSize.small }}>{t('dashboard.pipeline.lastDays', { count: d })}</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
				)}
			/>

			{data && (
				<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
					{PIPELINE_COLUMNS.map((s) => (
						<Chip key={s} size="small" label={`${t(`reportStatus.values.${s}`)} · ${data.currentByStatus?.[s] ?? 0}`}
							sx={{ fontSize: tokens.fontSize.caption, fontWeight: 600, ...statusChipSx(s) }} />
					))}
				</Box>
			)}

			{isPipelineEmpty(data) ? (
				<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.subtle }}>{t('dashboard.pipeline.empty')}</Typography>
			) : (data.recruiters ?? []).length > 0 && (
				<Box sx={{ overflowX: 'auto' }}>
					<Table size="small" aria-label={t('dashboard.sections.pipeline')}>
						<TableHead>
							<TableRow>
								<TableCell sx={{ ...cellSx, fontWeight: 600 }}>{t('dashboard.pipeline.recruiter')}</TableCell>
								{PIPELINE_COLUMNS.map((s) => (
									<TableCell key={s} align="right" sx={{ ...cellSx, fontWeight: 600 }}>{t(`reportStatus.values.${s}`)}</TableCell>
								))}
								<TableCell align="right" sx={{ ...cellSx, fontWeight: 600 }}>{t('dashboard.pipeline.timeToShortlist')}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{data.recruiters.map((r) => (
								<TableRow key={r.by}>
									<TableCell sx={cellSx}>{r.by === 'COPILOT' ? t('dashboard.pipeline.copilot') : r.name}</TableCell>
									{PIPELINE_COLUMNS.map((s) => (
										<TableCell key={s} align="right" sx={{ ...cellSx, color: r.movesByStatus?.[s] ? tokens.ink.strong : tokens.ink.faint }}>
											{r.movesByStatus?.[s] ?? 0}
										</TableCell>
									))}
									<TableCell align="right" sx={cellSx}>{shortlistTime(r.medianHoursToShortlist)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Box>
			)}
		</Paper>
	);
};

PipelineCard.propTypes = {
	t: PropTypes.func.isRequired,
	jobs: PropTypes.arrayOf(PropTypes.shape({ jobPostId: PropTypes.string, jobPostTitle: PropTypes.string })),
};

export default PipelineCard;
