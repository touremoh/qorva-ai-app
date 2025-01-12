import React, { useState } from 'react';
import {
	Box,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	OutlinedInput,
	Checkbox,
	ListItemText,
	Button,
	TextField,
	Modal,
	Typography, CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import target from "quill/blots/break.js";
import apiClient from "../../../../axiosConfig.js";

const AppScreeningCommands = ({ jobPosts, cvEntries, selectedJobPost, handleJobPostChange, selectedCVs, handleCVSelectChange, handleAnalyzeCVs, analyzedResults, analyzeButtonDisabled, saveReportButtonDisabled, setCVEntries }) => {
	const { t } = useTranslation();
	const [searchTerm, setSearchTerm] = useState('');
	const [selectAll, setSelectAll] = useState(false);
	const [saveReportModalOpen, setSaveReportModalOpen] = useState(false);
	const [reportName, setReportName] = useState('');
	const [successModalOpen, setSuccessModalOpen] = useState(false);

	const entriesPerPage = 50;



	// Filter CV entries based on the search term or key skills
	const handleSearchChange = async (event) => {
		const searchValue = event.target.value;
		setSearchTerm(searchValue);
		try {
			const response = await apiClient.get(`${import.meta.env.VITE_APP_API_CV_URL}/search`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('authToken')}`,
				},
				params: {
					pageNumber: 0,
					pageSize: entriesPerPage,
					searchTerms: searchValue.trim(),
				},
			});
			setCVEntries(response.data.data.content); // Update the entries in the parent component
		} catch (error) {
			console.error('Error during search:', error);
		}
	};

	const handleSelectAllChange = (event) => {
		setSelectAll(event.target.checked);
		if (event.target.checked) {
			handleCVSelectChange({ target: { value: cvEntries.map(cv => cv.id) } });
		} else {
			handleCVSelectChange({ target: { value: [] } });
		}
	};

	const handleKeyDown = (event) => {
		event.stopPropagation(); // Prevent the event from bubbling up and triggering other handlers.
	};

	const handleSaveReportClick = () => {
		setSaveReportModalOpen(true);
		//handleSaveReportSubmit().then(r => console.log(r));
	};

	const handleSaveReportSubmit = async () => {
		if (reportName.trim()) {
			try {
				// Construct the report data payload
				const reportData = {
					reportName: reportName.trim(),
					status: 'PERMANENT',
				};

				// Send PATCH request to the backend
				const response = await apiClient.patch(
					`${import.meta.env.VITE_APP_API_REPORT_URL}/${analyzedResults.id}`, // Include ID in the endpoint path
					reportData, // Send the report data payload
					{
						headers: {
							'Content-Type': 'application/json',
						},
					}
				);

				if (response.status === 200) {
					console.log('Report saved successfully!')
					// Show a success popup
					setSuccessModalOpen(true);
					setSaveReportModalOpen(false);
					setReportName('');
				} else {
					console.error('Failed to update report:', response);
				}
			} catch (error) {
				console.error('Error updating the report:', error);
			}
		}
	};


	return (
		<Box sx={{ display: 'flex', width: '100%', marginBottom: 3 }}>
			{/* Dropdown for Job Posts */}
			<FormControl sx={{ width: '25%', marginRight: 2 }}>
				<InputLabel>{t('appCVScreening.selectJobPost')}</InputLabel>
				<Select
					value={selectedJobPost}
					onChange={handleJobPostChange}
					input={<OutlinedInput label={t('appCVScreening.selectJobPost')} />}
				>
					{jobPosts.map((job) => (
						<MenuItem key={job.id} value={job.id}>
							{job.title}
						</MenuItem>
					))}
				</Select>
			</FormControl>

			{/* Multi-Select Dropdown for CVs */}
			<FormControl sx={{ width: '50%', marginRight: 2}}>
				<InputLabel>{t('appCVScreening.selectCVs')}</InputLabel>
				<Select
					multiple={true}
					value={selectedCVs}
					onChange={handleCVSelectChange}
					input={<OutlinedInput label={t('appCVScreening.selectCVs')} />}
					renderValue={(selected) =>
						selected.map((id) => {
							const selectedCv = cvEntries.find(cv => cv.id === id);
							return selectedCv ? selectedCv.personalInformation.name : id;
						}).join(', ')
					}
					MenuProps={{
						PaperProps: {
							style: {
								maxHeight: 600, // Adjust the max height as needed
								overflow: 'auto',
							},
						},
					}}
				>
					{/* Search Box */}
					<Box sx={{ padding: 1 }}>
						<TextField
							variant="outlined"
							placeholder={t('appCVScreening.searchCVs')}
							value={searchTerm}
							onChange={handleSearchChange}
							onKeyDown={handleKeyDown}
							fullWidth
						/>
					</Box>

					{/* Select All Checkbox */}
					<MenuItem>
						<Checkbox
							checked={selectAll}
							onChange={handleSelectAllChange}
						/>
						<ListItemText primary={t('appCVScreening.selectAll')} />
					</MenuItem>

					{/* CV List Items */}
					{cvEntries.map((cv) => (
						<MenuItem key={cv.id} value={cv.id}>
							<Checkbox checked={selectedCVs.indexOf(cv.id) > -1} />
							<ListItemText
								primary={cv.personalInformation.name}
								secondary={`${cv.personalInformation.role} - ${
									cv.keySkills
										.flatMap(skill => skill.skills)
										.slice(0, 3)
										.join(', ')
								}`}
							/>
						</MenuItem>
					))}
				</Select>
			</FormControl>

			{/* Analyze Button */}
			<Button
				sx={{ width: '12%', marginRight: 1 }}
				variant="contained"
				color="warning"
				onClick={handleAnalyzeCVs}
				disabled={!selectedJobPost || analyzeButtonDisabled}
			>
				{analyzeButtonDisabled ? <CircularProgress size={30} />: t('appCVScreening.analyzeCVs')}
			</Button>

			{/* Save Report Button */}
			<Button
				sx={{ width: '12%' }}
				variant="contained"
				color="success"
				onClick={handleSaveReportClick}
				disabled={!analyzedResults || analyzedResults.length === 0 || saveReportButtonDisabled}
			>
				{t('appCVScreening.saveReport')}
			</Button>

			{/* Save Report Modal */}
			<Modal
				open={saveReportModalOpen}
				onClose={() => setSaveReportModalOpen(false)}
				aria-labelledby="save-report-modal"
			>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: 400,
						backgroundColor: 'background.paper',
						boxShadow: 24,
						p: 4,
						borderRadius: 1,
					}}
				>
					<Typography variant="h6" component="h2" sx={{ mb: 2 }}>
						{t('appCVScreening.saveReport')}
					</Typography>
					<TextField
						fullWidth
						variant="outlined"
						label={t('appCVScreening.reportName')}
						value={reportName}
						onChange={(e) => setReportName(e.target.value)}
						sx={{ mb: 2 }}
					/>
					<Button
						variant="contained"
						color="success"
						fullWidth
						onClick={handleSaveReportSubmit}
					>
						{t('appCVScreening.submit')}
					</Button>
				</Box>
			</Modal>
			<Modal
				open={successModalOpen}
				onClose={() => setSuccessModalOpen(false)}
				aria-labelledby="success-modal-title"
				aria-describedby="success-modal-description"
			>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: 400,
						backgroundColor: 'background.paper',
						boxShadow: 24,
						p: 4,
						borderRadius: 1,
						textAlign: 'center',
						color: 'black',
					}}
				>
					<Typography id="success-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
						{t('appCVScreening.reportSaveSuccessTitle')}
					</Typography>
					<Typography id="success-modal-description" sx={{ mb: 3 }}>
						{t('appCVScreening.reportSaveSuccessMessage')}
					</Typography>
					<Button
						variant="contained"
						color="primary"
						onClick={() => setSuccessModalOpen(false)}
					>
						{t('appCVScreening.close')}
					</Button>
				</Box>
			</Modal>
		</Box>
	);
};

AppScreeningCommands.propTypes = {
	jobPosts: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			title: PropTypes.string.isRequired
		})
	).isRequired,
	cvEntries: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			personalInformation: PropTypes.shape({
				name: PropTypes.string.isRequired,
				role: PropTypes.string.isRequired
			}).isRequired,
			keySkills: PropTypes.arrayOf(
				PropTypes.shape({
					skills: PropTypes.arrayOf(PropTypes.string).isRequired
				})
			).isRequired
		})
	).isRequired,
	selectedJobPost: PropTypes.string.isRequired,
	handleJobPostChange: PropTypes.func.isRequired,
	selectedCVs: PropTypes.arrayOf(PropTypes.string).isRequired,
	handleCVSelectChange: PropTypes.func.isRequired,
	handleAnalyzeCVs: PropTypes.func.isRequired,
	analyzedResults: PropTypes.object, // Added for analyzed results
	analyzeButtonDisabled: PropTypes.bool, // Added for analyzed results
	saveReportButtonDisabled: PropTypes.bool
};

export default AppScreeningCommands;
