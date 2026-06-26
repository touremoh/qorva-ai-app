import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	MenuItem,
	Menu,
	Pagination,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getDuplicates, getCVById, deleteCV } from '../../../services/cvService.js';

const PAGE_SIZE = 20;

const matchTypeStyle = {
	PHONE: { bg: 'rgba(99,102,241,0.08)', color: '#6366f1', Icon: PhoneIcon },
	EMAIL: { bg: 'rgba(234,88,12,0.08)', color: '#ea580c', Icon: EmailIcon },
};

const AppCVDuplicates = ({ setSelectedCV, selectedCV, onCountChange }) => {
	const [groups, setGroups] = useState([]);
	const [totalPages, setTotalPages] = useState(0);
	const [totalElements, setTotalElements] = useState(0);
	const [page, setPage] = useState(0);
	const [loading, setLoading] = useState(false);
	const [expanded, setExpanded] = useState(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [cvToDelete, setCvToDelete] = useState(null);
	const [menuAnchor, setMenuAnchor] = useState(null);
	const [menuCvId, setMenuCvId] = useState(null);

	const fetchDuplicates = useCallback(async (pageNumber = 0) => {
		setLoading(true);
		try {
			const response = await getDuplicates(pageNumber, PAGE_SIZE);
			const data = response.data;
			setGroups(data.content ?? []);
			setTotalPages(data.totalPages ?? 0);
			setTotalElements(data.totalElements ?? 0);
			onCountChange?.(data.totalElements ?? 0);
		} catch (error) {
			console.error('Error fetching duplicates:', error);
		} finally {
			setLoading(false);
		}
	}, [onCountChange]);

	useEffect(() => {
		fetchDuplicates(0);
	}, [fetchDuplicates]);

	const handleCVClick = async (cvId) => {
		try {
			const response = await getCVById(cvId);
			setSelectedCV(response.data.data);
		} catch (error) {
			console.error('Error fetching CV:', error);
		}
	};

	const handleMenuOpen = (e, cvId) => {
		e.stopPropagation();
		setMenuAnchor(e.currentTarget);
		setMenuCvId(cvId);
	};

	const handleMenuClose = () => {
		setMenuAnchor(null);
		setMenuCvId(null);
	};

	const handleDeleteClick = () => {
		setCvToDelete(menuCvId);
		setDeleteDialogOpen(true);
		handleMenuClose();
	};

	const handleDeleteConfirm = async () => {
		if (!cvToDelete) return;
		try {
			await deleteCV(cvToDelete);
			if (selectedCV?.id === cvToDelete) setSelectedCV(null);
			setDeleteDialogOpen(false);
			setCvToDelete(null);
			await fetchDuplicates(page);
		} catch (error) {
			console.error('Error deleting CV:', error);
		}
	};

	const handlePageChange = (_, newPage) => {
		const nextPage = newPage - 1;
		setPage(nextPage);
		setExpanded(null);
		fetchDuplicates(nextPage);
	};

	const isActive = (cvId) => selectedCV?.id === cvId;

	const paginationFooter = (
		<Box sx={{
			display: 'flex', alignItems: 'center', justifyContent: 'space-between',
			px: 1.5, py: 0.75,
			borderTop: '1px solid #f1f5f9',
			flexShrink: 0, gap: 1, flexWrap: 'wrap',
			backgroundColor: '#fafafa',
		}}>
			<Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', flexShrink: 0 }}>
				{totalElements} duplicate group{totalElements !== 1 ? 's' : ''}
				{totalPages > 1 && (
					<Box component="span" sx={{ ml: 1, color: '#cbd5e1' }}>·</Box>
				)}
				{totalPages > 1 && (
					<Box component="span" sx={{ ml: 1 }}>
						Page {page + 1} of {totalPages}
					</Box>
				)}
			</Typography>
			{totalPages > 1 && (
				<Pagination
					count={totalPages}
					page={page + 1}
					onChange={handlePageChange}
					size="small"
					siblingCount={0}
					boundaryCount={1}
					sx={{ '& .MuiPaginationItem-root': { fontSize: '0.72rem', minWidth: 24, height: 24 } }}
				/>
			)}
		</Box>
	);

	if (loading) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
				<Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<CircularProgress size={28} sx={{ color: '#629C44' }} />
				</Box>
				{paginationFooter}
			</Box>
		);
	}

	if (groups.length === 0) {
		return (
			<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
				<Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<Typography sx={{ fontSize: '0.84rem', color: '#94a3b8' }}>
						No duplicates found
					</Typography>
				</Box>
				{paginationFooter}
			</Box>
		);
	}

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
			<Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1 }}>
				{groups.map((group, idx) => {
					const style = matchTypeStyle[group.matchType] ?? matchTypeStyle.EMAIL;
					const { Icon } = style;
					return (
						<Accordion
							key={`${group.matchType}-${group.matchValue}-${idx}`}
							expanded={expanded === idx}
							onChange={() => setExpanded(expanded === idx ? null : idx)}
							disableGutters
							elevation={0}
							sx={{
								mb: 0.75,
								border: '1px solid #e2e8f0',
								borderRadius: '8px !important',
								overflow: 'hidden',
								'&:before': { display: 'none' },
								'&.Mui-expanded': { border: '1px solid #629C44' },
							}}
						>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, color: '#94a3b8' }} />}
								sx={{
									px: 1.5,
									minHeight: 48,
									'& .MuiAccordionSummary-content': { my: 0.5, alignItems: 'center', gap: 1.25 },
								}}
							>
								<Box sx={{
									display: 'flex', alignItems: 'center', gap: 0.5,
									backgroundColor: style.bg,
									borderRadius: 1,
									px: 0.75, py: 0.25,
									flexShrink: 0,
								}}>
									<Icon sx={{ fontSize: 12, color: style.color }} />
									<Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: style.color, letterSpacing: '0.04em' }}>
										{group.matchType}
									</Typography>
								</Box>
								<Typography sx={{ fontSize: '0.84rem', fontWeight: 500, color: '#0f172a', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
									{group.matchValue}
								</Typography>
								<Chip
									label={group.count}
									size="small"
									sx={{
										fontSize: '0.68rem',
										height: 18,
										backgroundColor: '#fef2f2',
										color: '#dc2626',
										fontWeight: 700,
										'& .MuiChip-label': { px: 0.6 },
										flexShrink: 0,
									}}
								/>
							</AccordionSummary>

							<AccordionDetails sx={{ p: 0 }}>
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell sx={thSx}>Name</TableCell>
											<TableCell sx={thSx}>Email</TableCell>
											<TableCell sx={thSx}>Added</TableCell>
											<TableCell sx={{ ...thSx, width: 36 }} />
										</TableRow>
									</TableHead>
									<TableBody>
										{group.cvs.map((cv) => (
											<TableRow
												key={cv.cvId}
												hover
												onClick={() => handleCVClick(cv.cvId)}
												selected={isActive(cv.cvId)}
												sx={{
													cursor: 'pointer',
													'&:last-child td': { borderBottom: 0 },
													'&.Mui-selected': { backgroundColor: 'rgba(98,156,68,0.07)' },
													'&.Mui-selected:hover': { backgroundColor: 'rgba(98,156,68,0.10)' },
												}}
											>
												<TableCell sx={{ fontSize: '0.82rem', fontWeight: isActive(cv.cvId) ? 600 : 400, color: '#0f172a', py: 1 }}>
													{cv.name}
												</TableCell>
												<TableCell sx={{ fontSize: '0.78rem', color: '#64748b', py: 1 }}>
													{cv.email}
												</TableCell>
												<TableCell sx={{ fontSize: '0.74rem', color: '#94a3b8', whiteSpace: 'nowrap', py: 1 }}>
													{new Date(cv.createdAt).toLocaleDateString()}
												</TableCell>
												<TableCell sx={{ py: 1 }}>
													<Tooltip title="More actions">
														<IconButton
															size="small"
															onClick={(e) => handleMenuOpen(e, cv.cvId)}
															sx={{ color: '#94a3b8', '&:hover': { color: '#64748b' } }}
														>
															<MoreVertIcon sx={{ fontSize: 15 }} />
														</IconButton>
													</Tooltip>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</AccordionDetails>
						</Accordion>
					);
				})}
			</Box>

			{paginationFooter}

			{/* Context menu */}
			<Menu
				anchorEl={menuAnchor}
				open={Boolean(menuAnchor)}
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
					Delete CV entry
				</MenuItem>
			</Menu>

			{/* Delete confirmation */}
			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				PaperProps={{ sx: { borderRadius: 2.5 } }}
			>
				<DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
					Delete CV entry
				</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ fontSize: '0.88rem', color: '#64748b' }}>
						This will permanently remove this CV. This action cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
					<Button
						onClick={() => setDeleteDialogOpen(false)}
						sx={{ textTransform: 'none', color: '#64748b', borderRadius: 1.5 }}
					>
						Cancel
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						variant="contained"
						color="error"
						sx={{ textTransform: 'none', borderRadius: 1.5, boxShadow: 'none' }}
					>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

const thSx = {
	fontWeight: 700,
	fontSize: '0.68rem',
	color: '#64748b',
	textTransform: 'uppercase',
	letterSpacing: '0.05em',
	backgroundColor: '#f8fafc',
	borderBottom: '1px solid #e2e8f0',
	py: 0.75,
};

AppCVDuplicates.propTypes = {
	setSelectedCV: PropTypes.func.isRequired,
	selectedCV: PropTypes.object,
	onCountChange: PropTypes.func,
};

export default AppCVDuplicates;
