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
	TextField
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const AppScreeningCommands = ({ jobPosts, cvEntries, selectedJobPost, handleJobPostChange, selectedCVs, handleCVSelectChange, handleAnalyzeCVs }) => {
	const { t } = useTranslation();
	const [searchTerm, setSearchTerm] = useState('');
	const [selectAll, setSelectAll] = useState(false);

	// Filter CV entries based on the search term or key skills
	const filteredCVEntries = cvEntries.filter(cv =>
		cv.personalInformation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		cv.personalInformation.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
		cv.keySkills.some(skill =>
			skill.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
		)
	);

	const handleSearchChange = (event) => {
		console.log('Key pressed:', event.key);
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
			<FormControl sx={{ width: '55%', marginRight: 2 }}>
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
				sx={{ width: '20%' }}
				variant="contained"
				color="warning"
				onClick={handleAnalyzeCVs}
				disabled={!selectedJobPost || selectedCVs.length === 0}
			>
				{t('appCVScreening.analyzeCVs')}
			</Button>
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
	handleAnalyzeCVs: PropTypes.func.isRequired
};

export default AppScreeningCommands;
