import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
	Box, Button, Checkbox, Chip, CircularProgress, InputAdornment, List, ListItemButton,
	TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../../../../shared/ui/ConfirmDialog.jsx';
import dayjs from '../../../../shared/lib/dayjs.js';
import { getJobs } from '../../../jobs/api/jobService.js';
import { estimateMatchingRun, getMatchingRunOptions, startMatchingRun } from '../../api/reportService.js';
import { TOP_N_STEPS, exceedsRemaining, initialTopN, staleReasonKey, unwrap } from '../../model/matchingRun.js';
import * as tokens from '../../../../theme/tokens.js';

/** Most jobs one run may cover — the backend refuses more. */
export const MAX_JOBS_PER_RUN = 50;

/**
 * Starting a matching run: pick open jobs (with a shortcut for every job whose results are out of date), pick
 * how many top candidates to get per job within the plan, and see what it costs before confirming — only new
 * or changed reports are charged, unchanged ones are reused.
 */
const RunMatchingDialog = ({ open, onClose, onStarted, presetJobIds = [], presetTopN = null }) => {
	const { t, i18n } = useTranslation();
	const locale = i18n.language?.slice(0, 2) || 'en';
	const [options, setOptions] = useState(null);
	const [jobs, setJobs] = useState([]);
	const [jobsLoading, setJobsLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [selected, setSelected] = useState(() => new Set(presetJobIds));
	const [topN, setTopN] = useState(presetTopN ?? 10);
	const [estimate, setEstimate] = useState(null);
	const [estimating, setEstimating] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const searchTimer = useRef(null);
	const estimateSeq = useRef(0);

	const loadJobs = async (term = '') => {
		setJobsLoading(true);
		try {
			const params = { status: 'open', pageNumber: 0, pageSize: MAX_JOBS_PER_RUN };
			if (term.trim()) { params.title = term.trim(); params.description = term.trim(); }
			const res = await getJobs(params);
			setJobs(res?.data?.data?.content ?? []);
		} catch { /* the list stays as it was */ } finally {
			setJobsLoading(false);
		}
	};

	// Fresh state every time the dialog opens: the preset jobs, the plan's choices, the first page of open jobs.
	useEffect(() => {
		if (!open) return;
		setSelected(new Set(presetJobIds));
		setSearch('');
		setEstimate(null);
		loadJobs();
		getMatchingRunOptions()
			.then((res) => {
				const opts = unwrap(res);
				setOptions(opts);
				setTopN(initialTopN(presetTopN, opts));
			})
			.catch(() => setOptions({ allowedTopN: [5, 10], defaultTopN: 10, maxTopN: 10 }));
	// eslint-disable-next-line react-hooks/exhaustive-deps -- reset on open only
	}, [open]);

	// Re-estimate whenever the selection or the Top N changes (debounced; only the latest answer counts).
	const selectedKey = [...selected].sort().join(',');
	useEffect(() => {
		if (!open || selected.size === 0 || selected.size > MAX_JOBS_PER_RUN) {
			estimateSeq.current += 1;
			setEstimate(null);
			setEstimating(false);
			return undefined;
		}
		const seq = ++estimateSeq.current;
		setEstimating(true);
		const timer = setTimeout(async () => {
			try {
				const res = await estimateMatchingRun([...selected], topN);
				if (seq === estimateSeq.current) setEstimate(unwrap(res));
			} catch {
				if (seq === estimateSeq.current) setEstimate(null);
			} finally {
				if (seq === estimateSeq.current) setEstimating(false);
			}
		}, 400);
		return () => clearTimeout(timer);
	// eslint-disable-next-line react-hooks/exhaustive-deps -- selectedKey stands for the selection
	}, [open, selectedKey, topN]);

	const toggle = (id) => setSelected((prev) => {
		const next = new Set(prev);
		if (next.has(id)) next.delete(id); else next.add(id);
		return next;
	});

	const selectAllOutdated = async () => {
		try {
			const res = await getJobs({ status: 'open', matchingReportsNeeded: true, pageNumber: 0, pageSize: MAX_JOBS_PER_RUN });
			const outdated = res?.data?.data?.content ?? [];
			setSelected((prev) => new Set([...prev, ...outdated.map((j) => j.id)]));
			// Show them even when the current search hides them.
			setJobs((prev) => [...prev, ...outdated.filter((j) => !prev.some((p) => p.id === j.id))]);
		} catch { /* nothing selected */ }
	};

	const handleConfirm = async () => {
		setSubmitting(true);
		try {
			const res = await startMatchingRun([...selected], topN);
			onStarted?.(unwrap(res)?.run, selected.size);
			onClose();
		} catch { /* the error is shown by the API client */ } finally {
			setSubmitting(false);
		}
	};

	const allowed = options?.allowedTopN ?? [];
	const tooMany = selected.size > MAX_JOBS_PER_RUN;
	const notEnough = exceedsRemaining(estimate);
	const indexing = useMemo(() => (estimate?.jobs ?? []).filter((j) => j.indexing).length, [estimate]);

	return (
		<ConfirmDialog
			open={open}
			title={t('matchingRun.title')}
			confirmLabel={t('matchingRun.start')}
			cancelLabel={t('matchingRun.cancel')}
			onCancel={onClose}
			onConfirm={handleConfirm}
			busy={submitting}
			confirmDisabled={selected.size === 0 || tooMany || estimating || notEnough || !options}
			maxWidth="sm"
			fullWidth
		>
			<Typography sx={{ fontSize: tokens.fontSize.body2, color: 'ink.muted', mb: 1.5 }}>
				{t('matchingRun.subtitle')}
			</Typography>

			{/* Jobs */}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
				<TextField
					size="small"
					value={search}
					placeholder={t('matchingRun.searchJobs')}
					onChange={(e) => {
						const value = e.target.value;
						setSearch(value);
						clearTimeout(searchTimer.current);
						searchTimer.current = setTimeout(() => loadJobs(value), 300);
					}}
					sx={{ flex: 1, minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: tokens.fontSize.body2 } }}
					InputProps={{
						startAdornment: <InputAdornment position="start"><SearchOutlinedIcon sx={{ fontSize: tokens.iconSize.md, color: 'ink.subtle' }} /></InputAdornment>,
						endAdornment: jobsLoading ? <InputAdornment position="end"><CircularProgress size={12} /></InputAdornment> : null,
					}}
				/>
				<Button size="small" onClick={selectAllOutdated} sx={{ textTransform: 'none', fontSize: tokens.fontSize.small }}>
					{t('matchingRun.selectAllOutdated')}
				</Button>
				{selected.size > 0 && (
					<Button size="small" onClick={() => setSelected(new Set())} sx={{ textTransform: 'none', fontSize: tokens.fontSize.small, color: 'ink.muted' }}>
						{t('matchingRun.clearSelection')}
					</Button>
				)}
			</Box>

			<List dense disablePadding sx={{ maxHeight: 260, overflowY: 'auto', border: '1px solid', borderColor: 'line.main', borderRadius: 2 }}>
				{jobs.length === 0 && !jobsLoading && (
					<Typography sx={{ fontSize: tokens.fontSize.body2, color: 'ink.subtle', p: 1.5 }}>{t('matchingRun.noOpenJobs')}</Typography>
				)}
				{jobs.map((job) => {
					const reasonKey = staleReasonKey(job);
					return (
						<ListItemButton key={job.id} onClick={() => toggle(job.id)} sx={{ gap: 1, py: 0.5 }}>
							<Checkbox size="small" checked={selected.has(job.id)} tabIndex={-1} disableRipple sx={{ p: 0.5 }}
								inputProps={{ 'aria-label': job.title }} />
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Typography sx={{ fontSize: tokens.fontSize.body2, color: 'ink.strong', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
									{job.title}
								</Typography>
								<Typography sx={{ fontSize: tokens.fontSize.caption, color: 'ink.subtle' }}>
									{job.lastMatchedAt
										? t('matchingRun.lastMatched', { date: dayjs(job.lastMatchedAt).locale(locale).format('LL'), topN: job.matchingTopN ?? 10 })
										: t('matchingRun.neverMatched')}
								</Typography>
							</Box>
							{reasonKey && (
								<Chip size="small" label={t(reasonKey, { count: job.newCandidateCount ?? 0, topN: job.matchingTopN ?? 10 })}
									sx={{ height: 20, fontSize: tokens.fontSize.caption, backgroundColor: 'rgba(245,158,11,0.12)', color: tokens.status.warning.text, maxWidth: 200 }} />
							)}
						</ListItemButton>
					);
				})}
			</List>
			<Typography sx={{ fontSize: tokens.fontSize.caption, color: tooMany ? 'status.error.main' : 'ink.subtle', mt: 0.5 }}>
				{tooMany ? t('matchingRun.tooManyJobs', { max: MAX_JOBS_PER_RUN }) : t('matchingRun.selectedCount', { count: selected.size })}
			</Typography>

			{/* Top N */}
			<Typography sx={{ fontSize: tokens.fontSize.small, fontWeight: 600, color: 'ink.strong', mt: 2, mb: 0.75 }}>
				{t('matchingRun.topNLabel')}
			</Typography>
			<ToggleButtonGroup exclusive size="small" value={topN} onChange={(_, value) => { if (value != null) setTopN(value); }}>
				{TOP_N_STEPS.map((n) => {
					const locked = options != null && !allowed.includes(n);
					const button = (
						<ToggleButton key={n} value={n} disabled={locked} sx={{ textTransform: 'none', px: 1.5, fontSize: tokens.fontSize.small, gap: 0.5 }}>
							{locked && <LockOutlinedIcon sx={{ fontSize: tokens.iconSize.sm }} />}
							{t('matchingRun.topNOption', { n })}
						</ToggleButton>
					);
					return locked
						? <Tooltip key={n} title={t('matchingRun.topNLocked')}><span>{button}</span></Tooltip>
						: button;
				})}
			</ToggleButtonGroup>

			{/* Cost */}
			<Box sx={{ mt: 2, px: 1.5, py: 1.25, borderRadius: 2, backgroundColor: 'surface.subtle', border: '1px solid', borderColor: notEnough ? 'status.error.main' : 'line.main', minHeight: 48 }}>
				{selected.size === 0 && (
					<Typography sx={{ fontSize: tokens.fontSize.body2, color: 'ink.subtle' }}>{t('matchingRun.selectJobsFirst')}</Typography>
				)}
				{selected.size > 0 && estimating && (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<CircularProgress size={14} />
						<Typography sx={{ fontSize: tokens.fontSize.body2, color: 'ink.subtle' }}>{t('matchingRun.estimating')}</Typography>
					</Box>
				)}
				{selected.size > 0 && !estimating && estimate && (
					<>
						<Typography sx={{ fontSize: tokens.fontSize.body2, color: 'ink.strong' }}>
							{t('matchingRun.estimateCandidates', { candidates: estimate.candidates, newReports: estimate.newReports, reused: estimate.reusedReports })}
						</Typography>
						<Typography sx={{ fontSize: tokens.fontSize.small, color: 'ink.muted', mt: 0.5 }}>
							{estimate.remainingActions != null
								? t('matchingRun.estimateActionsLeft', { actions: estimate.estimatedActions, remaining: estimate.remainingActions })
								: t('matchingRun.estimateActions', { actions: estimate.estimatedActions })}
						</Typography>
						{notEnough && (
							<Typography sx={{ fontSize: tokens.fontSize.small, color: 'status.error.main', mt: 0.5 }}>{t('matchingRun.notEnoughActions')}</Typography>
						)}
						{indexing > 0 && (
							<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.status.warning.text, mt: 0.5 }}>{t('matchingRun.indexing', { count: indexing })}</Typography>
						)}
					</>
				)}
			</Box>
		</ConfirmDialog>
	);
};

RunMatchingDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onStarted: PropTypes.func,
	presetJobIds: PropTypes.arrayOf(PropTypes.string),
	presetTopN: PropTypes.number,
};

export default RunMatchingDialog;
