// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useState } from 'react';
import {
	Box,
	Button,
	Checkbox,
	CircularProgress,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { getQualityIssues, performQualityAction, notifyQualityChanged } from '../../../services/libraryQualityService.js';
import { getCVById, updateCV } from '../../../services/cvService.js';

const PAGE_SIZE = 10;
const CONFIRM_CURRENT_CAP = 50;

// Which issues allow inline quick-edit, and of which contact field(s).
const EDITABLE_FIELDS = {
	MISSING_PHONE: ['phone'],
	MISSING_EMAIL: ['email'],
	MISSING_CONTACT: ['email', 'phone'],
};

// Freshness issues support selection-based verification.
const SELECTABLE_ISSUES = new Set(['OUTDATED', 'UNKNOWN_FRESHNESS']);

const cellSx = { fontSize: '0.76rem', color: '#334155', py: 0.9 };
const headSx = { fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', py: 1 };

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

/**
 * Paged list of the CVs affected by one quality issue. Depending on the issue it offers
 * inline quick-edit (missing contact fields) or selection + "Confirm current" (freshness).
 */
const QualityIssueList = ({ issueKey, onChanged }) => {
	const { t } = useTranslation();
	const [page, setPage] = useState(null);
	const [pageNumber, setPageNumber] = useState(0);
	const [loading, setLoading] = useState(true);
	const [selected, setSelected] = useState(new Set());
	const [editing, setEditing] = useState(null);        // { cvId, field, value }
	const [saving, setSaving] = useState(false);

	const editableFields = EDITABLE_FIELDS[issueKey] ?? [];
	const selectable = SELECTABLE_ISSUES.has(issueKey);

	const fetchPage = useCallback(async (number) => {
		setLoading(true);
		try {
			const res = await getQualityIssues(issueKey, number, PAGE_SIZE);
			setPage(res.data?.data ?? res.data);
		} catch {
			setPage(null);
		} finally {
			setLoading(false);
		}
	}, [issueKey]);

	useEffect(() => {
		fetchPage(pageNumber);
	}, [fetchPage, pageNumber]);

	const refreshAll = async () => {
		setSelected(new Set());
		await fetchPage(pageNumber);
		notifyQualityChanged();
		onChanged?.();
	};

	const toggleSelected = (cvId) => {
		setSelected(prev => {
			const next = new Set(prev);
			if (next.has(cvId)) next.delete(cvId);
			else if (next.size < CONFIRM_CURRENT_CAP) next.add(cvId);
			return next;
		});
	};

	const handleConfirmCurrent = async () => {
		if (selected.size === 0) return;
		try {
			await performQualityAction('CONFIRM_CURRENT', { cvIds: [...selected] });
			await refreshAll();
		} catch (error) {
			console.error('Error confirming resumes as current:', error);
		}
	};

	const handleSaveEdit = async () => {
		if (!editing || !editing.value.trim()) return;
		setSaving(true);
		try {
			// Fetch the full CV and mutate only the target field — partial nested
			// payloads risk the server-side merge nulling sibling contact fields.
			const res = await getCVById(editing.cvId);
			const cv = res.data?.data ?? res.data;
			cv.personalInformation = cv.personalInformation ?? {};
			cv.personalInformation.contact = cv.personalInformation.contact ?? {};
			cv.personalInformation.contact[editing.field] = editing.value.trim();
			await updateCV(editing.cvId, cv);
			setEditing(null);
			await refreshAll();
		} catch (error) {
			console.error('Error saving contact field:', error);
		} finally {
			setSaving(false);
		}
	};

	if (loading && !page) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
				<CircularProgress size={20} />
			</Box>
		);
	}

	const content = page?.content ?? [];
	if (content.length === 0) {
		return (
			<Typography sx={{ fontSize: '0.76rem', color: '#94a3b8', py: 1.5, textAlign: 'center' }}>
				{t('libraryQuality.drilldown.empty', 'No resumes found for this issue.')}
			</Typography>
		);
	}

	const renderContactCell = (cv, field) => {
		const value = cv[field];
		const isEditable = editableFields.includes(field) && !value;
		const isEditing = editing?.cvId === cv.id && editing?.field === field;

		if (isEditing) {
			return (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
					<TextField
						size="small"
						autoFocus
						value={editing.value}
						onChange={(e) => setEditing(prev => ({ ...prev, value: e.target.value }))}
						onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setEditing(null); }}
						sx={{ '& .MuiInputBase-input': { fontSize: '0.76rem', py: 0.4, px: 0.75 } }}
					/>
					<IconButton size="small" disabled={saving} onClick={handleSaveEdit} sx={{ color: '#629C44' }}>
						{saving ? <CircularProgress size={14} /> : <CheckRoundedIcon sx={{ fontSize: 16 }} />}
					</IconButton>
				</Box>
			);
		}
		if (isEditable) {
			return (
				<Button
					size="small"
					startIcon={<EditOutlinedIcon sx={{ fontSize: 13 }} />}
					onClick={() => setEditing({ cvId: cv.id, field, value: '' })}
					sx={{ textTransform: 'none', fontSize: '0.7rem', fontWeight: 600, color: '#629C44', px: 0.75, minWidth: 0 }}
				>
					{t('libraryQuality.drilldown.add', 'Add')}
				</Button>
			);
		}
		return value || '—';
	};

	return (
		<Box>
			{selectable && (
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, mb: 0.5 }}>
					<Typography sx={{ fontSize: '0.68rem', color: '#94a3b8' }}>
						{t('libraryQuality.drilldown.confirmHint', 'Select resumes you verified as still accurate (max {{max}})', { max: CONFIRM_CURRENT_CAP })}
					</Typography>
					<Button
						size="small"
						disabled={selected.size === 0}
						onClick={handleConfirmCurrent}
						sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 600, color: '#629C44' }}
					>
						{t('libraryQuality.drilldown.confirmCurrent', 'Confirm current ({{count}})', { count: selected.size })}
					</Button>
				</Box>
			)}
			<TableContainer>
				<Table size="small">
					<TableHead>
						<TableRow>
							{selectable && <TableCell sx={{ ...headSx, width: 34 }} />}
							<TableCell sx={headSx}>{t('libraryQuality.drilldown.name', 'Name')}</TableCell>
							<TableCell sx={headSx}>{t('libraryQuality.drilldown.role', 'Role')}</TableCell>
							<TableCell sx={headSx}>{t('libraryQuality.drilldown.email', 'Email')}</TableCell>
							<TableCell sx={headSx}>{t('libraryQuality.drilldown.phone', 'Phone')}</TableCell>
							<TableCell sx={headSx}>{t('libraryQuality.drilldown.contentDate', 'Content Date')}</TableCell>
							<TableCell sx={headSx}>{t('libraryQuality.drilldown.lastUpdated', 'Last Updated')}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{content.map((cv) => (
							<TableRow key={cv.id} hover>
								{selectable && (
									<TableCell sx={{ py: 0.5 }}>
										<Checkbox
											size="small"
											checked={selected.has(cv.id)}
											onChange={() => toggleSelected(cv.id)}
											sx={{ p: 0.25, '&.Mui-checked': { color: '#629C44' } }}
										/>
									</TableCell>
								)}
								<TableCell sx={{ ...cellSx, fontWeight: 600 }}>{cv.name || '—'}</TableCell>
								<TableCell sx={cellSx}>{cv.role || '—'}</TableCell>
								<TableCell sx={cellSx}>{renderContactCell(cv, 'email')}</TableCell>
								<TableCell sx={cellSx}>{renderContactCell(cv, 'phone')}</TableCell>
								<TableCell sx={cellSx}>{formatDate(cv.contentDate)}</TableCell>
								<TableCell sx={cellSx}>{formatDate(cv.lastUpdatedAt)}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{(page?.totalPages ?? 0) > 1 && (
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, mt: 0.5 }}>
					<Typography sx={{ fontSize: '0.68rem', color: '#94a3b8' }}>
						{pageNumber + 1} / {page.totalPages}
					</Typography>
					<IconButton size="small" disabled={pageNumber === 0} onClick={() => setPageNumber(p => p - 1)}>
						<ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
					</IconButton>
					<IconButton size="small" disabled={!page.hasNext} onClick={() => setPageNumber(p => p + 1)}>
						<ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
					</IconButton>
				</Box>
			)}
		</Box>
	);
};

QualityIssueList.propTypes = {
	issueKey: PropTypes.string.isRequired,
	onChanged: PropTypes.func,
};

export default QualityIssueList;
