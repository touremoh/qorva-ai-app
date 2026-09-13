// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
	Box,
	Button,
	Chip,
	Typography,
	List,
	ListItemButton,
	IconButton,
	Menu,
	MenuItem,
	Select,
	Pagination,
	Avatar,
	TextField,
	InputAdornment,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TuneIcon from '@mui/icons-material/Tune';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { getCVs } from '../../../services/cvService.js';
import { ATS_LABELS } from './atsLabels.js';
import { toQueryParams } from './useCVFilters.js';

const PAGE_SIZES = [10, 25, 50, 100];
const GREEN = '#629C44';

/** Tiny "via <ATS>" origin badge for CVs imported through an integration. */
const AtsSourceChip = ({ cv }) => {
	const ref = cv.atsRefs?.[0];
	if (!ref) return null;
	return (
		<Chip
			label={ATS_LABELS[ref.provider] || ref.provider}
			size="small"
			sx={{
				height: 16, fontSize: '0.6rem', fontWeight: 700, ml: 0.5,
				color: '#0369a1', backgroundColor: 'rgba(3,105,161,0.08)',
				'& .MuiChip-label': { px: 0.75 },
			}}
		/>
	);
};
AtsSourceChip.propTypes = { cv: PropTypes.object.isRequired };

const AppCVEntries = ({
	cvEntries, setSelectedCV, setDeleteDialogOpen, setCVEntries,
	selectedCV, totalPages, setTotalPages, totalElements, setTotalElements,
	showArchived = false, onUnarchive,
	filters, sort, activeCount, filtersOpen, onToggleFilters, onClearFilters, refreshKey = 0,
	quickSearch = '', onQuickSearchChange,
}) => {
	const { t } = useTranslation();
	const [anchorEl, setAnchorEl] = useState(null);
	const [menuCVId, setMenuCVId] = useState(null);
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

	const getInitials = (name) =>
		(name || '').split(' ').map(p => p[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || '?';

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

	// Quick search narrows within whatever the rail has selected (AND on the server), so it's
	// the fast path for "that Java person" without touching the filters.
	const searchBox = (
		<Box sx={{ px: 1.5, pt: 1.5, flexShrink: 0 }}>
			<TextField
				size="small"
				fullWidth
				placeholder={t('appCVContent.filters.quickSearch')}
				value={quickSearch}
				onChange={(e) => onQuickSearchChange?.(e.target.value)}
				onKeyDown={(e) => { if (e.key === 'Escape' && quickSearch) onQuickSearchChange?.(''); }}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon sx={{ fontSize: 16, color: quickSearch ? GREEN : '#94a3b8' }} />
						</InputAdornment>
					),
					endAdornment: quickSearch ? (
						<InputAdornment position="end">
							<IconButton
								size="small"
								onClick={() => onQuickSearchChange?.('')}
								aria-label={t('appCVContent.filters.clear')}
								sx={{ p: 0.25, color: '#94a3b8', '&:hover': { color: '#334155' } }}
							>
								<CloseRoundedIcon sx={{ fontSize: 14 }} />
							</IconButton>
						</InputAdornment>
					) : null,
					sx: {
						fontSize: '0.82rem',
						borderRadius: 1.5,
						backgroundColor: '#ffffff',
						'& fieldset': { borderColor: '#e2e8f0' },
						'&:hover fieldset': { borderColor: '#cbd5e1' },
						'&.Mui-focused fieldset': { borderColor: GREEN, borderWidth: 1 },
					},
				}}
			/>
		</Box>
	);

	// Same outlined-toggle idiom as the Archived button in the toolbar: quiet at rest, green
	// when the rail is open, and a solid count pill once filters are actually narrowing the list.
	const engaged = filtersOpen || activeCount > 0;
	const filterBar = (
		<Box sx={{
			display: 'flex', alignItems: 'center', gap: 0.75,
			px: 1.5, py: 1, flexShrink: 0,
			borderBottom: '1px solid #f1f5f9',
		}}>
			<Button
				onClick={onToggleFilters}
				aria-pressed={filtersOpen}
				disableRipple
				startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
				sx={{
					height: 32,
					pl: 1.25,
					pr: activeCount > 0 ? 0.75 : 1.5,
					borderRadius: 999,
					textTransform: 'none',
					fontSize: '0.8rem',
					fontWeight: 600,
					lineHeight: 1,
					letterSpacing: 0,
					color: engaged ? GREEN : '#334155',
					backgroundColor: engaged ? 'rgba(98,156,68,0.08)' : '#ffffff',
					border: `1px solid ${engaged ? GREEN : '#e2e8f0'}`,
					boxShadow: 'none',
					transition: 'all 0.15s ease',
					'& .MuiButton-startIcon': { mr: 0.75, ml: 0, color: engaged ? GREEN : '#64748b' },
					'&:hover': {
						borderColor: GREEN,
						color: GREEN,
						backgroundColor: engaged ? 'rgba(98,156,68,0.12)' : 'rgba(98,156,68,0.05)',
						'& .MuiButton-startIcon': { color: GREEN },
					},
					'&:focus-visible': { outline: `2px solid rgba(98,156,68,0.35)`, outlineOffset: 2 },
				}}
			>
				{t('appCVContent.filters.button')}
				{activeCount > 0 && (
					<Box component="span" sx={{
						ml: 1,
						minWidth: 20,
						height: 20,
						px: 0.75,
						borderRadius: 999,
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: '0.68rem',
						fontWeight: 700,
						color: '#ffffff',
						backgroundColor: GREEN,
					}}>
						{activeCount}
					</Box>
				)}
			</Button>
			{activeCount > 0 && (
				<IconButton
					size="small"
					onClick={onClearFilters}
					aria-label={t('appCVContent.filters.clearAll')}
					title={t('appCVContent.filters.clearAll')}
					sx={{
						width: 28, height: 28,
						color: '#94a3b8',
						'&:hover': { color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.06)' },
					}}
				>
					<CloseRoundedIcon sx={{ fontSize: 16 }} />
				</IconButton>
			)}
			<Box sx={{ flexGrow: 1 }} />
			<Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
				{t('appCVContent.resumeCount', { count: totalElements })}
			</Typography>
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
			{showArchived && onUnarchive && (
				<MenuItem
					onClick={() => { onUnarchive(menuCVId); handleMenuClose(); }}
					sx={{ fontSize: '0.84rem', color: '#629C44', py: 1 }}
				>
					{t('appCVContent.unarchive', 'Unarchive')}
				</MenuItem>
			)}
			<MenuItem
				onClick={handleDeleteClick}
				sx={{ fontSize: '0.84rem', color: '#ef4444', py: 1 }}
			>
				{t('appCVContent.deleteCVEntry')}
			</MenuItem>
		</Menu>
	);

	const paginationFooter = (
		<Box sx={{
			display: 'flex', alignItems: 'center', justifyContent: 'space-between',
			px: 1.5, py: 0.75,
			borderTop: '1px solid #f1f5f9',
			flexShrink: 0, gap: 1, flexWrap: 'wrap',
			backgroundColor: '#fafafa',
		}}>
			<Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', flexShrink: 0 }}>
				{totalPages > 1
					? t('appCVContent.pageOf', { page: currentPage, total: totalPages })
					: t('appCVContent.resumeCount', { count: totalElements })}
			</Typography>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				<Select
					size="small"
					value={pageSize}
					onChange={handlePageSizeChange}
					variant="outlined"
					sx={{
						fontSize: '0.72rem', height: 24, minWidth: 52,
						'& .MuiSelect-select': { py: '2px', px: '8px' },
						'& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
					}}
				>
					{PAGE_SIZES.map(n => (
						<MenuItem key={n} value={n} sx={{ fontSize: '0.78rem' }}>{n}</MenuItem>
					))}
				</Select>
				{totalPages > 1 && (
					<Pagination
						count={totalPages}
						page={currentPage}
						onChange={handlePageChange}
						size="small"
						siblingCount={0}
						boundaryCount={1}
						sx={{ '& .MuiPaginationItem-root': { fontSize: '0.72rem', minWidth: 24, height: 24 } }}
					/>
				)}
			</Box>
		</Box>
	);

	const emptyState = (
		<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, px: 2 }}>
			<Typography sx={{ fontSize: '0.84rem', color: '#94a3b8', textAlign: 'center' }}>
				{activeCount > 0 || quickSearch ? t('appCVContent.filters.noMatch') : t('appCVContent.noCVEntries')}
			</Typography>
			{(activeCount > 0 || quickSearch) && (
				<Button
					size="small"
					onClick={() => { onClearFilters(); onQuickSearchChange?.(''); }}
					sx={{ textTransform: 'none', fontSize: '0.78rem', fontWeight: 600, color: '#629C44' }}
				>
					{t('appCVContent.filters.clearAll')}
				</Button>
			)}
		</Box>
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
								{getInitials(cv.personalInformation?.name)}
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
									{cv.personalInformation?.name || '—'}
								</Typography>
								<Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
									<Typography sx={{
										fontSize: '0.74rem',
										color: '#94a3b8',
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
								sx={{ ml: 0.5, color: '#94a3b8', '&:hover': { color: '#64748b' } }}
							>
								<MoreVertIcon sx={{ fontSize: 16 }} />
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
