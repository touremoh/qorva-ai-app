import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
	Box,
	Chip,
	Typography,
	List,
	ListItemButton,
	IconButton,
	Menu,
	MenuItem,
	TextField,
	Pagination,
	Avatar,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
	InputAdornment,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../axiosConfig.js';
import { AUTH_TOKEN } from '../../../constants.js';

const AppCVEntries = ({ cvEntries, setSelectedCV, setDeleteDialogOpen, setCVEntries, viewMode, selectedCV, totalPages, setTotalPages }) => {
	const { t } = useTranslation();
	const [anchorEl, setAnchorEl] = useState(null);
	const [menuCVId, setMenuCVId] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [tableSort, setTableSort] = useState({ column: 'lastUpdatedAt', order: 'desc' });
	const [filterName, setFilterName] = useState('');
	const [filterRole, setFilterRole] = useState('');
	const [filterSkills, setFilterSkills] = useState('');
	const [filterExperience, setFilterExperience] = useState('');

	const entriesPerPage = 25;

	const getAllCVEntries = () =>
		apiClient.get(import.meta.env.VITE_APP_API_CV_URL, {
			params: { pageNumber: 0, pageSize: entriesPerPage },
		});

	const searchCV = (term) =>
		apiClient.get(`${import.meta.env.VITE_APP_API_CV_URL}/search`, {
			params: { pageNumber: 0, pageSize: entriesPerPage, searchTerms: term.trim() },
		});

	const handleSearchChange = async (e) => {
		const value = e.target.value;
		setSearchTerm(value);
		setCurrentPage(1);
		try {
			const response = value.length === 0 ? await getAllCVEntries() : await searchCV(value);
			setCVEntries(response.data.data.content);
			setTotalPages(response.data.data.totalPages ?? 0);
		} catch (error) {
			console.error('Error during search:', error);
		}
	};

	const handlePageChange = async (_, page) => {
		setCurrentPage(page);
		try {
			const url = searchTerm.trim()
				? `${import.meta.env.VITE_APP_API_CV_URL}/search`
				: import.meta.env.VITE_APP_API_CV_URL;
			const params = searchTerm.trim()
				? { pageNumber: page - 1, pageSize: entriesPerPage, searchTerms: searchTerm.trim() }
				: { pageNumber: page - 1, pageSize: entriesPerPage };
			const response = await apiClient.get(url, { params });
			setCVEntries(response.data.data.content);
			setTotalPages(response.data.data.totalPages);
		} catch (error) {
			console.error('Error fetching paginated data:', error);
		}
	};

	const calcTotalYears = (workExperience = []) => {
		let totalMonths = 0;
		const currentYear = new Date().getFullYear();
		workExperience.forEach(({ from, to }) => {
			const start = parseInt(from);
			const end = to && to.toLowerCase() !== 'present' ? parseInt(to) : currentYear;
			if (!isNaN(start) && !isNaN(end) && end >= start) totalMonths += (end - start) * 12;
		});
		const years = Math.round(totalMonths / 12);
		return years > 0 ? years : null;
	};

	const sorted = Array.isArray(cvEntries) && cvEntries.length > 0
		? [...cvEntries].sort((a, b) => {
			if (viewMode === 'table') {
				const { column, order } = tableSort;
				if (column === 'experience') {
					const ya = calcTotalYears(a.workExperience) ?? 0;
					const yb = calcTotalYears(b.workExperience) ?? 0;
					return order === 'asc' ? ya - yb : yb - ya;
				}
				// lastUpdatedAt
				const da = new Date(a.lastUpdatedAt), db = new Date(b.lastUpdatedAt);
				return order === 'asc' ? da - db : db - da;
			}
			// list view sort (newest first)
			const da = new Date(a.lastUpdatedAt), db = new Date(b.lastUpdatedAt);
			return db - da;
		})
		: [];

	const filtered = sorted.filter(cv => {
		const nameMatch = !filterName ||
			(cv.personalInformation.name || '').toLowerCase().includes(filterName.toLowerCase());
		const roleMatch = !filterRole ||
			(cv.personalInformation.role || '').toLowerCase().includes(filterRole.toLowerCase());
		const skillsMatch = !filterSkills || [
			...(cv.skillsAndQualifications?.technicalSkills ?? []),
			...(cv.skillsAndQualifications?.softSkills ?? []),
		].some(s => s.toLowerCase().includes(filterSkills.toLowerCase()));
		const expMin = filterExperience !== '' ? parseInt(filterExperience, 10) : NaN;
		const expMatch = isNaN(expMin) || (calcTotalYears(cv.workExperience) ?? 0) >= expMin;
		return nameMatch && roleMatch && skillsMatch && expMatch;
	});

	// Server already returns one page of results; render all of them.
	const paginated = filtered;

	const getInitials = (name = '') =>
		name.split(' ').map(p => p[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();

	const isActive = (cv) => selectedCV?.id === cv.id;

	const handleMenuOpen = (e, cvId) => {
		e.stopPropagation();
		setAnchorEl(e.currentTarget);
		setMenuCVId(cvId);
	};

	const handleMenuClose = () => { setAnchorEl(null); setMenuCVId(null); };

	const handleTableSort = (column) => {
		setTableSort(prev => ({
			column,
			order: prev.column === column && prev.order === 'desc' ? 'asc' : 'desc',
		}));
	};

	const handleFilterChange = (setter) => (e) => {
		setter(e.target.value);
		setCurrentPage(1);
	};

	const handleDeleteClick = () => {
		const cv = cvEntries.find(c => c.id === menuCVId);
		if (cv) setSelectedCV(cv);
		setDeleteDialogOpen(true);
		handleMenuClose();
	};

	const searchBar = (
		<Box sx={{ px: 1.5, pt: 1.5, pb: 1, flexShrink: 0 }}>
			<TextField
				size="small"
				placeholder={t('appCVContent.search')}
				value={searchTerm}
				onChange={handleSearchChange}
				fullWidth
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
						</InputAdornment>
					),
					sx: { fontSize: '0.82rem', borderRadius: 1.5 },
				}}
			/>
		</Box>
	);

	const contextMenu = (
		<Menu
			anchorEl={anchorEl}
			open={Boolean(anchorEl)}
			onClose={handleMenuClose}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			PaperProps={{
				sx: {
					borderRadius: 1.5,
					border: '1px solid #e2e8f0',
					boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
					minWidth: 160,
				},
			}}
		>
			<MenuItem
				onClick={handleDeleteClick}
				sx={{ fontSize: '0.84rem', color: '#ef4444', py: 1 }}
			>
				{t('appCVContent.deleteCVEntry')}
			</MenuItem>
		</Menu>
	);

	const pagination = totalPages > 1 && (
		<Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5, borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
			<Pagination count={totalPages} page={currentPage} onChange={handlePageChange} size="small" />
		</Box>
	);

	const emptyState = (
		<Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			<Typography sx={{ fontSize: '0.84rem', color: '#94a3b8' }}>
				{t('appCVContent.noCVEntries')}
			</Typography>
		</Box>
	);

	if (viewMode === 'list') {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
				{searchBar}
				{sorted.length === 0 ? emptyState : (
					<List disablePadding sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
						{paginated.map((cv) => (
							<ListItemButton
								key={cv.id}
								onClick={() => setSelectedCV(cv)}
								sx={{
									borderRadius: 1.5,
									mb: 0.5,
									px: 1.5,
									py: 1,
									borderLeft: isActive(cv) ? '3px solid #629C44' : '3px solid transparent',
									backgroundColor: isActive(cv) ? 'rgba(98,156,68,0.07)' : 'transparent',
									'&:hover': {
										backgroundColor: isActive(cv) ? 'rgba(98,156,68,0.10)' : '#f8fafc',
									},
								}}
							>
								<Avatar sx={{
									width: 34,
									height: 34,
									fontSize: '0.72rem',
									fontWeight: 700,
									backgroundColor: isActive(cv) ? '#629C44' : '#e2e8f0',
									color: isActive(cv) ? '#ffffff' : '#64748b',
									mr: 1.5,
									flexShrink: 0,
								}}>
									{getInitials(cv.personalInformation.name)}
								</Avatar>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography sx={{
										fontSize: '0.84rem',
										fontWeight: isActive(cv) ? 600 : 500,
										color: '#0f172a',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}>
										{cv.personalInformation.name}
									</Typography>
									<Typography sx={{
										fontSize: '0.74rem',
										color: '#94a3b8',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}>
										{cv.personalInformation.role}
									</Typography>
								</Box>
								<IconButton
									size="small"
									onClick={(e) => handleMenuOpen(e, cv.id)}
									sx={{ ml: 0.5, color: '#94a3b8', '&:hover': { color: '#64748b' } }}
								>
									<MoreVertIcon sx={{ fontSize: 16 }} />
								</IconButton>
							</ListItemButton>
						))}
					</List>
				)}
				{pagination}
				{contextMenu}
			</Box>
		);
	}

	// Table view
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
			{searchBar}
			{sorted.length === 0 ? emptyState : (
				<TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
					<Table size="small" stickyHeader>
						<TableHead>
							<TableRow>
								<TableCell sx={thSx}>{t('appCVContent.name')}</TableCell>
								<TableCell sx={thSx}>{t('appCVContent.title')}</TableCell>
								<TableCell sx={thSx}>{t('appCVContent.skills')}</TableCell>
								<TableCell sx={{ ...thSx, cursor: 'pointer' }}>
									<TableSortLabel
										active={tableSort.column === 'experience'}
										direction={tableSort.column === 'experience' ? tableSort.order : 'desc'}
										onClick={() => handleTableSort('experience')}
										sx={sortLabelSx}
									>
										{t('appCVContent.experience')}
									</TableSortLabel>
								</TableCell>
								<TableCell sx={{ ...thSx, cursor: 'pointer' }}>
									<TableSortLabel
										active={tableSort.column === 'lastUpdatedAt'}
										direction={tableSort.column === 'lastUpdatedAt' ? tableSort.order : 'desc'}
										onClick={() => handleTableSort('lastUpdatedAt')}
										sx={sortLabelSx}
									>
										{t('appCVContent.lastUpdatedAt')}
									</TableSortLabel>
								</TableCell>
								<TableCell sx={{ ...thSx, width: 48 }} />
							</TableRow>
							<TableRow>
								<TableCell sx={filterCellSx}>
									<TextField
										size="small"
										placeholder={t('appCVContent.filterByName')}
										value={filterName}
										onChange={handleFilterChange(setFilterName)}
										fullWidth
										InputProps={{ sx: filterInputSx }}
									/>
								</TableCell>
								<TableCell sx={filterCellSx}>
									<TextField
										size="small"
										placeholder={t('appCVContent.filterByRole')}
										value={filterRole}
										onChange={handleFilterChange(setFilterRole)}
										fullWidth
										InputProps={{ sx: filterInputSx }}
									/>
								</TableCell>
								<TableCell sx={filterCellSx}>
									<TextField
										size="small"
										placeholder={t('appCVContent.filterBySkill')}
										value={filterSkills}
										onChange={handleFilterChange(setFilterSkills)}
										fullWidth
										InputProps={{ sx: filterInputSx }}
									/>
								</TableCell>
								<TableCell sx={filterCellSx}>
									<TextField
										size="small"
										type="number"
										placeholder={t('appCVContent.filterMinExp')}
										value={filterExperience}
										onChange={handleFilterChange(setFilterExperience)}
										inputProps={{ min: 0 }}
										sx={{ width: 90 }}
										InputProps={{ sx: filterInputSx }}
									/>
								</TableCell>
								<TableCell sx={filterCellSx} />
								<TableCell sx={filterCellSx} />
							</TableRow>
						</TableHead>
						<TableBody>
							{filtered.length === 0 && (
								<TableRow>
									<TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#94a3b8', fontSize: '0.84rem', border: 0 }}>
										{t('appCVContent.noCVEntries')}
									</TableCell>
								</TableRow>
							)}
							{paginated.map((cv) => (
								<TableRow
									key={cv.id}
									hover
									onClick={() => setSelectedCV(cv)}
									selected={isActive(cv)}
									sx={{
										cursor: 'pointer',
										'&.Mui-selected': { backgroundColor: 'rgba(98,156,68,0.07)' },
										'&.Mui-selected:hover': { backgroundColor: 'rgba(98,156,68,0.10)' },
										'&:last-child td': { borderBottom: 0 },
									}}
								>
									<TableCell sx={{ py: 1.25 }}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
											<Avatar sx={{
												width: 28,
												height: 28,
												fontSize: '0.65rem',
												backgroundColor: isActive(cv) ? '#629C44' : '#e2e8f0',
												color: isActive(cv) ? '#ffffff' : '#64748b',
											}}>
												{getInitials(cv.personalInformation.name)}
											</Avatar>
											<Typography sx={{ fontSize: '0.84rem', fontWeight: 500, color: '#0f172a' }}>
												{cv.personalInformation.name}
											</Typography>
										</Box>
									</TableCell>
									<TableCell sx={{ fontSize: '0.82rem', color: '#64748b', py: 1.25 }}>
										{cv.personalInformation.role}
									</TableCell>
									<TableCell sx={{ py: 1.25 }}>
										<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
											{(cv.skillsAndQualifications?.technicalSkills ?? []).slice(0, 3).map((skill, i) => (
												<Chip
													key={i}
													label={skill}
													size="small"
													sx={{
														fontSize: '0.68rem',
														height: 20,
														backgroundColor: 'rgba(98,156,68,0.10)',
														color: '#166534',
														fontWeight: 500,
														'& .MuiChip-label': { px: 0.75 },
													}}
												/>
											))}
										</Box>
									</TableCell>
									<TableCell sx={{ fontSize: '0.82rem', color: '#64748b', py: 1.25, whiteSpace: 'nowrap' }}>
										{(() => {
											const yrs = calcTotalYears(cv.workExperience);
											return yrs ? `${yrs} ${t('appCVContent.yearsAbbr')}` : '—';
										})()}
									</TableCell>
									<TableCell sx={{ fontSize: '0.82rem', color: '#94a3b8', py: 1.25, whiteSpace: 'nowrap' }}>
										{new Date(cv.lastUpdatedAt).toLocaleDateString()}
									</TableCell>
									<TableCell sx={{ py: 1.25 }}>
										<IconButton
											size="small"
											onClick={(e) => handleMenuOpen(e, cv.id)}
											sx={{ color: '#94a3b8', '&:hover': { color: '#64748b' } }}
										>
											<MoreVertIcon sx={{ fontSize: 16 }} />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}
			{pagination}
			{contextMenu}
		</Box>
	);
};

const sortLabelSx = {
	'& .MuiTableSortLabel-icon': { fontSize: 12 },
	'&.Mui-active': { color: '#629C44' },
	'&.Mui-active .MuiTableSortLabel-icon': { color: '#629C44' },
	color: 'inherit',
	fontWeight: 'inherit',
	fontSize: 'inherit',
	textTransform: 'inherit',
	letterSpacing: 'inherit',
};

const filterCellSx = {
	backgroundColor: '#f8fafc',
	borderBottom: '1px solid #e2e8f0',
	py: 0.75,
	px: 1,
};

const filterInputSx = {
	fontSize: '0.78rem',
	borderRadius: 1,
	'& input': { py: '4px', px: '8px' },
};

const thSx = {
	fontWeight: 700,
	fontSize: '0.72rem',
	color: '#64748b',
	textTransform: 'uppercase',
	letterSpacing: '0.05em',
	backgroundColor: '#f8fafc',
	borderBottom: '2px solid #e2e8f0',
};

AppCVEntries.propTypes = {
	cvEntries: PropTypes.array.isRequired,
	setSelectedCV: PropTypes.func.isRequired,
	setDeleteDialogOpen: PropTypes.func.isRequired,
	setCVEntries: PropTypes.func.isRequired,
	viewMode: PropTypes.oneOf(['list', 'table']).isRequired,
	selectedCV: PropTypes.object,
	totalPages: PropTypes.number.isRequired,
	setTotalPages: PropTypes.func.isRequired,
};

export default AppCVEntries;
