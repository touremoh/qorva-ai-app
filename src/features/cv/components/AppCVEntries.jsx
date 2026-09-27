// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react';
import { getInitials } from '../../../shared/lib/text.js';
import PropTypes from 'prop-types';
import {
	Box,
	Typography,
	List,
	ListItemButton,
	IconButton,
	Avatar,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getCVs } from '../api/cvService.js';
import { isActionAllowed } from '../../../utils/demoMode.js';
import { useCandidateOutreach } from '../../../contexts/CandidateOutreachContext.jsx';
import { toQueryParams } from '../hooks/useCVFilters.js';
import AtsSourceChip from './list/AtsSourceChip.jsx';
import CvListEmpty from './list/CvListEmpty.jsx';
import CvFilterBar from './list/CvFilterBar.jsx';
import CvSearchBox from './list/CvSearchBox.jsx';
import CvListPager from './list/CvListPager.jsx';
import CvRowMenu from './list/CvRowMenu.jsx';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

const AppCVEntries = ({
	cvEntries, setSelectedCV, setDeleteDialogOpen, setCVEntries,
	selectedCV, totalPages, setTotalPages, totalElements, setTotalElements,
	showArchived = false, onUnarchive,
	filters, sort, activeCount, filtersOpen, onToggleFilters, onClearFilters, refreshKey = 0,
	quickSearch = '', onQuickSearchChange,
}) => {
	const [anchorEl, setAnchorEl] = useState(null);
	const [menuCVId, setMenuCVId] = useState(null);
	// Hidden (not disabled) without the authority — demo users and restricted teammates never see it.
	const canContact = isActionAllowed('CONTACT_CANDIDATE');
	const outreach = useCandidateOutreach();
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);
	const [loading, setLoading] = useState(false);

	// Only the newest request may write to the list; a slow earlier page must not overwrite it.
	const requestSeq = useRef(0);

	const buildParams = (page, size) => ({
		pageNumber: page,
		pageSize: size,
		...(showArchived ? { archived: 'true' } : {}),
		...toQueryParams(filters, sort, quickSearch),
	});

	const fetchPage = async (page, size) => {
		const seq = ++requestSeq.current;
		setLoading(true);
		try {
			const response = await getCVs(buildParams(page - 1, size));
			if (seq !== requestSeq.current) return null;
			const data = response.data.data;
			setCVEntries(data.content);
			setTotalPages(data.totalPages ?? 0);
			setTotalElements(data.totalElements ?? 0);
			return data.content;
		} catch (error) {
			console.error('Error fetching CVs:', error);
			return null;
		} finally {
			if (seq === requestSeq.current) setLoading(false);
		}
	};

	// Any change to what we're asking for restarts at page 1. Debounced so typing a name
	// or stacking chips issues one request, not one per keystroke.
	useEffect(() => {
		const timer = setTimeout(async () => {
			setCurrentPage(1);
			const content = await fetchPage(1, pageSize);
			if (content && selectedCV && !content.some(cv => cv.id === selectedCV.id)) {
				setSelectedCV(null);
			}
		}, 300);
		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filters, sort, quickSearch, showArchived, refreshKey]);

	const handlePageChange = (_, page) => {
		setCurrentPage(page);
		fetchPage(page, pageSize);
	};

	const handlePageSizeChange = (e) => {
		const newSize = e.target.value;
		setPageSize(newSize);
		setCurrentPage(1);
		fetchPage(1, newSize);
	};

	const entries = Array.isArray(cvEntries) ? cvEntries : [];

	const isActive = (cv) => selectedCV?.id === cv.id;

	const handleMenuOpen = (e, cvId) => {
		e.stopPropagation();
		setAnchorEl(e.currentTarget);
		setMenuCVId(cvId);
	};

	const handleMenuClose = () => { setAnchorEl(null); setMenuCVId(null); };

	const handleDeleteClick = () => {
		const cv = cvEntries.find(c => c.id === menuCVId);
		if (cv) setSelectedCV(cv);
		setDeleteDialogOpen(true);
		handleMenuClose();
	};

	const handleEmailClick = () => {
		const cv = cvEntries.find(c => c.id === menuCVId);
		handleMenuClose();
		if (!cv) return;
		outreach?.openComposer({ cvId: cv.id, candidateName: cv.personalInformation?.name });
	};
	const menuCV = cvEntries.find(c => c.id === menuCVId);
	const menuCVHasEmail = Boolean(menuCV?.personalInformation?.contact?.email);

	// Quick search narrows within whatever the rail has selected (AND on the server), so it's
	// the fast path for "that Java person" without touching the filters.
	const searchBox = (
		<CvSearchBox
			onQuickSearchChange={onQuickSearchChange}
			quickSearch={quickSearch}
		/>
	);

	// Same outlined-toggle idiom as the Archived button in the toolbar: quiet at rest, green
	// when the rail is open, and a solid count pill once filters are actually narrowing the list.
	const engaged = filtersOpen || activeCount > 0;
	const filterBar = (
		<CvFilterBar
			activeCount={activeCount}
			engaged={engaged}
			filtersOpen={filtersOpen}
			onClearFilters={onClearFilters}
			onToggleFilters={onToggleFilters}
			totalElements={totalElements}
		/>
	);

	const contextMenu = (
		<CvRowMenu
			anchorEl={anchorEl}
			canContact={canContact}
			handleDeleteClick={handleDeleteClick}
			handleEmailClick={handleEmailClick}
			handleMenuClose={handleMenuClose}
			menuCVHasEmail={menuCVHasEmail}
			menuCVId={menuCVId}
			onUnarchive={onUnarchive}
			showArchived={showArchived}
		/>
	);

	const paginationFooter = (
		<CvListPager
			currentPage={currentPage}
			handlePageChange={handlePageChange}
			handlePageSizeChange={handlePageSizeChange}
			pageSize={pageSize}
			totalElements={totalElements}
			totalPages={totalPages}
		/>
	);

	const emptyState = (
		<CvListEmpty
			activeCount={activeCount}
			onClearFilters={onClearFilters}
			onQuickSearchChange={onQuickSearchChange}
			quickSearch={quickSearch}
		/>
	);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
			{searchBox}
			{filterBar}
			{entries.length === 0 && !loading ? emptyState : (
				<List disablePadding sx={{ flex: 1, overflowY: 'auto', px: 1, opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s' }}>
					{entries.map((cv) => (
						<ListItemButton
							key={cv.id}
							onClick={() => setSelectedCV(cv)}
							sx={{
								borderRadius: 1.5,
								mb: 0.5,
								px: 1.5,
								py: 1,
								borderLeft: isActive(cv) ? `3px solid ${tokens.brand.main}` : '3px solid transparent',
								backgroundColor: isActive(cv) ? alpha(tokens.brand.main, 0.07) : 'transparent',
								'&:hover': {
									backgroundColor: isActive(cv) ? alpha(tokens.brand.main, 0.10) : `${tokens.surface.subtle}`,
								},
							}}
						>
							<Avatar sx={{
								width: 34,
								height: 34,
								fontSize: tokens.fontSize.caption,
								fontWeight: 700,
								backgroundColor: isActive(cv) ? `${tokens.brand.main}` : `${tokens.line.main}`,
								color: isActive(cv) ? `${tokens.surface.paper}` : `${tokens.ink.muted}`,
								mr: 1.5,
								flexShrink: 0,
							}}>
								{getInitials(cv.personalInformation?.name, '?')}
							</Avatar>
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Typography sx={{
									fontSize: tokens.fontSize.body2,
									fontWeight: isActive(cv) ? 600 : 500,
									color: tokens.ink.strong,
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
								}}>
									{cv.personalInformation?.name || '—'}
								</Typography>
								<Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
									<Typography sx={{
										fontSize: tokens.fontSize.small,
										color: tokens.ink.subtle,
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}>
										{cv.personalInformation?.role}
									</Typography>
									<AtsSourceChip cv={cv} />
								</Box>
							</Box>
							<IconButton
								size="small"
								onClick={(e) => handleMenuOpen(e, cv.id)}
								sx={{ ml: 0.5, color: tokens.ink.subtle, '&:hover': { color: tokens.ink.muted } }}
							>
								<MoreVertIcon sx={{ fontSize: tokens.iconSize.md }} />
							</IconButton>
						</ListItemButton>
					))}
				</List>
			)}
			{paginationFooter}
			{contextMenu}
		</Box>
	);
};

AppCVEntries.propTypes = {
	cvEntries: PropTypes.array.isRequired,
	setSelectedCV: PropTypes.func.isRequired,
	setDeleteDialogOpen: PropTypes.func.isRequired,
	setCVEntries: PropTypes.func.isRequired,
	selectedCV: PropTypes.object,
	totalPages: PropTypes.number.isRequired,
	setTotalPages: PropTypes.func.isRequired,
	totalElements: PropTypes.number.isRequired,
	setTotalElements: PropTypes.func.isRequired,
	showArchived: PropTypes.bool,
	onUnarchive: PropTypes.func,
	filters: PropTypes.object.isRequired,
	sort: PropTypes.string.isRequired,
	activeCount: PropTypes.number.isRequired,
	filtersOpen: PropTypes.bool.isRequired,
	onToggleFilters: PropTypes.func.isRequired,
	onClearFilters: PropTypes.func.isRequired,
	refreshKey: PropTypes.number,
	quickSearch: PropTypes.string,
	onQuickSearchChange: PropTypes.func,
};

export default AppCVEntries;
