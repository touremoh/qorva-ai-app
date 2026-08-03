// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Divider,
	IconButton,
	List,
	ListItemButton,
	ListItemText,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ForwardToInboxOutlinedIcon from '@mui/icons-material/ForwardToInboxOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
	getEmailTemplates,
	createEmailTemplate,
	updateEmailTemplate,
	deleteEmailTemplate,
	previewEmailTemplate,
	sendTestEmailTemplate,
} from '../../../services/emailTemplateService.js';

const PLACEHOLDERS = ['candidate_name', 'company_name'];
const EMPTY_FORM = { name: '', subject: '', bodyText: '' };

/**
 * List + editor for recruiter-authored candidate-update invitation templates.
 * Shared by the dedicated menu page and the campaign dialog's "Manage…" shortcut.
 * The recruiter edits plain text with placeholders; the greeting, action button and
 * unsubscribe footer stay application-owned (preview shows the full email as sent).
 */
const EmailTemplatesManager = ({ language, onChanged }) => {
	const { t } = useTranslation();
	const [templates, setTemplates] = useState([]);
	const [templateLimit, setTemplateLimit] = useState(null); // plan cap; null = unlimited
	const [selectedId, setSelectedId] = useState(null); // null = new template
	const [form, setForm] = useState(EMPTY_FORM);
	const [preview, setPreview] = useState(null);       // { subject, html }
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState('');
	const [notice, setNotice] = useState('');
	const bodyRef = useRef(null);

	const loadTemplates = async () => {
		try {
			const res = await getEmailTemplates();
			const data = res.data?.data ?? res.data;
			setTemplates(data?.templates ?? []);
			setTemplateLimit(Number.isFinite(data?.limit) ? data.limit : null);
		} catch {
			setError(t('emailTemplates.loadError', 'Could not load templates.'));
		}
	};

	useEffect(() => {
		loadTemplates();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const selectTemplate = (template) => {
		setSelectedId(template?.id ?? null);
		setForm(template
			? { name: template.name, subject: template.subject, bodyText: template.bodyText }
			: EMPTY_FORM);
		setPreview(null);
		setError('');
		setNotice('');
	};

	const insertPlaceholder = (token) => {
		const tag = `{{${token}}}`;
		const el = bodyRef.current;
		if (el && typeof el.selectionStart === 'number') {
			const start = el.selectionStart;
			const end = el.selectionEnd;
			const next = form.bodyText.slice(0, start) + tag + form.bodyText.slice(end);
			setForm((f) => ({ ...f, bodyText: next }));
		} else {
			setForm((f) => ({ ...f, bodyText: f.bodyText + tag }));
		}
	};

	const apiError = (e, fallback) =>
		e?.response?.data?.message ?? e?.response?.data?.error ?? fallback;

	const handleSave = async () => {
		setBusy(true);
		setError('');
		setNotice('');
		try {
			if (selectedId) {
				await updateEmailTemplate(selectedId, form);
			} else {
				const res = await createEmailTemplate(form);
				const created = res.data?.data ?? res.data;
				if (created?.id) setSelectedId(created.id);
			}
			await loadTemplates();
			onChanged?.();
			setNotice(t('emailTemplates.saved', 'Template saved.'));
		} catch (e) {
			setError(apiError(e, t('emailTemplates.saveError', 'Could not save the template.')));
		} finally {
			setBusy(false);
		}
	};

	const handleDelete = async () => {
		if (!selectedId) return;
		setBusy(true);
		setError('');
		try {
			await deleteEmailTemplate(selectedId);
			selectTemplate(null);
			await loadTemplates();
			onChanged?.();
		} catch (e) {
			setError(apiError(e, t('emailTemplates.deleteError', 'Could not delete the template.')));
		} finally {
			setBusy(false);
		}
	};

	const handlePreview = async () => {
		setBusy(true);
		setError('');
		try {
			const res = await previewEmailTemplate({ subject: form.subject, bodyText: form.bodyText, language });
			setPreview(res.data?.data ?? res.data);
		} catch (e) {
			setError(apiError(e, t('emailTemplates.previewError', 'Could not render the preview.')));
		} finally {
			setBusy(false);
		}
	};

	const handleSendTest = async () => {
		if (!selectedId) return;
		setBusy(true);
		setError('');
		setNotice('');
		try {
			await sendTestEmailTemplate(selectedId, language);
			setNotice(t('emailTemplates.testSent', 'Test email sent to your address.'));
		} catch (e) {
			setError(apiError(e, t('emailTemplates.testError', 'Could not send the test email.')));
		} finally {
			setBusy(false);
		}
	};

	const formValid = form.name.trim() && form.subject.trim() && form.bodyText.trim();
	const atPlanLimit = templateLimit !== null && templates.length >= templateLimit;

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
			<Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0 }}>
				{/* Template list */}
				<Box sx={{ width: 220, flexShrink: 0, borderRight: '1px solid #f1f5f9', pr: 1.5, overflowY: 'auto' }}>
					<Tooltip title={atPlanLimit
						? t('emailTemplates.limitReached', 'Plan limit reached — delete a template or upgrade to create more.')
						: ''}>
						<span>
							<Button
								fullWidth size="small" startIcon={<AddRoundedIcon sx={{ fontSize: 15 }} />}
								disabled={atPlanLimit}
								onClick={() => selectTemplate(null)}
								sx={{ justifyContent: 'flex-start', textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: '#629C44', mb: 0.5 }}>
								{t('emailTemplates.new', 'New template')}
							</Button>
						</span>
					</Tooltip>
					{templateLimit !== null && (
						<Typography sx={{ fontSize: '0.66rem', color: atPlanLimit ? '#dc2626' : '#94a3b8', px: 1, mb: 0.5 }}>
							{t('emailTemplates.limitNote', '{{count}} of {{limit}} templates used', { count: templates.length, limit: templateLimit })}
						</Typography>
					)}
					<List dense disablePadding>
						{templates.map((template) => (
							<ListItemButton
								key={template.id}
								selected={template.id === selectedId}
								onClick={() => selectTemplate(template)}
								sx={{ borderRadius: 1.5, '&.Mui-selected': { backgroundColor: 'rgba(98,156,68,0.10)' } }}>
								<ListItemText
									primary={template.name}
									primaryTypographyProps={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', noWrap: true }}
								/>
							</ListItemButton>
						))}
						{templates.length === 0 && (
							<Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', px: 1, py: 0.5 }}>
								{t('emailTemplates.none', 'No templates yet — campaigns use the standard Qorva message.')}
							</Typography>
						)}
					</List>
				</Box>

				{/* Editor */}
				<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 0, pt: 0.5, overflowY: 'auto' }}>
					{error && <Alert severity="error" sx={{ py: 0 }}>{error}</Alert>}
					{notice && <Alert severity="success" sx={{ py: 0 }}>{notice}</Alert>}
					<TextField
						label={t('emailTemplates.name', 'Template name')}
						value={form.name}
						onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
						size="small" fullWidth inputProps={{ maxLength: 80 }}
					/>
					<TextField
						label={t('emailTemplates.subject', 'Subject')}
						value={form.subject}
						onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
						size="small" fullWidth inputProps={{ maxLength: 150 }}
					/>
					<TextField
						label={t('emailTemplates.body', 'Message')}
						value={form.bodyText}
						onChange={(e) => setForm((f) => ({ ...f, bodyText: e.target.value }))}
						inputRef={bodyRef}
						multiline minRows={6} size="small" fullWidth inputProps={{ maxLength: 4000 }}
						helperText={t('emailTemplates.bodyHint', 'Plain text. Blank lines start a new paragraph. The greeting, action button, your signature (name and company), and unsubscribe link are added automatically.')}
					/>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
						<Typography sx={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
							{t('emailTemplates.placeholders', 'Insert:')}
						</Typography>
						{PLACEHOLDERS.map((token) => (
							<Chip
								key={token} label={`{{${token}}}`} size="small" onClick={() => insertPlaceholder(token)}
								sx={{ fontSize: '0.66rem', fontFamily: 'monospace', height: 22, cursor: 'pointer' }}
							/>
						))}
					</Box>

					{preview && (
						<Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
							<Box sx={{ px: 1.5, py: 0.75, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
								<Typography sx={{ fontSize: '0.72rem', color: '#334155', fontWeight: 700 }}>
									{preview.subject}
								</Typography>
							</Box>
							{/* Server-rendered from escaped plain text — safe to inject. */}
							<Box sx={{ p: 1.5, maxHeight: 260, overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: preview.html }} />
						</Box>
					)}
				</Box>
			</Box>

			<Divider sx={{ mt: 2 }} />
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 1.5 }}>
				{selectedId && (
					<>
						<Tooltip title={t('emailTemplates.deleteHint', 'Delete this template')}>
							<span>
								<IconButton size="small" onClick={handleDelete} disabled={busy} sx={{ color: '#94a3b8' }}>
									<DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
								</IconButton>
							</span>
						</Tooltip>
						<Button
							size="small" onClick={handleSendTest} disabled={busy}
							startIcon={<ForwardToInboxOutlinedIcon sx={{ fontSize: 15 }} />}
							sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
							{t('emailTemplates.sendTest', 'Send test to me')}
						</Button>
					</>
				)}
				<Box sx={{ flex: 1 }} />
				<Button
					size="small" onClick={handlePreview} disabled={busy || !form.subject.trim() || !form.bodyText.trim()}
					startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 15 }} />}
					sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
					{t('emailTemplates.preview', 'Preview')}
				</Button>
				<Button onClick={handleSave} disabled={busy || !formValid} variant="contained"
					sx={{ textTransform: 'none', borderRadius: 1.5, boxShadow: 'none', backgroundColor: '#629C44', '&:hover': { backgroundColor: '#528035' } }}>
					{busy ? <CircularProgress size={16} color="inherit" /> : t('emailTemplates.save', 'Save')}
				</Button>
			</Box>
		</Box>
	);
};

EmailTemplatesManager.propTypes = {
	language: PropTypes.string,
	onChanged: PropTypes.func,
};

export default EmailTemplatesManager;
