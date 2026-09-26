// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useState } from 'react';
import ConfirmDialog from '../../../shared/ui/ConfirmDialog.jsx';
import PropTypes from 'prop-types';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Chip,
	CircularProgress,
	IconButton,
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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';
import { getDuplicates, deleteCV } from '../../cv/api/cvService.js';
import * as tokens from '../../../theme/tokens.js';

const PAGE_SIZE = 10;

const matchTypeStyle = {
	PHONE: { bg: 'rgba(99,102,241,0.08)', color: tokens.status.accent.bright, Icon: PhoneIcon },
	EMAIL: { bg: 'rgba(234,88,12,0.08)', color: tokens.status.warning.orange, Icon: EmailIcon },
};

const thSx = {
	fontWeight: 700,
	fontSize: tokens.fontSize.caption,
	color: tokens.ink.muted,
	textTransform: 'uppercase',
	letterSpacing: '0.05em',
	backgroundColor: tokens.surface.subtle,
	borderBottom: `1px solid ${tokens.line.main}`,
	py: 0.75,
};

/**
 * Duplicate resume groups, embedded under the DUPLICATES row of the Issues panel.
 * Deleting a copy notifies the parent so the quality report can refresh its scores.
 */
const QualityDuplicatesList = ({ onChanged }) => {
	const { t } = useTranslation();
	const [groups, setGroups] = useState([]);
	const [totalPages, setTotalPages] = useState(0);
	const [totalElements, setTotalElements] = useState(0);
	const [page, setPage] = useState(0);
	const [loading, setLoading] = useState(true);
	const [expanded, setExpanded] = useState(null);
	const [cvToDelete, setCvToDelete] = useState(null);

	const fetchDuplicates = useCallback(async (pageNumber = 0) => {
		setLoading(true);
		try {
			const response = await getDuplicates(pageNumber, PAGE_SIZE);
			const data = response.data;
			setGroups(data.content ?? []);
			setTotalPages(data.totalPages ?? 0);
			setTotalElements(data.totalElements ?? 0);
		} catch (error) {
			console.error('Error fetching duplicates:', error);
			setGroups([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchDuplicates(0);
	}, [fetchDuplicates]);

	const handleDeleteConfirm = async () => {
		if (!cvToDelete) return;
		try {
			await deleteCV(cvToDelete);
			setCvToDelete(null);
			await fetchDuplicates(page);
			onChanged?.();
		} catch (error) {
			console.error('Error deleting CV:', error);
			setCvToDelete(null);
		}
	};

	const handlePageChange = (_, newPage) => {
		const nextPage = newPage - 1;
		setPage(nextPage);
		setExpanded(null);
		fetchDuplicates(nextPage);
	};

	if (loading && groups.length === 0) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
				<CircularProgress size={20} sx={{ color: tokens.brand.text }} />
			</Box>
		);
	}

	if (groups.length === 0) {
		return (
			<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.subtle, py: 1.5, textAlign: 'center' }}>
				{t('libraryQuality.duplicates.empty', 'No duplicates found.')}
			</Typography>
		);
	}

	return (
		<Box>
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
							border: `1px solid ${tokens.line.main}`,
							borderRadius: '8px !important',
							overflow: 'hidden',
							'&:before': { display: 'none' },
							'&.Mui-expanded': { border: `1px solid ${tokens.brand.main}` },
						}}
					>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon sx={{ fontSize: tokens.iconSize.lg, color: tokens.ink.subtle }} />}
							sx={{
								px: 1.5,
								minHeight: 44,
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
								<Icon sx={{ fontSize: tokens.iconSize.xs, color: style.color }} />
								<Typography sx={{ fontSize: tokens.fontSize.caption, fontWeight: 700, color: style.color, letterSpacing: '0.04em' }}>
									{group.matchType}
								</Typography>
							</Box>
							<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: 500, color: tokens.ink.strong, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
								{group.matchValue}
							</Typography>
							<Chip
								label={group.count}
								size="small"
								sx={{
									fontSize: tokens.fontSize.caption,
									height: 18,
									backgroundColor: tokens.status.error.pale,
									color: tokens.status.error.main,
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
										<TableCell sx={thSx}>{t('libraryQuality.drilldown.name', 'Name')}</TableCell>
										<TableCell sx={thSx}>{t('libraryQuality.drilldown.email', 'Email')}</TableCell>
										<TableCell sx={thSx}>{t('libraryQuality.duplicates.added', 'Added')}</TableCell>
										<TableCell sx={{ ...thSx, width: 36 }} />
									</TableRow>
								</TableHead>
								<TableBody>
									{group.cvs.map((cv) => (
										<TableRow key={cv.cvId} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
											<TableCell sx={{ fontSize: tokens.fontSize.small, fontWeight: 500, color: tokens.ink.strong, py: 0.9 }}>
												{cv.name || '—'}
											</TableCell>
											<TableCell sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.muted, py: 0.9 }}>
												{cv.email || '—'}
											</TableCell>
											<TableCell sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.subtle, whiteSpace: 'nowrap', py: 0.9 }}>
												{cv.createdAt ? new Date(cv.createdAt).toLocaleDateString() : '—'}
											</TableCell>
											<TableCell sx={{ py: 0.9 }}>
												<Tooltip title={t('libraryQuality.duplicates.delete', 'Delete resume')}>
													<IconButton
														size="small"
														onClick={() => setCvToDelete(cv.cvId)}
														sx={{ color: tokens.ink.subtle, '&:hover': { color: tokens.status.error.bright } }}
													>
														<DeleteOutlineIcon sx={{ fontSize: tokens.iconSize.md }} />
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

			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
				<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle }}>
					{t('libraryQuality.duplicates.groupCount', '{{count}} duplicate groups', { count: totalElements })}
				</Typography>
				{totalPages > 1 && (
					<Pagination
						count={totalPages}
						page={page + 1}
						onChange={handlePageChange}
						size="small"
						siblingCount={0}
						boundaryCount={1}
						sx={{ '& .MuiPaginationItem-root': { fontSize: tokens.fontSize.caption, minWidth: 24, height: 24 } }}
					/>
				)}
			</Box>

			{/* Delete confirmation */}
			<ConfirmDialog
				open={Boolean(cvToDelete)}
				title={t('appCVContent.deleteCVTitle')}
				cancelLabel={t('appCVContent.cancel')}
				confirmLabel={t('appCVContent.confirm')}
				onCancel={() => setCvToDelete(null)}
				onConfirm={handleDeleteConfirm}
				tone="danger"
			>
				{t('appCVContent.deleteConfirmation')}
			</ConfirmDialog>
		</Box>
	);
};

QualityDuplicatesList.propTypes = {
	onChanged: PropTypes.func,
};

export default QualityDuplicatesList;
