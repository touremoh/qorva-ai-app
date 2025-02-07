// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import {
	Box, Typography, Divider, List, ListItem, ListItemText, IconButton, TextField, Chip, Pagination, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppScreeningReportDetails from '../screening/AppScreeningReportDetails.jsx';
import apiClient from '../../../../axiosConfig.js';
import {AUTH_TOKEN} from "../../../constants.js";

const AppScreeningReports = () => {
	const { t } = useTranslation();
	const [reports, setReports] = useState([]);
	const [selectedReport, setSelectedReport] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortOrder, setSortOrder] = useState('desc');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [anchorEl, setAnchorEl] = useState(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [newReportName, setNewReportName] = useState('');

	const reportsPerPage = 50;

	// Fetch reports from backend
	useEffect(() => {
		const fetchReports = async () => {
			try {
				const response = await apiClient.get(import.meta.env.VITE_APP_API_REPORT_URL);
				const reportData = response.data.data.content;
				setReports(reportData);
			} catch (error) {
				console.error('Error fetching reports:', error);
			}
		};
		fetchReports().then(response => console.log(response));
	}, []);

	// Sorting the reports by lastUpdatedAt based on sortOrder state
	const sortedReports = [...reports].sort((a, b) => {
		if (sortOrder === 'asc') {
			return new Date(a.lastUpdatedAt) - new Date(b.lastUpdatedAt);
		} else {
			return new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt);
		}
	});

	// Calculating pagination data
	const paginatedReports = sortedReports.slice(
		(currentPage - 1) * reportsPerPage,
		currentPage * reportsPerPage
	);

	const handleSearchChange = async (event) => {
		const searchValue = event.target.value;
		setSearchTerm(searchValue);
		setCurrentPage(1); // Reset to the first page after a search
		try {
			const response = await apiClient.get(`${import.meta.env.VITE_APP_API_REPORT_URL}/search`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN)}`,
				},
				params: {
					pageNumber: 0,
					pageSize: reportsPerPage,
					searchTerms: searchValue.trim(),
				}
			});
			setReports(response.data.data.content); // Update the entries in the parent component
			setTotalPages(response.data.data.totalPages);
		} catch (error) {
			console.error('Error during search:', error);
		}
	};

	const handleSortToggle = () => {
		setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
	};

	const handlePageChange = (event, value) => {
		setCurrentPage(value);
	};

	const handleReportSelection = (report) => {
		setSelectedReport(report);
	};


	// Handle opening the menu for a report item
	const handleMenuOpen = (event, report) => {
		setAnchorEl(event.currentTarget);
		setSelectedReport(report);
	};

	// Handle closing the menu
	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedReport(null);
	};

	// Handle updating the report name
	const handleUpdateReport = async () => {
		try {
			await apiClient.patch(`${import.meta.env.VITE_APP_API_REPORT_URL}/${selectedReport.id}`, {
				reportName: newReportName,
			});
			setReports((prevReports) =>
				prevReports.map((report) =>
					report.id === selectedReport.id ? { ...report, reportName: newReportName } : report
				)
			);
			setEditDialogOpen(false);
		} catch (error) {
			console.error('Error updating report name:', error);
		}
		handleMenuClose();
	};

	// Handle deleting a report
	const handleDeleteReport = async () => {
		try {
			await apiClient.delete(`${import.meta.env.VITE_APP_API_REPORT_URL}/${selectedReport.id}`);
			setReports((prevReports) => prevReports.filter((report) => report.id !== selectedReport.id));
			setDeleteDialogOpen(false);
			if (selectedReport?.id === selectedReport.id) {
				setSelectedReport(null);
			}
		} catch (error) {
			console.error('Error deleting report:', error);
		}
		handleMenuClose();
	};


	return (
		<Box sx={{ display: 'flex', width: '70vw' }}>
			{/* Section 1: List of Reports */}
			<Box sx={{ width: '24%', height: '75vh', backgroundColor: 'white', padding: 2, boxShadow: 1, position: 'relative', color: '#232F3E' }}>
				<Typography variant="h5" gutterBottom>
					{t('appReportContent.reportListTitle')}
				</Typography>
				<Divider sx={{ marginBottom: 2 }} />

				{/* Search Box and Sort Icon */}
				<Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
					<TextField
						label={t('appReportContent.search')}
						variant="outlined"
						sx={{ width: '100%' }}
						value={searchTerm}
						onChange={handleSearchChange}
					/>
					<IconButton onClick={handleSortToggle} sx={{ marginLeft: 1 }}>
						{sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
					</IconButton>
				</Box>

				{/* Reports List */}
				<List sx={{ overflowY: 'auto', height: 'calc(80vh - 200px)' }}>
					{paginatedReports.map((report) => (
						<ListItem
							key={report.id}
							button="true"
							divider
							onClick={() => handleReportSelection(report)}
							sx={{
								cursor: 'pointer',
								position: 'relative',
							}}
						>
							{/* Green Badge */}
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
								primary={report.reportName}
								secondary={`${t('appReportContent.updatedOn')}: ${new Date(report.lastUpdatedAt).toLocaleDateString()}`}
							/>
							<IconButton onClick={(event) => handleMenuOpen(event, report)}>
								<MoreVertIcon />
							</IconButton>
						</ListItem>
					))}
				</List>

				{/* Pagination */}
				{totalPages > 1 && (
					<Box sx={{ position: 'absolute', bottom: 16, left: 0, right: 0 }}>
						<Pagination
							count={totalPages}
							page={currentPage}
							onChange={handlePageChange}
							sx={{ display: 'flex', justifyContent: 'center' }}
						/>
					</Box>
				)}
			</Box>

			{/* Section 2: Report Details */}
			<AppScreeningReportDetails reportData={selectedReport} />

			{/* Menu for More Options */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				transformOrigin={{ vertical: 'top', horizontal: 'left' }}
			>
				<MenuItem onClick={() => setEditDialogOpen(true)}>{t('appReportContent.editReportTitle')}</MenuItem>
				<MenuItem onClick={() => setDeleteDialogOpen(true)}>{t('appReportContent.deleteReport')}</MenuItem>
			</Menu>

			{/* Edit Report Dialog */}
			<Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth={true}>
				<DialogTitle>{t('appReportContent.editReportTitle')}</DialogTitle>
				<DialogContent>
					<TextField fullWidth value={newReportName} onChange={(e) => setNewReportName(e.target.value)} />
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setEditDialogOpen(false)}>{t('appReportContent.cancel')}</Button>
					<Button onClick={handleUpdateReport} color="primary">{t('appReportContent.save')}</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} fullWidth={true}>
				<DialogTitle>{t('appReportContent.deleteConfirm')}</DialogTitle>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>{t('appReportContent.cancel')}</Button>
					<Button onClick={handleDeleteReport} color="error">{t('appReportContent.delete')}</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

AppScreeningReports.propTypes = {
	analysisResults: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			reportName: PropTypes.string.isRequired,
			companyId: PropTypes.string.isRequired,
			reportDetails: PropTypes.arrayOf(
				PropTypes.shape({
					jobTitle: PropTypes.string.isRequired,
					candidateName: PropTypes.string.isRequired,
					skillsMatch: PropTypes.shape({
						summary: PropTypes.string.isRequired,
						degreeOfMatch: PropTypes.number.isRequired,
					}).isRequired,
					exceedsRequirements: PropTypes.shape({
						summary: PropTypes.string.isRequired,
					}).isRequired,
					lackingSkills: PropTypes.shape({
						summary: PropTypes.string.isRequired,
					}).isRequired,
					experienceAlignment: PropTypes.shape({
						summary: PropTypes.string.isRequired,
					}).isRequired,
					overallSummary: PropTypes.shape({
						summary: PropTypes.string.isRequired,
						score: PropTypes.number.isRequired,
						pointsForImprovement: PropTypes.arrayOf(PropTypes.string).isRequired,
					}).isRequired,
					interviewQuestions: PropTypes.shape({
						skillsBasedQuestions: PropTypes.arrayOf(PropTypes.string).isRequired,
						strengthBasedQuestions: PropTypes.arrayOf(PropTypes.string).isRequired,
						gapExplorationQuestions: PropTypes.arrayOf(PropTypes.string).isRequired,
					}),
				})
			),
		}).isRequired
	),
};


export default AppScreeningReports;
