// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useMemo } from 'react';
import {
	Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent,
	DialogTitle, FormControl, IconButton, InputAdornment,
	InputLabel, ListItemButton, Menu, MenuItem, Pagination,
	Select, TextField, Tooltip, Typography,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';
import AppScreeningReportDetails from '../screening/AppScreeningReportDetails.jsx';
import apiClient from '../../../../axiosConfig.js';

const reportsPerPage = 25;

const scoreChipSx = (score) => {
	if (score >= 70) return { backgroundColor: '#dcfce7', color: '#166534' };
	if (score >= 40) return { backgroundColor: '#fef9c3', color: '#854d0e' };
	return { backgroundColor: '#fee2e2', color: '#991b1b' };
};

const getInitials = (name = '') =>
	name.split(' ').slice(0, 2).map((p) => p[0] ?? '').join('').toUpperCase();

const AppScreeningReports = () => {
	const { t } = useTranslation();

	const [reports, setReports] = useState([]);
	const [jobs, setJobs] = useState([]);
	const [selectedReport, setSelectedReport] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortOrder, setSortOrder] = useState('desc');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [selectedJobId, setSelectedJobId] = useState('');
	const [anchorEl, setAnchorEl] = useState(null);
	const [menuReport, setMenuReport] = useState(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingReport, setDeletingReport] = useState(false);

	const fetchData = async (pageNumber, jobId, term) => {
		try {
			const hasSearch = term && term.trim();
			const url = hasSearch
				? `${import.meta.env.VITE_APP_API_REPORT_URL}/search`
				: import.meta.env.VITE_APP_API_REPORT_URL;
			const params = {
				pageNumber,
				pageSize: reportsPerPage,
				...(jobId ? { jobPostId: jobId } : {}),
				...(hasSearch ? { searchTerms: term.trim() } : {}),
			};
			const response = await apiClient.get(url, { params });
			setReports(response?.data?.data?.content ?? []);
			setTotalPages(response?.data?.data?.totalPages ?? 1);
		} catch (error) {
			console.error('Error fetching reports:', error);
		}
	};

	const fetchJobs = async () => {
		try {
			const response = await apiClient.get(import.meta.env.VITE_APP_API_JOB_POSTS_URL, {
				params: { pageSize: 25, pageNumber: 0 },
			});
			setJobs(response?.data?.data?.content ?? []);
		} catch (error) {
			console.error('Error fetching jobs:', error);
		}
	};

	useEffect(() => {
		fetchData(0, '', '');
		fetchJobs();
	}, []);

	const handleSearchChange = (event) => {
		const value = event.target.value;
		setSearchTerm(value);
		setCurrentPage(1);
		fetchData(0, selectedJobId, value);
	};

	const handleJobChange = (event) => {
		const jobId = event.target.value || '';
		setSelectedJobId(jobId);
		setCurrentPage(1);
		fetchData(0, jobId, searchTerm);
	};

	const handlePageChange = (_, value) => {
		setCurrentPage(value);
		fetchData(value - 1, selectedJobId, searchTerm);
	};

	const sortedReports = useMemo(() => {
		return [...reports].sort((a, b) => {
			const sa = a.aiAnalysisReportDetails?.overallSummary?.score ?? 0;
			const sb = b.aiAnalysisReportDetails?.overallSummary?.score ?? 0;
			return sortOrder === 'asc' ? sa - sb : sb - sa;
		});
	}, [reports, sortOrder]);

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
			await apiClient.delete(`${import.meta.env.VITE_APP_API_REPORT_URL}/${menuReport.id}`);
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

				<FormControl size="small" sx={{ minWidth: 160 }}>
					<InputLabel sx={{ fontSize: '0.82rem' }}>{t('appReportContent.filterByJob')}</InputLabel>
					<Select
						value={selectedJobId}
						label={t('appReportContent.filterByJob')}
						onChange={handleJobChange}
						sx={{ borderRadius: 2, fontSize: '0.82rem' }}
					>
						<MenuItem value="">{t('appReportContent.allJobs')}</MenuItem>
						{jobs.map((job) => (
							<MenuItem key={job.id} value={job.id} sx={{ fontSize: '0.82rem' }}>
								{job.title || job.jobTitle || job.name || job.id}
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
			</Box>

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
									{t('appCVScreening.noAnalysisResult')}
								</Typography>
							</Box>
						) : (
							sortedReports.map((report) => {
								const score = report.aiAnalysisReportDetails?.overallSummary?.score ?? 0;
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

					{/* Pagination */}
					{totalPages > 1 && (
						<Box sx={{ py: 1, display: 'flex', justifyContent: 'center', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
							<Pagination
								count={totalPages}
								page={currentPage}
								onChange={handlePageChange}
								size="small"
								siblingCount={0}
								boundaryCount={1}
								sx={{ '& .MuiPaginationItem-root': { fontSize: '0.72rem' } }}
							/>
						</Box>
					)}
				</Box>

				{/* Right panel */}
				<Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
					<AppScreeningReportDetails reportData={selectedReport} />
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
					onClick={handleMenuClose}
					sx={{ fontSize: '0.82rem', color: '#334155', gap: 1, '&:hover': { backgroundColor: '#f8fafc' } }}
				>
					<AssessmentOutlinedIcon sx={{ fontSize: 16, color: '#64748b' }} />
					{t('appReportContent.editReportTitle')}
				</MenuItem>
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

export default AppScreeningReports;
