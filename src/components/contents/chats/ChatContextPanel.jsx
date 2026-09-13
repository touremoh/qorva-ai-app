import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Chip, CircularProgress, IconButton, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AppCVDetails from '../cv/AppCVDetails.jsx';
import AppMatchingReportDetails from '../reports/AppMatchingReportDetails.jsx';
import JobPostReadView from '../jobs/JobPostReadView.jsx';
import { getCVById } from '../../../services/cvService.js';
import { getJobById } from '../../../services/jobService.js';
import { resolveError } from '../../../utils/errorHandler.js';

const THEME_GREEN = '#629C44';
const TAB_KEY = 'qorva.chat.contextTab';
const TAB_RESUME = 0, TAB_JOB = 2; // 1 = report

const tabsSx = {
	borderBottom: '1px solid #e2e8f0', minHeight: 40, px: 1, backgroundColor: '#ffffff', flex: 1,
	'& .MuiTabs-indicator': { backgroundColor: THEME_GREEN },
	'& .MuiTab-root': { textTransform: 'none', fontSize: '0.8rem', minHeight: 40, py: 1, color: '#64748b' },
	'& .MuiTab-root.Mui-selected': { color: THEME_GREEN, fontWeight: 600 },
};

const readTab = () => { try { const v = Number(localStorage.getItem(TAB_KEY)); return [0, 1, 2].includes(v) ? v : TAB_RESUME; } catch { return TAB_RESUME; } };

const Centered = ({ children }) => (
	<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, p: 3, textAlign: 'center' }}>
		{children}
	</Box>
);
Centered.propTypes = { children: PropTypes.node };

// Side panel of the resume chat: the CV, the screening report and the job post the chat is
// about. Only the active tab is mounted (the CV and report views each fetch the tenant logo on
// mount), and fetched CVs / jobs are cached per id so switching tabs does not refetch.
const ChatContextPanel = ({ chat, report, onReportRefresh, onCvUpdated, onClose }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [tab, setTab] = useState(readTab);
	const [cv, setCv] = useState(null);
	const [job, setJob] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const cvCache = useRef(new Map());
	const jobCache = useRef(new Map());

	const cvId = chat?.context?.cvId;
	const jobPostId = chat?.context?.jobPostId;

	const changeTab = (_, v) => {
		setTab(v);
		try { localStorage.setItem(TAB_KEY, String(v)); } catch { /* per-viewer convenience only */ }
	};

	useEffect(() => {
		let cancelled = false;
		const load = async (id, cache, fetcher, setter) => {
			if (!id) { setter(null); return; }
			if (cache.current.has(id)) { setter(cache.current.get(id)); return; }
			setLoading(true); setError(null);
			try {
				const resp = await fetcher(id);
				const data = resp?.data?.data ?? resp?.data ?? null;
				cache.current.set(id, data);
				if (!cancelled) setter(data);
			} catch (e) {
				if (!cancelled) setError(resolveError(e));
			} finally {
				if (!cancelled) setLoading(false);
			}
		};
		if (tab === TAB_RESUME) load(cvId, cvCache, getCVById, setCv);
		if (tab === TAB_JOB) load(jobPostId, jobCache, getJobById, setJob);
		return () => { cancelled = true; };
	}, [tab, cvId, jobPostId]);

	const handleCvUpdate = (updated) => {
		if (updated?.id) cvCache.current.set(updated.id, updated);
		setCv(updated);
		onCvUpdated?.(updated);
	};

	const body = () => {
		if (error) return <Centered><Typography sx={{ fontSize: '0.82rem', color: '#b91c1c' }}>{error}</Typography></Centered>;
		if (loading) return <Centered><CircularProgress size={22} sx={{ color: THEME_GREEN }} /></Centered>;
		if (tab === TAB_RESUME) return cv ? <AppCVDetails cv={cv} onUpdate={handleCvUpdate} /> : null;
		if (tab === TAB_JOB) return job ? <JobPostReadView job={job} /> : null;
		if (report) return <AppMatchingReportDetails reportData={report} />;
		return (
			<Centered>
				<AssessmentOutlinedIcon sx={{ fontSize: 36, color: '#cbd5e1' }} />
				<Chip
					size="small"
					icon={<AssessmentOutlinedIcon sx={{ fontSize: '13px !important' }} />}
					label={t('appAIResumeChat.runScreening')}
					onClick={() => navigate('/app/reports')}
					variant="outlined"
					sx={{ fontSize: '0.72rem', color: '#92400e', borderColor: '#fcd34d', backgroundColor: '#fffbeb', cursor: 'pointer' }}
				/>
				<Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: 360 }}>
					{t('appAIResumeChat.noReportYetHint')}
				</Typography>
				<Button size="small" startIcon={<RefreshOutlinedIcon sx={{ fontSize: 14 }} />} onClick={onReportRefresh}
					sx={{ textTransform: 'none', fontSize: '0.78rem', color: THEME_GREEN }}>
					{t('appAIResumeChat.refreshReport')}
				</Button>
			</Centered>
		);
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, backgroundColor: '#f8fafc', textAlign: 'left' }}>
			<Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, backgroundColor: '#ffffff' }}>
				<Tabs value={tab} onChange={changeTab} sx={tabsSx} variant="fullWidth">
					<Tab label={t('appAIResumeChat.tabResume')} />
					<Tab label={t('appAIResumeChat.tabReport')} />
					<Tab label={t('appAIResumeChat.tabJob')} />
				</Tabs>
				{onClose && (
					<Tooltip title={t('appAIResumeChat.hideContext')}>
						<IconButton size="small" onClick={onClose} sx={{ mx: 0.5, color: '#64748b' }}>
							<CloseIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
				)}
			</Box>
			<Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
				{body()}
			</Box>
		</Box>
	);
};

ChatContextPanel.propTypes = {
	chat: PropTypes.object,
	report: PropTypes.object,
	onReportRefresh: PropTypes.func,
	onCvUpdated: PropTypes.func,
	onClose: PropTypes.func,
};

export default ChatContextPanel;
