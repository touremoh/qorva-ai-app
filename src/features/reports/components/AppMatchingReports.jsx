// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ConfirmDialog from '../../../shared/ui/ConfirmDialog.jsx';
import {
	Box,
	Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AppMatchingReportDetails from './AppMatchingReportDetails.jsx';
import { getReports, getReportsByFilter, deleteReport, exportCsv } from '../api/reportService.js';
import { getJobs } from '../../jobs/api/jobService.js';
import { QORVA_USER_LANGUAGE } from '../../../constants.js';
import { isDemoUser } from '../../../utils/demoMode.js';
import ReportRowMenu from './list/ReportRowMenu.jsx';
import ReportListPager from './list/ReportListPager.jsx';
import ReportList from './list/ReportList.jsx';
import MatchingCompletedBanner from './list/MatchingCompletedBanner.jsx';
import PendingMatchingBanner from './list/PendingMatchingBanner.jsx';
import MatchingProgressBanner from './list/MatchingProgressBanner.jsx';
import ReportsToolbar from './list/ReportsToolbar.jsx';
import useMatchingRun from '../hooks/useMatchingRun.js';
import { saveBlob } from '../../../shared/lib/download.js';
import * as tokens from '../../../theme/tokens.js';

const AppMatchingReports = () => {
	const { t } = useTranslation();
	const demo = isDemoUser();

	const [reports, setReports] = useState([]);
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

	const latestParamsRef = useRef({ selectedJobId: '', searchTerm: '', filterRecommendation: '', filterConfidence: '', pageSize: 25 });

	const [exportLoading, setExportLoading] = useState(false);
	const [selectedJobFilter, setSelectedJobFilter] = useState(null);
	const [jobOptions, setJobOptions] = useState([]);
	const [jobOptionsLoading, setJobOptionsLoading] = useState(false);
	const [jobInputValue, setJobInputValue] = useState('');
	const jobSearchRef = useRef(null);

	const {
		fetchJobs, pendingMatchingCount, handleStartMatching,
		matchingLoading, matchingSubmitted, matchingCompleted, bannerDismissed, setBannerDismissed,
		matchingProgress, matchingElapsed,
	} = useMatchingRun({
		refreshReports: () => {
			const { selectedJobId, searchTerm, filterRecommendation, filterConfidence, pageSize } = latestParamsRef.current;
			return fetchData(0, selectedJobId, searchTerm, filterRecommendation, filterConfidence, pageSize);
		},
		onJobsFetched: (content) => setJobOptions(prev => prev.length === 0 ? content : prev),
	});

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

	const fetchJobOptions = async (term = '') => {
		setJobOptionsLoading(true);
		try {
			const params = { pageSize: 25, pageNumber: 0 };
			if (term.trim()) { params.title = term.trim(); params.description = term.trim(); }
			const res = await getJobs(params);
			setJobOptions(res?.data?.data?.content ?? []);
		} catch { /* silent */ }
		finally { setJobOptionsLoading(false); }
	};

	useEffect(() => {
		fetchData(0, '', '', '', '');
		fetchJobs();
	// eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only; filters and polling drive later fetches
	}, []);

	// Keep latest filter params accessible inside the polling closure without recreating the interval
	useEffect(() => {
		latestParamsRef.current = { selectedJobId, searchTerm, filterRecommendation, filterConfidence, pageSize };
	}, [selectedJobId, searchTerm, filterRecommendation, filterConfidence, pageSize]);

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
			saveBlob(response.data, `matching-export-${selectedJobId}.csv`);
		} catch (error) {
			console.error('Error exporting CSV:', error);
		} finally {
			setExportLoading(false);
		}
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: tokens.surface.subtle }}>

			{/* Toolbar */}
			<ReportsToolbar
				demo={demo}
				exportLoading={exportLoading}
				fetchJobOptions={fetchJobOptions}
				filterConfidence={filterConfidence}
				filterRecommendation={filterRecommendation}
				handleConfidenceChange={handleConfidenceChange}
				handleExportCsv={handleExportCsv}
				handleJobAutocompleteChange={handleJobAutocompleteChange}
				handleRecommendationChange={handleRecommendationChange}
				handleSearchChange={handleSearchChange}
				jobInputValue={jobInputValue}
				jobOptions={jobOptions}
				jobOptionsLoading={jobOptionsLoading}
				jobSearchRef={jobSearchRef}
				searchTerm={searchTerm}
				selectedJobFilter={selectedJobFilter}
				selectedJobId={selectedJobId}
				setJobInputValue={setJobInputValue}
				setSortOrder={setSortOrder}
				sortOrder={sortOrder}
			/>

			{/* Matching in progress — progress bar */}
			<MatchingProgressBanner
				matchingElapsed={matchingElapsed}
				matchingLoading={matchingLoading}
				matchingProgress={matchingProgress}
				matchingSubmitted={matchingSubmitted}
			/>

			{/* Pending matching banner — start button */}
			<PendingMatchingBanner matchingSubmitted={matchingSubmitted} handleStartMatching={handleStartMatching} matchingLoading={matchingLoading} pendingMatchingCount={pendingMatchingCount} />
			<MatchingCompletedBanner bannerDismissed={bannerDismissed} matchingCompleted={matchingCompleted} setBannerDismissed={setBannerDismissed} />

			{/* Split pane */}
			<Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>

				{/* Left panel */}
				<Box sx={{
					width: { xs: 200, sm: 240, md: 300 },
					flexShrink: 0,
					display: 'flex',
					flexDirection: 'column',
					borderRight: `1px solid ${tokens.line.main}`,
					backgroundColor: tokens.surface.paper,
					overflow: 'hidden',
				}}>
					{/* List */}
					<ReportList
						handleMenuOpen={handleMenuOpen}
						selectedReport={selectedReport}
						setSelectedReport={setSelectedReport}
						sortedReports={sortedReports}
					/>

					{/* Pagination footer */}
					<ReportListPager
						currentPage={currentPage}
						handlePageChange={handlePageChange}
						handlePageSizeChange={handlePageSizeChange}
						pageSize={pageSize}
						totalElements={totalElements}
						totalPages={totalPages}
					/>
				</Box>

				{/* Right panel */}
				<Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
					<AppMatchingReportDetails reportData={selectedReport} />
				</Box>
			</Box>

			{/* Context menu */}
			<ReportRowMenu anchorEl={anchorEl} handleDeleteClick={handleDeleteClick} handleMenuClose={handleMenuClose} />

			{/* Delete confirmation dialog */}
			<ConfirmDialog
				open={deleteDialogOpen}
				title={t('appReportContent.deleteConfirm')}
				subject={menuReport?.candidateInfo?.candidateName && (
					<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: 600, color: 'ink.strong' }}>{menuReport.candidateInfo.candidateName}</Typography>
				)}
				cancelLabel={t('appReportContent.cancel')}
				confirmLabel={t('appReportContent.delete')}
				onCancel={handleDeleteCancel}
				onConfirm={handleDeleteConfirm}
				busy={deletingReport}
				tone="danger"
			>
				{`${t('appReportContent.deleteReport')}?`}
			</ConfirmDialog>
		</Box>
	);
};

export default AppMatchingReports;
