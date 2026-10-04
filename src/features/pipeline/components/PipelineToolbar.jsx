import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, FormControl, FormControlLabel, IconButton, InputAdornment, InputLabel, MenuItem, Select, Switch, TextField, Tooltip, Typography } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import { useTranslation } from 'react-i18next';
import { getJobs } from '../../jobs/api/jobService.js';
import * as tokens from '../../../theme/tokens.js';

/** Job (or all jobs), candidate search, hide outdated, refresh — and how many candidates the board holds. */
const PipelineToolbar = ({ filters, onChange, total, onRefresh }) => {
	const { t } = useTranslation();
	const [jobs, setJobs] = useState([]);
	const [search, setSearch] = useState(filters.q ?? '');
	const debounce = useRef(null);

	useEffect(() => {
		getJobs({ pageNumber: 0, pageSize: 100 })
			.then((res) => setJobs(res?.data?.data?.content ?? []))
			.catch(() => { /* the picker just offers all jobs */ });
	}, []);
	useEffect(() => () => clearTimeout(debounce.current), []);

	const onSearch = (value) => {
		setSearch(value);
		clearTimeout(debounce.current);
		debounce.current = setTimeout(() => onChange({ q: value }), 300);
	};
	// A remembered job that no longer exists falls back to all jobs.
	const jobValue = jobs.length && filters.jobPostId && !jobs.some((j) => j.id === filters.jobPostId) ? '' : (filters.jobPostId ?? '');

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, flexWrap: 'wrap', flexShrink: 0,
			backgroundColor: tokens.surface.paper, borderBottom: `1px solid ${tokens.line.main}` }}>
			<ViewKanbanOutlinedIcon sx={{ color: tokens.brand.text, fontSize: tokens.iconSize.lg }} />
			<Typography sx={{ fontWeight: 600, fontSize: tokens.fontSize.body, color: tokens.ink.strong }}>{t('pipeline.title')}</Typography>
			<Typography data-testid="pipeline-total" sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.muted, mr: 1 }}>
				{t('pipeline.total', { count: total })}
			</Typography>
			<FormControl size="small" sx={{ minWidth: 220 }}>
				<InputLabel id="pipeline-job-label" shrink sx={{ fontSize: tokens.fontSize.body2 }}>{t('pipeline.job')}</InputLabel>
				<Select labelId="pipeline-job-label" label={t('pipeline.job')} value={jobValue} displayEmpty notched
					onChange={(e) => onChange({ jobPostId: e.target.value })} sx={{ borderRadius: 2, fontSize: tokens.fontSize.body2 }}>
					<MenuItem value="" sx={{ fontSize: tokens.fontSize.body2 }}>{t('pipeline.allJobs')}</MenuItem>
					{jobs.map((job) => <MenuItem key={job.id} value={job.id} sx={{ fontSize: tokens.fontSize.body2 }}>{job.title}</MenuItem>)}
				</Select>
			</FormControl>
			<TextField size="small" value={search} onChange={(e) => onSearch(e.target.value)} placeholder={t('pipeline.search')}
				inputProps={{ 'aria-label': t('pipeline.search') }}
				sx={{ minWidth: 200, flex: { xs: 1, md: 'unset' }, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: tokens.fontSize.body2 } }}
				InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlinedIcon sx={{ fontSize: tokens.iconSize.md, color: tokens.ink.subtle }} /></InputAdornment> }} />
			<FormControlLabel sx={{ mr: 0 }}
				control={<Switch size="small" checked={!!filters.hideOutdated} onChange={(e) => onChange({ hideOutdated: e.target.checked })} />}
				label={<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.muted }}>{t('matchingRun.hideOutdated')}</Typography>} />
			<Box sx={{ flex: 1 }} />
			<Tooltip title={t('pipeline.refresh')}>
				<IconButton size="small" onClick={onRefresh} aria-label={t('pipeline.refresh')}><RefreshIcon sx={{ fontSize: tokens.iconSize.lg }} /></IconButton>
			</Tooltip>
		</Box>
	);
};

PipelineToolbar.propTypes = {
	filters: PropTypes.shape({ jobPostId: PropTypes.string, q: PropTypes.string, hideOutdated: PropTypes.bool }).isRequired,
	onChange: PropTypes.func.isRequired,
	total: PropTypes.number,
	onRefresh: PropTypes.func.isRequired,
};

export default PipelineToolbar;
