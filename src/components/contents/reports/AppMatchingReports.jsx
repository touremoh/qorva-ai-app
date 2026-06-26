// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
	Autocomplete,
	Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
	DialogTitle, FormControl, IconButton, InputAdornment,
	InputLabel, LinearProgress, ListItemButton, Menu, MenuItem, Pagination,
	Select, TextField, Tooltip, Typography,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { useTranslation } from 'react-i18next';
import AppMatchingReportDetails from './AppMatchingReportDetails.jsx';
import { getReports, getReportsByFilter, startMatching, deleteReport, exportCsv } from '../../../services/reportService.js';
import { getJobs } from '../../../services/jobService.js';
import { QORVA_USER_LANGUAGE } from '../../../constants.js';

const PAGE_SIZES = [10, 25, 50, 100];

const getMatchingPhaseKey = (elapsed) => {
	if (elapsed < 10) return 'matchingPhase1';
	if (elapsed < 20) return 'matchingPhase2';
	if (elapsed < 30) return 'matchingPhase3';
	if (elapsed < 50) return 'matchingPhase4';
	return 'matchingPhase5';
};

const scoreChipSx = (score) => {
	if (score >= 70) return { backgroundColor: '#dcfce7', color: '#166534' };
	if (score >= 40) return { backgroundColor: '#fef9c3', color: '#854d0e' };
	return { backgroundColor: '#fee2e2', color: '#991b1b' };
};

const getInitials = (name = '') =>
	name.split(' ').slice(0, 2).map((p) => p[0] ?? '').join('').toUpperCase();

const AppMatchingReports = () => {
	const { t } = useTranslation();

	const [reports, setReports] = useState([]);
	const [jobs, setJobs] = useState([]);
	const [selectedReport, setSelectedReport] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortOrder, setSortOrder] = useState('desc');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [totalElements, setTotalElements] = useState(0);
	const [pageSize, setPageSize] = useState(25);
	const [selectedJobId, setSelectedJobId] = useState('');
	const [filterRecommendation, setFilterRecommendation] = useState('');
	const [filterConfidence, setFilterConfidence] = useState('');
	const [anchorEl, setAnchorEl] = useState(null);
	const [menuReport, setMenuReport] = useState(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingReport, setDeletingReport] = useState(false);
	const [matchingLoading, setScreeningLoading] = useState(false);
	const [matchingSubmitted, setScreeningSubmitted] = useState(false);
	const [matchingCompleted, setMatchingCompleted] = useState(false);
	const [bannerDismissed, setBannerDismissed] = useState(false);

	const pollingRef      = useRef(null);
	const latestParamsRef = useRef({ selectedJobId: '', searchTerm: '', filterRecommendation: '', filterConfidence: '', pageSize: 25 });
	const progressTimerRef = useRef(null);
	const matchingStartRef = useRef(null);

	const [matchingProgress, setMatchingProgress] = useState(0);
	const [matchingElapsed, setMatchingElapsed] = useState(0);
	const [exportLoading, setExportLoading] = useState(false);
	const [selectedJobFilter, setSelectedJobFilter] = useState(null);
	const [jobOptions, setJobOptions] = useState([]);
	const [jobOptionsLoading, setJobOptionsLoading] = useState(false);
	const [jobInputValue, setJobInputValue] = useState('');
	const jobSearchRef = useRef(null);

	const fetchData = async (pageNumber, jobId, term, recommendation, confidence, size) => {
		try {
			const hasSearch = term && term.trim();
			const params = {
				pageNumber,
				pageSize: size ?? pageSize,
				...(jobId ? { jobPostId: jobId } : {}),
				...(hasSearch ? { searchTerms: term.trim() } : {}),
				...(recommendation ? { recommendation } : {}),
				...(confidence ? { confidenceLevel: confidence } : {}),
			};
			const response = hasSearch
				? await getReportsByFilter(params)
				: await getReports(params);
			const content = response?.data?.data?.content ?? [];
			const sorted = [...content].sort((a, b) => {
				const sa = a.matchingReportDetails?.decisionSummary?.finalScore ?? 0;
				const sb = b.matchingReportDetails?.decisionSummary?.finalScore ?? 0;
				return sb - sa;
			});
			setReports(content);
			setTotalPages(response?.data?.data?.totalPages ?? 1);
			setTotalElements(response?.data?.data?.totalElements ?? 0);
			setSelectedReport(sorted[0] ?? null);
		} catch (error) {
			console.error('Error fetching reports:', error);
		}
	};

	const fetchJobs = async () => {
		try {
			const response = await getJobs({ pageSize: 25, pageNumber: 0 });
			const content = response?.data?.data?.content ?? [];
			setJobs(content);
			setJobOptions(prev => prev.length === 0 ? content : prev);
		} catch (error) {
			console.error('Error fetching jobs:', error);
		}
	};

	const fetchJobOptions = async (term = '') => {
		setJobOptionsLoading(true);
		try {
			const params = { pageSize: 25, pageNumber: 0 };
			if (term.trim()) { params.title = term.trim(); params.description = term.trim(); }
			const res = await getJobs(params);
			setJobOptions(res?.data?.data?.content ?? []);
		} catch (e) { /* silent */ }
		finally { setJobOptionsLoading(false); }
	};

	useEffect(() => {
		fetchData(0, '', '', '', '');
		fetchJobs();
	}, []);

	// Keep latest filter params accessible inside the polling closure without recreating the interval
	useEffect(() => {
		latestParamsRef.current = { selectedJobId, searchTerm, filterRecommendation, filterConfidence, pageSize };
	}, [selectedJobId, searchTerm, filterRecommendation, filterConfidence, pageSize]);

	// Poll every 5 s while matching is in progress; stop when no jobs remain pending
	useEffect(() => {
		if (!matchingSubmitted) {
			if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
			return;
		}

		let attempts = 0;
		const MAX_ATTEMPTS = 72; // 6 minutes max

		const poll = async () => {
			attempts += 1;
			const { selectedJobId, searchTerm, filterRecommendation, filterConfidence, pageSize } = latestParamsRef.current;
			try {
				await fetchData(0, selectedJobId, searchTerm, filterRecommendation, filterConfidence, pageSize);
				const jobsRes = await getJobs({ pageSize: 25, pageNumber: 0 });
				const updatedJobs = jobsRes?.data?.data?.content ?? [];
				setJobs(updatedJobs);
				const pending = updatedJobs.filter(j => j.matchingReportsNeeded === true).length;
				if (pending === 0 || attempts >= MAX_ATTEMPTS) {
					clearInterval(pollingRef.current);
					pollingRef.current = null;
					setScreeningSubmitted(false);
					setMatchingCompleted(true);
					setBannerDismissed(false);
				}
			} catch (err) {
				console.error('Polling error:', err);
			}
		};

		pollingRef.current = setInterval(poll, 5000);
		return () => { clearInterval(pollingRef.current); pollingRef.current = null; };
	}, [matchingSubmitted]); // eslint-disable-line react-hooks/exhaustive-deps

	// Drive progress bar while matching is running (starts on button click, not just after API returns)
	useEffect(() => {
		const isActive = matchingLoading || matchingSubmitted;
		if (isActive) {
			if (!progressTimerRef.current) {
				matchingStartRef.current = Date.now();
				setMatchingProgress(0);
				setMatchingElapsed(0);
				progressTimerRef.current = setInterval(() => {
					const elapsed = Math.floor((Date.now() - matchingStartRef.current) / 1000);
					setMatchingElapsed(elapsed);
					setMatchingProgress(Math.min(92, (elapsed / 60) * 100));
				}, 500);
			}
		} else {
			clearInterval(progressTimerRef.current);
			progressTimerRef.current = null;
			setMatchingProgress(0);
			setMatchingElapsed(0);
		}
	}, [matchingLoading, matchingSubmitted]);

	// Clear timer on unmount
	useEffect(() => () => { clearInterval(progressTimerRef.current); }, []);

	const handleSearchChange = (event) => {
		const value = event.target.value;
		setSearchTerm(value);
		setCurrentPage(1);
		fetchData(0, selectedJobId, value, filterRecommendation, filterConfidence);
	};

	const handleJobAutocompleteChange = (_, newValue) => {
		setSelectedJobFilter(newValue);
		const jobId = newValue?.id ?? '';
		setSelectedJobId(jobId);
		setCurrentPage(1);
		fetchData(0, jobId, searchTerm, filterRecommendation, filterConfidence);
	};

	const handleRecommendationChange = (event) => {
		const value = event.target.value;
		setFilterRecommendation(value);
		setCurrentPage(1);
		fetchData(0, selectedJobId, searchTerm, value, filterConfidence);
	};

	const handleConfidenceChange = (event) => {
		const value = event.target.value;
		setFilterConfidence(value);
		setCurrentPage(1);
		fetchData(0, selectedJobId, searchTerm, filterRecommendation, value);
	};

	const handlePageChange = (_, value) => {
		setCurrentPage(value);
		fetchData(value - 1, selectedJobId, searchTerm, filterRecommendation, filterConfidence);
	};

	const handlePageSizeChange = (e) => {
		const newSize = e.target.value;
		setPageSize(newSize);
		setCurrentPage(1);
		fetchData(0, selectedJobId, searchTerm, filterRecommendation, filterConfidence, newSize);
	};

	const sortedReports = useMemo(() => {
		return [...reports].sort((a, b) => {
			const sa = a.matchingReportDetails?.decisionSummary?.finalScore ?? 0;
			const sb = b.matchingReportDetails?.decisionSummary?.finalScore ?? 0;
			return sortOrder === 'asc' ? sa - sb : sb - sa;
		});
	}, [reports, sortOrder]);

	const pendingMatchingCount = useMemo(
		() => jobs.filter(j => j.matchingReportsNeeded === true).length,
		[jobs]
	);

	const handleStartMatching = async () => {
		try {
			setScreeningLoading(true);
			setMatchingCompleted(false);
			setBannerDismissed(false);
			await startMatching();
			await fetchJobs();
			setScreeningSubmitted(true);
		} catch (error) {
			console.error('Error starting matching:', error);
		} finally {
			setScreeningLoading(false);
		}
	};

	const handleMenuOpen = (event, report) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
		setMenuReport(report);
	};
	const handleMenuClose = () => { setAnchorEl(null); };

	const handleDeleteClick = () => {
		setAnchorEl(null);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!menuReport) return;
		try {
			setDeletingReport(true);
			await deleteReport(menuReport.id);
			setReports(prev => prev.filter(r => r.id !== menuReport.id));
			if (selectedReport?.id === menuReport.id) setSelectedReport(null);
		} catch (error) {
			console.error('Error deleting report:', error);
		} finally {
			setDeletingReport(false);
			setDeleteDialogOpen(false);
			setMenuReport(null);
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
		setMenuReport(null);
	};

	const handleExportCsv = async () => {
		if (!selectedJobId) return;
		try {
			setExportLoading(true);
			const lang = localStorage.getItem(QORVA_USER_LANGUAGE) ?? 'en';
			const format = lang === 'en' ? 'global' : 'eu';
			const response = await exportCsv(selectedJobId, format);
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `matching-export-${selectedJobId}.csv`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Error exporting CSV:', error);
		} finally {
			setExportLoading(false);
		}
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#f8fafc' }}>

			{/* Toolbar */}
			<Box sx={{
				display: 'flex', alignItems: 'center', gap: 1.5,
				px: 2, py: 1.5,
				backgroundColor: '#ffffff',
				borderBottom: '1px solid #e2e8f0',
				flexShrink: 0,
				flexWrap: 'wrap',
			}}>
				<AssessmentOutlinedIcon sx={{ color: '#629C44', fontSize: 20 }} />
				<Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', mr: 1 }}>
					{t('appReportContent.reportListTitle')}
				</Typography>

				<Box sx={{ flex: 1, minWidth: 160 }}>
					<TextField
						size="small"
						placeholder={t('appReportContent.search')}
						value={searchTerm}
						onChange={handleSearchChange}
						fullWidth
						sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.82rem' } }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchOutlinedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
								</InputAdornment>
							),
						}}
					/>
				</Box>

				<Autocomplete
					size="small"
					sx={{ minWidth: 200 }}
					options={jobOptions}
					loading={jobOptionsLoading}
					value={selectedJobFilter}
					inputValue={jobInputValue}
					getOptionLabel={(opt) => opt.title || opt.jobTitle || opt.name || opt.id}
					isOptionEqualToValue={(opt, val) => opt.id === val.id}
					onChange={handleJobAutocompleteChange}
					onInputChange={(_, val, reason) => {
						setJobInputValue(val);
						if (reason === 'input' || reason === 'clear') {
							clearTimeout(jobSearchRef.current);
							jobSearchRef.current = setTimeout(() => fetchJobOptions(val), 300);
						}
					}}
					onOpen={() => { if (jobOptions.length === 0) fetchJobOptions(); }}
					renderInput={(params) => (
						<TextField
							{...params}
							label={t('appReportContent.filterByJob')}
							InputProps={{
								...params.InputProps,
								endAdornment: (
									<>
										{jobOptionsLoading && <CircularProgress size={14} sx={{ mr: 0.5 }} />}
										{params.InputProps.endAdornment}
									</>
								),
								sx: { borderRadius: 2, fontSize: '0.82rem' },
							}}
							InputLabelProps={{ sx: { fontSize: '0.82rem' } }}
						/>
					)}
					renderOption={(props, opt) => (
						<li {...props} key={opt.id} style={{ fontSize: '0.82rem' }}>
							{opt.title || opt.jobTitle || opt.name || opt.id}
						</li>
					)}
					noOptionsText={<Typography sx={{ fontSize: '0.82rem' }}>{t('appReportContent.allJobs')}</Typography>}
				/>

				<FormControl size="small" sx={{ minWidth: 160 }}>
						<InputLabel sx={{ fontSize: '0.82rem' }}>{t('appReportContent.filterByRecommendation')}</InputLabel>
						<Select
							value={filterRecommendation}
							label={t('appReportContent.filterByRecommendation')}
							onChange={handleRecommendationChange}
							sx={{ borderRadius: 2, fontSize: '0.82rem' }}
						>
							<MenuItem value="">{t('appReportContent.allRecommendations')}</MenuItem>
							{['strong_interview', 'interview', 'may_be', 'reject'].map((key) => (
								<MenuItem key={key} value={key} sx={{ fontSize: '0.82rem' }}>
									{t(`appCVMatching.recommendation.${key}`)}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<FormControl size="small" sx={{ minWidth: 150 }}>
						<InputLabel sx={{ fontSize: '0.82rem' }}>{t('appReportContent.filterByConfidence')}</InputLabel>
						<Select
							value={filterConfidence}
							label={t('appReportContent.filterByConfidence')}
							onChange={handleConfidenceChange}
							sx={{ borderRadius: 2, fontSize: '0.82rem' }}
						>
							<MenuItem value="">{t('appReportContent.allConfidences')}</MenuItem>
							{['high', 'medium', 'low'].map((key) => (
								<MenuItem key={key} value={key} sx={{ fontSize: '0.82rem' }}>
									{t(`appCVMatching.confidence.${key}`)}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<Tooltip title={sortOrder === 'asc' ? t('appReportContent.sortDesc') : t('appReportContent.sortAsc')}>
					<IconButton
						size="small"
						onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
						sx={{
							border: '1px solid #e2e8f0', borderRadius: 1.5,
							color: '#64748b',
							'&:hover': { backgroundColor: '#f1f5f9' },
						}}
					>
						{sortOrder === 'asc'
							? <ArrowUpwardOutlinedIcon sx={{ fontSize: 18 }} />
							: <ArrowDownwardOutlinedIcon sx={{ fontSize: 18 }} />
						}
					</IconButton>
				</Tooltip>

				<Tooltip title={!selectedJobId ? t('appReportContent.exportCsvSelectJob') : ''}>
					<span>
						<Button
							size="small"
							variant="outlined"
							onClick={handleExportCsv}
							disabled={!selectedJobId || exportLoading}
							startIcon={exportLoading
								? <CircularProgress size={14} color="inherit" />
								: <FileDownloadOutlinedIcon sx={{ fontSize: 17 }} />
							}
							sx={{
								borderRadius: 1.5, textTransform: 'none', fontSize: '0.82rem',
								borderColor: '#e2e8f0', color: '#475569',
								'&:hover': { borderColor: '#629C44', color: '#629C44', backgroundColor: 'rgba(98,156,68,0.05)' },
								'&.Mui-disabled': { borderColor: '#e2e8f0', color: '#cbd5e1' },
							}}
						>
							{t('appReportContent.exportCsv')}
						</Button>
					</span>
				</Tooltip>
			</Box>

			{/* Matching in progress — progress bar */}
			{(matchingLoading || matchingSubmitted) && (
				<Box sx={{
					px: 2.5, py: 1.5,
					backgroundColor: 'rgba(99,102,241,0.05)',
					borderBottom: '1px solid rgba(99,102,241,0.15)',
					flexShrink: 0,
				}}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<CircularProgress size={14} thickness={5} sx={{ color: '#6366f1' }} />
							<Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#3730a3' }}>
								{t('appReportContent.matchingInProgress')}
							</Typography>
						</Box>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
							<Typography sx={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 500 }}>
								{Math.round(matchingProgress)}%
							</Typography>
							<Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>
								{matchingElapsed < 60
									? `~${Math.max(0, 60 - matchingElapsed)}s ${t('appReportContent.remaining')}`
									: t('appReportContent.almostDone')
								}
							</Typography>
						</Box>
					</Box>
					<LinearProgress
						variant="determinate"
						value={matchingProgress}
						sx={{
							height: 7, borderRadius: 4,
							backgroundColor: 'rgba(99,102,241,0.12)',
							'& .MuiLinearProgress-bar': {
								borderRadius: 4,
								background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 60%, #a5b4fc 100%)',
								transition: 'transform 0.5s linear',
							},
						}}
					/>
					<Typography sx={{ fontSize: '0.72rem', color: '#6366f1', mt: 0.75, fontStyle: 'italic' }}>
						{t(`appReportContent.${getMatchingPhaseKey(matchingElapsed)}`)}
					</Typography>
				</Box>
			)}

			{/* Pending matching banner — start button */}
			{pendingMatchingCount > 0 && !matchingLoading && !matchingSubmitted && (
				<Box sx={{
					display: 'flex', alignItems: 'center', justifyContent: 'space-between',
					px: 2.5, py: 1.25,
					backgroundColor: 'rgba(245,158,11,0.07)',
					borderBottom: '1px solid rgba(245,158,11,0.18)',
					flexShrink: 0, flexWrap: 'wrap', gap: 1.5,
				}}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<WarningAmberIcon sx={{ fontSize: 17, color: '#d97706' }} />
						<Typography sx={{ fontSize: '0.84rem', color: '#92400e', fontWeight: 500 }}>
							{t('appReportContent.matchingNeeded', { count: pendingMatchingCount })}
						</Typography>
					</Box>
					<Button
						variant="contained"
						size="small"
						onClick={handleStartMatching}
						disabled={matchingLoading}
						startIcon={matchingLoading
							? <CircularProgress size={14} color="inherit" />
							: <PlayArrowRoundedIcon sx={{ fontSize: 17 }} />
						}
						sx={{
							backgroundColor: '#d97706',
							'&:hover': { backgroundColor: '#b45309' },
							'&.Mui-disabled': { backgroundColor: 'rgba(245,158,11,0.3)', color: '#92400e', boxShadow: 'none' },
							borderRadius: 1.5, textTransform: 'none', fontSize: '0.82rem', fontWeight: 600,
							boxShadow: '0 2px 6px rgba(217,119,6,0.3)', flexShrink: 0,
						}}
					>
						{matchingLoading
							? t('appReportContent.matchingInProgress')
							: t('appReportContent.startMatching')}
					</Button>
				</Box>
			)}
			{matchingCompleted && !bannerDismissed && (
				<Box sx={{
					display: 'flex', alignItems: 'center', justifyContent: 'space-between',
					px: 2.5, py: 0.75,
					backgroundColor: 'rgba(98,156,68,0.05)',
					borderBottom: '1px solid rgba(98,156,68,0.12)',
					flexShrink: 0,
				}}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#629C44' }} />
						<Typography sx={{ fontSize: '0.82rem', color: '#3a6827' }}>
							{t('appReportContent.matchingReportsReady')}
						</Typography>
					</Box>
					<IconButton
						size="small"
						onClick={() => setBannerDismissed(true)}
						sx={{ color: '#629C44', opacity: 0.6, '&:hover': { opacity: 1, backgroundColor: 'rgba(98,156,68,0.08)' } }}
					>
						<CloseRoundedIcon sx={{ fontSize: 14 }} />
					</IconButton>
				</Box>
			)}

			{/* Split pane */}
			<Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>

				{/* Left panel */}
				<Box sx={{
					width: { xs: 200, sm: 240, md: 300 },
					flexShrink: 0,
					display: 'flex',
					flexDirection: 'column',
					borderRight: '1px solid #e2e8f0',
					backgroundColor: '#ffffff',
					overflow: 'hidden',
				}}>
					{/* List */}
					<Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
						{sortedReports.length === 0 ? (
							<Box sx={{ px: 2, pt: 2 }}>
								<Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>
									{t('appCVMatching.noAnalysisResult')}
								</Typography>
							</Box>
						) : (
							sortedReports.map((report) => {
								const score = Math.ceil(report.matchingReportDetails?.decisionSummary?.finalScore ?? 0);
								const name = report.candidateInfo?.candidateName ?? '';
								const yrs = report.candidateInfo?.nbYearsExperience;
								const isActive = selectedReport?.id === report.id;

								return (
									<ListItemButton
										key={report.id}
										onClick={() => setSelectedReport(report)}
										sx={{
											px: 1.5, py: 1,
											borderLeft: isActive ? '3px solid #629C44' : '3px solid transparent',
											backgroundColor: isActive ? 'rgba(98,156,68,0.06)' : 'transparent',
											'&:hover': { backgroundColor: isActive ? 'rgba(98,156,68,0.10)' : '#f8fafc' },
											gap: 1.5,
											alignItems: 'flex-start',
										}}
									>
										<Avatar sx={{
											width: 32, height: 32, fontSize: '0.7rem', fontWeight: 700,
											backgroundColor: '#629C44', color: '#fff', flexShrink: 0, mt: 0.25,
										}}>
											{getInitials(name)}
										</Avatar>

										<Box sx={{ flex: 1, minWidth: 0 }}>
											<Typography sx={{
												fontSize: '0.82rem', fontWeight: isActive ? 600 : 400,
												color: '#0f172a', lineHeight: 1.3,
												overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
											}}>
												{name}
											</Typography>
											{yrs != null && (
												<Typography sx={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.3 }}>
													{yrs} {t('appCVContent.yearsAbbr')} {t('appCVContent.experience')}
												</Typography>
											)}
											<Chip
												label={`${score}%`}
												size="small"
												sx={{
													mt: 0.5, height: 18, fontSize: '0.68rem', fontWeight: 700,
													...scoreChipSx(score),
												}}
											/>
										</Box>

										<IconButton
											size="small"
											onClick={(e) => handleMenuOpen(e, report)}
											sx={{ color: '#94a3b8', flexShrink: 0, mt: 0.25 }}
										>
											<MoreVertIcon sx={{ fontSize: 16 }} />
										</IconButton>
									</ListItemButton>
								);
							})
						)}
					</Box>

					{/* Pagination footer */}
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 0.75, borderTop: '1px solid #f1f5f9', flexShrink: 0, gap: 1, flexWrap: 'wrap', backgroundColor: '#fafafa' }}>
						<Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>
							{t('appReportContent.reportCount', { count: totalElements })}
							{totalPages > 1 && <span> · {t('appCVContent.pageOf', { page: currentPage, total: totalPages })}</span>}
						</Typography>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<Select
								size="small"
								value={pageSize}
								onChange={handlePageSizeChange}
								sx={{ fontSize: '0.72rem', height: 24, '& .MuiSelect-select': { py: 0, px: 1 } }}
							>
								{PAGE_SIZES.map(n => <MenuItem key={n} value={n} sx={{ fontSize: '0.78rem' }}>{n}</MenuItem>)}
							</Select>
							{totalPages > 1 && (
								<Pagination
									count={totalPages}
									page={currentPage}
									onChange={handlePageChange}
									size="small"
									siblingCount={0}
									boundaryCount={1}
									sx={{ '& .MuiPaginationItem-root': { fontSize: '0.72rem' } }}
								/>
							)}
						</Box>
					</Box>
				</Box>

				{/* Right panel */}
				<Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
					<AppMatchingReportDetails reportData={selectedReport} />
				</Box>
			</Box>

			{/* Context menu */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				slotProps={{
					paper: {
						elevation: 0,
						sx: { mt: 0.5, minWidth: 160, borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' },
					},
				}}
			>
				<MenuItem
					onClick={handleDeleteClick}
					sx={{ fontSize: '0.82rem', color: '#ef4444', gap: 1, '&:hover': { backgroundColor: '#fff5f5' } }}
				>
					<DeleteOutlineOutlinedIcon sx={{ fontSize: 16, color: '#ef4444' }} />
					{t('appReportContent.deleteReport')}
				</MenuItem>
			</Menu>

			{/* Delete confirmation dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={handleDeleteCancel}
				slotProps={{
					paper: {
						elevation: 0,
						sx: { borderRadius: 3, border: '1px solid #e2e8f0', minWidth: 340 },
					},
				}}
			>
				<DialogTitle sx={{ pb: 1 }}>
					<Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
						{t('appReportContent.deleteConfirm')}
					</Typography>
				</DialogTitle>
				<DialogContent>
					<Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
						{menuReport?.candidateInfo?.candidateName && (
							<><strong style={{ color: '#0f172a' }}>{menuReport.candidateInfo.candidateName}</strong> — </>
						)}
						{t('appReportContent.deleteReport')}?
					</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
					<Button
						onClick={handleDeleteCancel}
						disabled={deletingReport}
						sx={{ borderRadius: 2, fontSize: '0.82rem', textTransform: 'none', color: '#64748b' }}
					>
						{t('appReportContent.cancel')}
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						disabled={deletingReport}
						variant="contained"
						sx={{
							borderRadius: 2, fontSize: '0.82rem', textTransform: 'none', fontWeight: 600,
							backgroundColor: '#ef4444', boxShadow: 'none',
							'&:hover': { backgroundColor: '#dc2626', boxShadow: 'none' },
						}}
					>
						{deletingReport ? t('appReportContent.delete') + '…' : t('appReportContent.delete')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default AppMatchingReports;
