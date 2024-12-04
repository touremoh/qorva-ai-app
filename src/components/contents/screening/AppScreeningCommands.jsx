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
	Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const AppScreeningCommands = ({ jobPosts, cvEntries, selectedJobPost, handleJobPostChange, selectedCVs, handleCVSelectChange, handleAnalyzeCVs, analyzedResults }) => {
	const { t } = useTranslation();
	const [searchTerm, setSearchTerm] = useState('');
	const [selectAll, setSelectAll] = useState(false);
	const [saveReportModalOpen, setSaveReportModalOpen] = useState(false);
	const [reportName, setReportName] = useState('');

	// Filter CV entries based on the search term or key skills
	const filteredCVEntries = cvEntries.filter(cv =>
		cv.personalInformation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		cv.personalInformation.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
		cv.keySkills.some(skill =>
			skill.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
		)
	);

	const handleSearchChange = (event) => {
		setSearchTerm(event.target.value);
	};

	const handleSelectAllChange = (event) => {
		setSelectAll(event.target.checked);
		if (event.target.checked) {
			handleCVSelectChange({ target: { value: filteredCVEntries.map(cv => cv.id) } });
		} else {
			handleCVSelectChange({ target: { value: [] } });
		}
	};

	const handleKeyDown = (event) => {
		event.stopPropagation(); // Prevent the event from bubbling up and triggering other handlers.
	};

	const handleSaveReportClick = () => {
		setSaveReportModalOpen(true);
	};

	const handleSaveReportSubmit = () => {
		if (reportName.trim()) {
			const reportData = {
				id: new Date().getTime().toString(), // Example ID, could be a UUID
				reportName,
				reportDetails: analyzedResults,
				createdAt: new Date().toISOString(),
			};

			// Send the reportData to the backend (Example API call)
			console.log("Saving Report Data to Backend:", reportData);
			// You can replace the above console log with an API call to save the report

			setSaveReportModalOpen(false);
			setReportName('');
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
			<FormControl sx={{ width: '50%', marginRight: 2 }}>
				<InputLabel>{t('appCVScreening.selectCVs')}</InputLabel>
				<Select
					multiple
					value={selectedCVs}
					onChange={handleCVSelectChange}
					input={<OutlinedInput label={t('appCVScreening.selectCVs')} />}
					renderValue={(selected) =>
						selected.map((id) => {
							const selectedCv = cvEntries.find(cv => cv.id === id);
							return selectedCv ? selectedCv.personalInformation.name : id;
						}).join(', ')
					}
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
					{filteredCVEntries.map((cv) => (
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
				disabled={!selectedJobPost || selectedCVs.length === 0}
			>
				{t('appCVScreening.analyzeCVs')}
			</Button>

			{/* Save Report Button */}
			<Button
				sx={{ width: '12%' }}
				variant="contained"
				color="success"
				onClick={handleSaveReportClick}
				disabled={!analyzedResults || analyzedResults.length === 0}
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
};

export default AppScreeningCommands;
