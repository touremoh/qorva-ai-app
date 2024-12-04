// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { Box, Typography, Divider, List, ListItem, ListItemText, IconButton, TextField, Chip, Pagination } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppScreeningCVMatching from '../screening/AppScreeningCVMatching';
import { SCREENING_REPORTS } from "../../../mocks.js";

const AppScreeningReports = () => {
	const { t } = useTranslation();
	const [selectedReport, setSelectedReport] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortOrder, setSortOrder] = useState('desc');
	const [currentPage, setCurrentPage] = useState(1);

	const reportsPerPage = 50;

	// Sorting the reports by creation date based on sortOrder state
	const sortedReports = [...SCREENING_REPORTS].sort((a, b) => {
		if (sortOrder === 'asc') {
			return new Date(a.createdAt) - new Date(b.createdAt);
		} else {
			return new Date(b.createdAt) - new Date(a.createdAt);
		}
	});

	// Filtering the reports based on search term
	const filteredReports = sortedReports.filter((report) =>
		report.reportName.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Calculating pagination data
	const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
	const paginatedReports = filteredReports.slice(
		(currentPage - 1) * reportsPerPage,
		currentPage * reportsPerPage
	);

	const handleSearchChange = (event) => {
		setSearchTerm(event.target.value);
		setCurrentPage(1);
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

	return (
		<Box sx={{ display: 'flex', width: '70vw' }}>
			{/* Section 1: List of Reports */}
			<Box sx={{ width: '24%', height: '75vh', backgroundColor: 'white', padding: 2, boxShadow: 1, position: 'relative' }}>
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
							button
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
								secondary={`${t('appReportContent.generatedOn')}: ${new Date(report.createdAt).toLocaleDateString()}`}
							/>
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
			<AppScreeningCVMatching analysisResults={selectedReport?.reportDetails} />
		</Box>
	);
};

AppScreeningReports.propTypes = {
	analysisResults: PropTypes.arrayOf(
		PropTypes.shape({
			job_title: PropTypes.string.isRequired,
			candidate_name: PropTypes.string.isRequired,
			skills_match: PropTypes.shape({
				summary: PropTypes.string.isRequired,
				degree_of_match: PropTypes.string.isRequired,
			}).isRequired,
			exceeds_requirements: PropTypes.shape({
				summary: PropTypes.string.isRequired,
			}).isRequired,
			lacking_skills: PropTypes.shape({
				summary: PropTypes.string.isRequired,
			}).isRequired,
			experience_alignment: PropTypes.shape({
				summary: PropTypes.string.isRequired,
			}).isRequired,
			overall_summary: PropTypes.shape({
				summary: PropTypes.string.isRequired,
				score: PropTypes.string.isRequired,
				points_for_improvement: PropTypes.arrayOf(PropTypes.string).isRequired,
			}).isRequired,
			interview_questions: PropTypes.shape({
				skills_based_questions: PropTypes.arrayOf(PropTypes.string).isRequired,
				strength_based_questions: PropTypes.arrayOf(PropTypes.string).isRequired,
				gap_exploration_questions: PropTypes.arrayOf(PropTypes.string).isRequired,
			}).isRequired,
		})
	),
};

export default AppScreeningReports;
