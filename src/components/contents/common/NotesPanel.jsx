// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useState } from 'react';
import dayjs from '../../../shared/lib/dayjs.js';
import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { addNote, editNote, getNotes, removeNote } from '../../../services/noteService.js';
import { USER_EMAIL } from '../../../constants.js';
import { isActionAllowed, openUpgradeDialog } from '../../../utils/demoMode.js';

const THEME_GREEN = '#629C44';
const MAX_LENGTH = 4000;

// Which authority the backend checks for writes on each target type.
const WRITE_ACTION = { CV: 'MODIFY_CV', MATCHING_REPORT: 'MODIFY_REPORT' };

const primaryButtonSx = {
	textTransform: 'none', fontSize: '0.78rem', fontWeight: 600, borderRadius: 1.5, boxShadow: 'none',
	backgroundColor: THEME_GREEN, '&:hover': { backgroundColor: '#528035' },
};
const secondaryButtonSx = { textTransform: 'none', fontSize: '0.78rem', color: '#64748b', borderRadius: 1.5 };
const inputSx = { fontSize: '0.82rem', borderRadius: 1.5, backgroundColor: '#fff' };

const isEdited = (note) =>
	note?.lastUpdatedAt && note?.createdAt && new Date(note.lastUpdatedAt) - new Date(note.createdAt) > 1000;

/**
 * Thread of recruiter notes on a CV or a matching report. Every note in the tenant is visible
 * to everyone; edit/delete only appear on the caller's own notes (the server enforces the
 * same rule). Rendered inside the details panels but hidden from print — notes are internal.
 */
const NotesPanel = ({ targetType, targetId, sx }) => {
	const { t, i18n } = useTranslation();
	const currentEmail = localStorage.getItem(USER_EMAIL) || '';
	const canWrite = isActionAllowed(WRITE_ACTION[targetType]);

	const [notes, setNotes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [draft, setDraft] = useState('');
	const [saving, setSaving] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [editDraft, setEditDraft] = useState('');
	const [pendingDelete, setPendingDelete] = useState(null);
	const [deleting, setDeleting] = useState(false);

	// Switching CVs quickly must never show the previous thread: a stale response is dropped.
	useEffect(() => {
		setNotes([]);
		setDraft('');
		setEditingId(null);
		if (!targetId) return undefined;
		let cancelled = false;
		setLoading(true);
		getNotes(targetType, targetId)
			.then(res => { if (!cancelled) setNotes(Array.isArray(res?.data) ? res.data : []); })
			.catch(() => { if (!cancelled) setNotes([]); })
			.finally(() => { if (!cancelled) setLoading(false); });
		return () => { cancelled = true; };
	}, [targetType, targetId]);

	const handleAdd = useCallback(async () => {
		const text = draft.trim();
		if (!text || text.length > MAX_LENGTH || saving) return;
		setSaving(true);
		try {
			const res = await addNote(targetType, targetId, text);
			if (res?.data) setNotes(prev => [res.data, ...prev]);
			setDraft('');
		} catch (err) {
			console.error('Failed to add note:', err);
		} finally {
			setSaving(false);
		}
	}, [draft, saving, targetType, targetId]);

	const startEdit = useCallback((note) => {
		setEditingId(note.id);
		setEditDraft(note.text ?? '');
	}, []);

	const cancelEdit = useCallback(() => {
		setEditingId(null);
		setEditDraft('');
	}, []);

	const handleSaveEdit = useCallback(async () => {
		const text = editDraft.trim();
		if (!editingId || !text || text.length > MAX_LENGTH || saving) return;
		setSaving(true);
		try {
			const res = await editNote(editingId, text);
			if (res?.data) setNotes(prev => prev.map(n => n.id === editingId ? res.data : n));
			cancelEdit();
		} catch (err) {
			console.error('Failed to edit note:', err);
		} finally {
			setSaving(false);
		}
	}, [editDraft, editingId, saving, cancelEdit]);

	const handleConfirmDelete = useCallback(async () => {
		if (!pendingDelete || deleting) return;
		setDeleting(true);
		try {
			await removeNote(pendingDelete.id);
			setNotes(prev => prev.filter(n => n.id !== pendingDelete.id));
			setPendingDelete(null);
		} catch (err) {
			console.error('Failed to delete note:', err);
		} finally {
			setDeleting(false);
		}
	}, [pendingDelete, deleting]);

	const submitOnCmdEnter = (handler) => (e) => {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			handler();
		}
	};

	const relative = (iso) => (iso ? dayjs(iso).locale(i18n.language?.slice(0, 2) || 'en').fromNow() : '');
	const absolute = (iso) => (iso ? new Date(iso).toLocaleString() : '');

	return (
		<Box
			className="qorva-no-print"
			sx={{
				backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5, mb: 2,
				'@media print': { display: 'none' },
				...sx,
			}}
		>
			{/* Header */}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
				<StickyNote2OutlinedIcon sx={{ fontSize: 16, color: THEME_GREEN }} />
				<Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: THEME_GREEN, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
					{t('notes.title', 'Notes')}
				</Typography>
				{notes.length > 0 && (
					<Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>
						({notes.length})
					</Typography>
				)}
			</Box>

			{/* Composer */}
			{canWrite ? (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: notes.length > 0 || loading ? 2 : 0 }}>
					<TextField
						multiline
						minRows={2}
						maxRows={8}
						size="small"
						placeholder={t('notes.placeholder', 'Add a note for your team…')}
						value={draft}
						onChange={e => setDraft(e.target.value)}
						onKeyDown={submitOnCmdEnter(handleAdd)}
						inputProps={{ maxLength: MAX_LENGTH }}
						InputProps={{ sx: inputSx }}
					/>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Button
							size="small"
							variant="contained"
							onClick={handleAdd}
							disabled={saving || !draft.trim()}
							startIcon={saving && !editingId ? <CircularProgress size={12} color="inherit" /> : null}
							sx={primaryButtonSx}
						>
							{t('notes.add', 'Add note')}
						</Button>
						<Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', ml: 'auto' }}>
							{draft.length}/{MAX_LENGTH}
						</Typography>
					</Box>
				</Box>
			) : (
				<Typography
					onClick={() => openUpgradeDialog('notes')}
					sx={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', cursor: 'pointer', mb: notes.length > 0 ? 2 : 0, '&:hover': { color: THEME_GREEN } }}
				>
					{t('notes.readOnlyHint', 'Upgrade to add notes for your team.')}
				</Typography>
			)}

			{/* Thread */}
			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
					<CircularProgress size={18} sx={{ color: THEME_GREEN }} />
				</Box>
			) : notes.length === 0 ? (
				<Typography sx={{ fontSize: '0.78rem', color: '#cbd5e1', fontStyle: 'italic', mt: canWrite ? 1.5 : 0 }}>
					{t('notes.empty', 'No notes yet.')}
				</Typography>
			) : (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
					{notes.map(note => {
						const own = note.authorEmail && note.authorEmail === currentEmail;
						const editing = editingId === note.id;
						return (
							<Box
								key={note.id}
								sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}
							>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
									<Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
										{own ? t('notes.you', 'You') : (note.authorName || note.authorEmail)}
									</Typography>
									<Tooltip title={absolute(note.createdAt)}>
										<Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>
											{relative(note.createdAt)}
										</Typography>
									</Tooltip>
									{isEdited(note) && (
										<Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontStyle: 'italic' }}>
											· {t('notes.edited', 'edited')}
										</Typography>
									)}
									{own && canWrite && !editing && (
										<Box sx={{ ml: 'auto', display: 'flex', gap: 0.25 }}>
											<Tooltip title={t('notes.edit', 'Edit')}>
												<IconButton size="small" onClick={() => startEdit(note)} sx={{ color: '#94a3b8', '&:hover': { color: THEME_GREEN } }}>
													<EditOutlinedIcon sx={{ fontSize: 14 }} />
												</IconButton>
											</Tooltip>
											<Tooltip title={t('notes.delete', 'Delete')}>
												<IconButton size="small" onClick={() => setPendingDelete(note)} sx={{ color: '#94a3b8', '&:hover': { color: '#dc2626' } }}>
													<DeleteOutlineIcon sx={{ fontSize: 14 }} />
												</IconButton>
											</Tooltip>
										</Box>
									)}
								</Box>

								{editing ? (
									<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
										<TextField
											multiline
											minRows={2}
											maxRows={8}
											size="small"
											autoFocus
											value={editDraft}
											onChange={e => setEditDraft(e.target.value)}
											onKeyDown={submitOnCmdEnter(handleSaveEdit)}
											inputProps={{ maxLength: MAX_LENGTH }}
											InputProps={{ sx: inputSx }}
										/>
										<Box sx={{ display: 'flex', gap: 1 }}>
											<Button
												size="small"
												variant="contained"
												onClick={handleSaveEdit}
												disabled={saving || !editDraft.trim()}
												startIcon={saving ? <CircularProgress size={12} color="inherit" /> : null}
												sx={primaryButtonSx}
											>
												{t('notes.save', 'Save')}
											</Button>
											<Button size="small" onClick={cancelEdit} sx={secondaryButtonSx}>
												{t('notes.cancel', 'Cancel')}
											</Button>
										</Box>
									</Box>
								) : (
									<Typography sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
										{note.text}
									</Typography>
								)}
							</Box>
						);
					})}
				</Box>
			)}

			{/* Delete confirmation */}
			<Dialog open={Boolean(pendingDelete)} onClose={() => !deleting && setPendingDelete(null)} maxWidth="xs" fullWidth>
				<DialogTitle sx={{ fontSize: '1rem', fontWeight: 700 }}>
					{t('notes.confirmDeleteTitle', 'Delete this note?')}
				</DialogTitle>
				<DialogContent>
					<Typography sx={{ fontSize: '0.85rem', color: '#475569' }}>
						{t('notes.confirmDelete', 'This note will be removed for everyone on your team.')}
					</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button size="small" onClick={() => setPendingDelete(null)} disabled={deleting} sx={secondaryButtonSx}>
						{t('notes.cancel', 'Cancel')}
					</Button>
					<Button
						size="small"
						variant="contained"
						onClick={handleConfirmDelete}
						disabled={deleting}
						startIcon={deleting ? <CircularProgress size={12} color="inherit" /> : null}
						sx={{ ...primaryButtonSx, backgroundColor: '#dc2626', '&:hover': { backgroundColor: '#b91c1c' } }}
					>
						{t('notes.delete', 'Delete')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

NotesPanel.propTypes = {
	targetType: PropTypes.oneOf(['CV', 'MATCHING_REPORT']).isRequired,
	targetId: PropTypes.string,
	sx: PropTypes.object,
};

export default NotesPanel;
