// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useMemo } from 'react';
import {
	Box, Typography, Divider, List, ListItem, ListItemText, IconButton,
	TextField, Chip, Pagination, Menu, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useTranslation } from 'react-i18next';
import AppScreeningReportDetails from '../screening/AppScreeningReportDetails.jsx';
import apiClient from '../../../../axiosConfig.js';
import { AUTH_TOKEN } from "../../../constants.js";

const AppScreeningReports = () => {
	const { t } = useTranslation();

	// Data
	const [reports, setReports] = useState([]);
	const [jobs, setJobs] = useState([]);

	// UI state
	const [selectedReport, setSelectedReport] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortOrder, setSortOrder] = useState('desc');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [anchorEl, setAnchorEl] = useState(null);

	// Filters
	const [selectedJobId, setSelectedJobId] = useState('');

	const reportsPerPage = 25;

	const getColor = (value) => {
		if (value >= 70) return 'green';
		if (value >= 40) return 'orange';
		return 'red';
	};

	const fetchReports = async (pageNumber, jobId) => {
		const params = {
			pageNumber: pageNumber,
			pageSize: reportsPerPage,
			...(jobId ? { jobPostId: jobId } : {})
		};
		try {
			const response = await apiClient.get(import.meta.env.VITE_APP_API_REPORT_URL, {
				params: params,
			});
			const reportData = response?.data?.data?.content ?? [];
			console.log('Fetched reports: ', reportData);
			setReports(reportData);
			setTotalPages(response?.data?.data?.totalPages ?? 1);
			console.log('Reports for page pane number: ', reports, pageNumber)
		} catch (error) {
			console.error('Error fetching reports:', error);
		}
	};

	const fetchJobs = async () => {
		try {
			const response = await apiClient.get(import.meta.env.VITE_APP_API_JOB_POSTS_URL, {
				params: { pageSize: 25, pageNumber: 0 },
			});
			const jobsData = response?.data?.data?.content ?? [];
			setJobs(jobsData);
		} catch (error) {
			console.error('Error fetching jobs:', error);
		}
	};

	// Initial fetch: reports + jobs
	useEffect(() => {
		fetchReports(0).then(() => console.log('Initial reports fetched'));
		fetchJobs().then(() => console.log('Initial jobs fetched'));
	}, []);

	// Backend search (kept)
	const handleSearchChange = async (event) => {
		const searchValue = event.target.value;
		setSearchTerm(searchValue);
		setCurrentPage(1);
		try {
			const response = await apiClient.get(`${import.meta.env.VITE_APP_API_REPORT_URL}/search`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN)}`,
				},
				params: {
					pageNumber: 0,
					pageSize: reportsPerPage,
					searchTerms: searchValue.trim(),
					...(selectedJobId ? { jobPostId: selectedJobId } : {}), // preserve job filter during search
				}
			});
			setReports(response?.data?.data?.content ?? []);
			setTotalPages(response?.data?.data?.totalPages ?? 1);
		} catch (error) {
			console.error('Error during search:', error);
		}
	};

	const handleSortToggle = () => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
	const handlePageChange = (event, value) => {
		setCurrentPage(value);
		fetchReports(value - 1, selectedJobId).then(() => console.log('Page switched to ', value));
	};
	const handleReportSelection = (report) => setSelectedReport(report);

	// SERVER-SIDE report filter by jobPostId via REPORT_URL
	const handleJobChange = async (event) => {
		const jobId = event.target.value || '';
		setSelectedJobId(jobId);
		setCurrentPage(1);

		try {
			const resp = await apiClient.get(import.meta.env.VITE_APP_API_REPORT_URL, {
				params: {
					pageSize: reportsPerPage,
					pageNumber: 0,
					...(jobId ? { jobPostId: jobId } : {}),
				},
			});
			setReports(resp?.data?.data?.content ?? []);
			setTotalPages(resp?.data?.data?.totalPages ?? 1);
		} catch (error) {
			console.error('Error filtering reports by jobPostId:', error);
		}
	};

	// Sort + paginate (client-side)
	const sortedReports = useMemo(() => {
		const arr = [...reports];
		arr.sort((a, b) => {
			if (sortOrder === 'asc') {
				return a.aiAnalysisReportDetails.overallSummary.score - b.aiAnalysisReportDetails.overallSummary.score;
			}
			return b.aiAnalysisReportDetails.overallSummary.score - a.aiAnalysisReportDetails.overallSummary.score;
		});
		return arr;
	}, [reports, sortOrder]);

	// Menu
	const handleMenuOpen = (event, report) => {
		setAnchorEl(event.currentTarget);
		setSelectedReport(report);
	};
	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedReport(null);
	};

	return (
		<Box
			sx={{
				width: '100%',
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'flex-start',
				backgroundColor: 'transparent',
				color: '#232F3E',
				padding: 2,
				overflowX: 'hidden'
			}}
		>
			{/* Top Bar: Job filter + Search */}
			<Box sx={{ width: '90%', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
				<FormControl size="small">
					<InputLabel id="job-filter-label">{t('appReportContent.filterByJob') || 'Filter by Job'}</InputLabel>
					<Select
						labelId="job-filter-label"
						value={selectedJobId}
						label={t('appReportContent.filterByJob') || 'Filter by Job'}
						onChange={handleJobChange}
						displayEmpty
					>
						<MenuItem value="">{t('appReportContent.allJobs') || 'All jobs'}</MenuItem>
						{jobs.map((job) => (
							<MenuItem key={job.id} value={job.id}>
								{job.title || job.jobTitle || job.name || job.id}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<TextField
					size="small"
					label={t('appReportContent.search')}
					variant="outlined"
					value={searchTerm}
					onChange={handleSearchChange}
				/>
			</Box>

			{/* Main area */}
			<Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '90%', mt: 3, height: '85vh' }}>
				{/* Left panel: make it a flex column and control scroll + footer */}
				<Box
					sx={{
						width: '30.5%',
						height: '100%',
						backgroundColor: 'white',
						padding: 2,
						boxShadow: 1,
						display: 'flex',
						flexDirection: 'column',
						overflow: 'hidden' // contain inner scrolling
					}}
				>
					{/* Header */}
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<Typography variant="h5" gutterBottom>
							{t('appReportContent.reportListTitle')}
						</Typography>
						<IconButton onClick={handleSortToggle} aria-label="sort">
							{sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
						</IconButton>
					</Box>
					<Divider sx={{ mb: 2 }} />

					{/* Scrollable list area */}
					<Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
						{sortedReports.length === 0 ? (
							<Typography variant="body">{t('appCVScreening.noAnalysisResult')}</Typography>
						) : (
							<List disablePadding>
								{sortedReports.map((report) => {
									const score = report.aiAnalysisReportDetails?.overallSummary?.score ?? 0;
									return (
										<ListItem
											key={report.id}
											button
											divider
											onClick={() => handleReportSelection(report)}
											sx={{ cursor: 'pointer', position: 'relative' }}
										>
											{selectedReport?.id === report.id && (
												<Chip
													sx={{
														position: 'absolute',
														left: 0,
														top: '50%',
														transform: 'translateY(-50%)',
														backgroundColor: 'green',
														width: '5px',
														height: '100%',
													}}
												/>
											)}
											<ListItemText
												primary={
													<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
														<span>{`${report.candidateInfo.candidateName} (${report.candidateInfo.nbYearsExperience} yrs exp)`}</span>
														<span style={{ fontWeight: 'bold', color: getColor(score) }}>{score}%</span>
													</Box>
												}
												secondary={`${t('appReportContent.updatedOn')}: ${new Date(report.lastUpdatedAt).toLocaleDateString()}`}
											/>
											<IconButton onClick={(event) => handleMenuOpen(event, report)}>
												<MoreVertIcon />
											</IconButton>
										</ListItem>
									);
								})}
							</List>
						)}
					</Box>

					{/* Footer: pagination centered at bottom of the panel */}
					{totalPages > 1 && (
						<Box sx={{ pt: 1, display: 'flex', justifyContent: 'center' }}>
							<Pagination
								count={totalPages}
								page={currentPage}
								onChange={handlePageChange}
								siblingCount={1}
								boundaryCount={1}
							/>
						</Box>
					)}
				</Box>

				{/* Right: details */}
				<AppScreeningReportDetails reportData={selectedReport} />
			</Box>

			{/* Menu */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				transformOrigin={{ vertical: 'top', horizontal: 'left' }}
			>
				<MenuItem>{t('appReportContent.editReportTitle')}</MenuItem>
				<MenuItem>{t('appReportContent.deleteReport')}</MenuItem>
			</Menu>
		</Box>
	);
};

export default AppScreeningReports;
