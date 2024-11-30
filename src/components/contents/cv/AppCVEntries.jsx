import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
	Box,
	Typography,
	Divider,
	List,
	ListItem,
	ListItemText,
	IconButton,
	Menu,
	MenuItem,
	TextField,
	Pagination
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useTranslation } from 'react-i18next';

const AppCVEntries = ({ cvEntries, setSelectedCV, setDeleteDialogOpen }) => {
	const { t } = useTranslation();
	const [anchorEl, setAnchorEl] = useState(null);
	const [selectedCVId, setSelectedCVId] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [sortOrder, setSortOrder] = useState('desc'); // Sorting order state

	const entriesPerPage = 100;

	// Sorting CV entries by last updated date based on sortOrder state
	const sortedCVEntries = [...cvEntries].sort((a, b) => {
		if (sortOrder === 'asc') {
			return new Date(a.lastUpdatedAt) - new Date(b.lastUpdatedAt);
		} else {
			return new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt);
		}
	});

	// Filtering CV entries based on search term
	const filteredCVEntries = sortedCVEntries.filter(
		(cv) =>
			cv.personalInformation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			cv.personalInformation.role.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Calculating pagination data
	const totalPages = Math.ceil(filteredCVEntries.length / entriesPerPage);
	const paginatedCVEntries = filteredCVEntries.slice(
		(currentPage - 1) * entriesPerPage,
		currentPage * entriesPerPage
	);

	const handleMenuOpen = (event, cvId) => {
		setAnchorEl(event.currentTarget);
		setSelectedCVId(cvId);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedCVId(null);
	};

	const handleUpdateTags = () => {
		// Logic for updating tags
		handleMenuClose();
	};

	const handleDeleteCV = () => {
		setDeleteDialogOpen(true);
		handleMenuClose();
	};

	const handleSearchChange = (event) => {
		setSearchTerm(event.target.value);
		setCurrentPage(1); // Reset to the first page after a search
	};

	const handlePageChange = (event, value) => {
		setCurrentPage(value);
	};

	const handleSortToggle = () => {
		setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
	};

	return (
		<Box sx={{ width: '30%', height: '75vh', backgroundColor: 'white', padding: 2, boxShadow: 1 }}>
			<Typography variant="h5" gutterBottom>
				{t('appCVContent.cvListTitle')}
			</Typography>
			<Divider />

			{/* Search Box and Sort Icon */}
			{cvEntries.length > 0 && (
				<Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
					<TextField
						label={t('appCVContent.search')}
						variant="outlined"
						sx={{ width: '100%' }}
						margin="normal"
						value={searchTerm}
						onChange={handleSearchChange}
					/>
					<IconButton onClick={handleSortToggle} sx={{ marginLeft: 1 }}>
						{sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
					</IconButton>
				</Box>
			)}

			{/* CV Entries List */}
			{filteredCVEntries.length === 0 ? (
				<Typography variant="body1">
					{t('appCVContent.noCVEntries')}
				</Typography>
			) : (
				<List sx={{ overflowY: 'scroll', height: 'calc(73vh - 150px)' }}>
					{paginatedCVEntries.map((cv, index) => (
						<ListItem
							divider={true}
							button
							key={index}
							onClick={() => setSelectedCV(cv)}
							sx={{ cursor: 'pointer' }}
						>
							<ListItemText
								primary={cv.personalInformation.name}
								secondary={`${cv.personalInformation.role} - ${new Date(cv.lastUpdatedAt).toLocaleDateString()}`}
							/>
							<IconButton edge="end" onClick={(event) => handleMenuOpen(event, cv.id)}>
								<MoreVertIcon />
							</IconButton>
						</ListItem>
					))}
				</List>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<Pagination
					count={totalPages}
					page={currentPage}
					onChange={handlePageChange}
					sx={{ display: 'flex', justifyContent: 'center' }}
				/>
			)}

			{/* Menu for More Options */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				transformOrigin={{ vertical: 'top', horizontal: 'left' }}
			>
				<MenuItem onClick={handleUpdateTags}>{t('appCVContent.updateTags')}</MenuItem>
				<MenuItem onClick={handleDeleteCV}>{t('appCVContent.deleteCVEntry')}</MenuItem>
			</Menu>
		</Box>
	);
};

AppCVEntries.propTypes = {
	cvEntries: PropTypes.arrayOf(
		PropTypes.shape({
			personalInformation: PropTypes.shape({
				name: PropTypes.string.isRequired,
				role: PropTypes.string.isRequired,
			}).isRequired,
			lastUpdatedAt: PropTypes.string.isRequired,
			_id: PropTypes.string.isRequired,
		})
	).isRequired,
	setSelectedCV: PropTypes.func.isRequired,
	setDeleteDialogOpen: PropTypes.func.isRequired,
};

export default AppCVEntries;
