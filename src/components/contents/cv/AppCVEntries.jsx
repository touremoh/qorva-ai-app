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
	Pagination,
	Chip
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useTranslation } from 'react-i18next';
import apiClient from "../../../../axiosConfig.js";
import {AUTH_TOKEN, TENANT_ID} from "../../../constants.js";

const AppCVEntries = ({ cvEntries, setSelectedCV, setDeleteDialogOpen, setCVEntries }) => {
	const { t } = useTranslation();
	const [anchorEl, setAnchorEl] = useState(null);
	const [selectedCVId, setSelectedCVId] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [sortOrder, setSortOrder] = useState('desc'); // Sorting order state
	const [totalPages, setTotalPages] = useState(0);

	const entriesPerPage = 25;

	const getAllCVEntries = async () => {
		const tenantId = localStorage.getItem(TENANT_ID);
		return await apiClient.get(`${import.meta.env.VITE_APP_API_CV_URL}/${tenantId}`);
	};

	const searchCVEntriesByCriteria = async (searchTerm) => {
		return await apiClient.get(`${import.meta.env.VITE_APP_API_CV_URL}/search`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN)}`,
				tenantId: localStorage.getItem(TENANT_ID),
			},
			params: {
				pageNumber: 0,
				pageSize: entriesPerPage,
				searchTerms: searchTerm.trim(),
			},
		});
	}

	// Handle search functionality
	const handleSearchChange = async (event) => {
		const searchValue = event.target.value;
		setSearchTerm(searchValue);
		setCurrentPage(1); // Reset to the first page after a search
		try {
			let response = null;
			let totalPages = 0;
			if (searchValue === undefined || searchValue.length === 0) {
				response = await getAllCVEntries();
				setCVEntries(response.data.data.content);
				totalPages = response.data.data.content.totalPages;
			} else {
				response = await searchCVEntriesByCriteria(searchTerm);
				setCVEntries(response.data.data.content);
				totalPages = response.data.data.content.totalPages;
			}
			setTotalPages(totalPages);
		} catch (error) {
			console.error('Error during search:', error);
		}
	};

	// Handle pagination change
	const handlePageChange = async (event, page) => {
		setCurrentPage(page);
		try {
			const response = await apiClient.get(`${import.meta.env.VITE_APP_API_CV_URL}/search`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN)}`,
				},
				params: {
					pageNumber: page - 1,
					pageSize: entriesPerPage,
					searchTerms: searchTerm,
				},
			});
			setCVEntries(response.data.data.content); // Update the entries in the parent component
			setTotalPages(response.data.data.totalPages);
		} catch (error) {
			console.error('Error fetching paginated data:', error);
		}
	};

	// Sorting CV entries by last updated date based on sortOrder state
	const sortedCVEntries = Array.isArray(cvEntries) && cvEntries.length > 0
		? [...cvEntries].sort((a, b) => {
			if (sortOrder === 'asc') {
				return new Date(a.lastUpdatedAt) - new Date(b.lastUpdatedAt);
			} else {
				return new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt);
			}
		})
		: [];

	// Calculating pagination data
	const paginatedCVEntries = sortedCVEntries.slice(
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

	const handleSortToggle = () => {
		setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
	};

	const handleCVSelection = (cv) => {
		setSelectedCV(cv);
		setSelectedCVId(cv.id);
	};

	return (
		<Box sx={{ width: '25%', height: '95vh',  backgroundColor: 'white', padding: 2, boxShadow: 1}}>
			<Typography variant="h5" gutterBottom>
				{t('appCVContent.cvListTitle')}
			</Typography>
			<Divider />

			{/* Search Box and Sort Icon */}
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

			{/* CV Entries List */}
			{sortedCVEntries.length === 0 ? (
				<Typography variant="body1">
					{t('appCVContent.noCVEntries')}
				</Typography>
			) : (
				<List sx={{ overflowY: 'scroll', height: '100%' }}>
					{paginatedCVEntries.map((cv, index) => (
						<ListItem
							divider
							button="true"
							key={index}
							onClick={() => handleCVSelection(cv)}
							sx={{
								cursor: 'pointer',
								position: 'relative',
							}}
						>
							{/* Green Badge */}
							{selectedCVId === cv.id && (
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
					sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', bottom: '2%', width: '25%' }}
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
			id: PropTypes.string.isRequired,
		})
	).isRequired,
	setSelectedCV: PropTypes.func.isRequired,
	setDeleteDialogOpen: PropTypes.func.isRequired,
	setCVEntries: PropTypes.func.isRequired,
};

export default AppCVEntries;
