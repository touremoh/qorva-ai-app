// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
	Box,
	Button,
	CircularProgress,
	Divider,
	IconButton,
	Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
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
} from '../api/emailTemplateService.js';
import TemplateEditor from './TemplateEditor.jsx';
import TemplateList from './TemplateList.jsx';
import * as tokens from '../../../theme/tokens.js';

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
				<TemplateList
					atPlanLimit={atPlanLimit}
					selectTemplate={selectTemplate}
					selectedId={selectedId}
					templateLimit={templateLimit}
					templates={templates}
				/>

				{/* Editor */}
				<TemplateEditor
					bodyRef={bodyRef}
					error={error}
					form={form}
					insertPlaceholder={insertPlaceholder}
					notice={notice}
					preview={preview}
					setForm={setForm}
				/>
			</Box>

			<Divider sx={{ mt: 2 }} />
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 1.5 }}>
				{selectedId && (
					<>
						<Tooltip title={t('emailTemplates.deleteHint', 'Delete this template')}>
							<span>
								<IconButton size="small" onClick={handleDelete} disabled={busy} sx={{ color: tokens.ink.subtle }}>
									<DeleteOutlineRoundedIcon sx={{ fontSize: tokens.iconSize.lg }} />
								</IconButton>
							</span>
						</Tooltip>
						<Button
							size="small" onClick={handleSendTest} disabled={busy}
							startIcon={<ForwardToInboxOutlinedIcon sx={{ fontSize: tokens.iconSize.sm }} />}
							sx={{ textTransform: 'none', fontSize: tokens.fontSize.small, fontWeight: 600, color: tokens.ink.muted }}>
							{t('emailTemplates.sendTest', 'Send test to me')}
						</Button>
					</>
				)}
				<Box sx={{ flex: 1 }} />
				<Button
					size="small" onClick={handlePreview} disabled={busy || !form.subject.trim() || !form.bodyText.trim()}
					startIcon={<VisibilityOutlinedIcon sx={{ fontSize: tokens.iconSize.sm }} />}
					sx={{ textTransform: 'none', fontSize: tokens.fontSize.small, fontWeight: 600, color: tokens.ink.muted }}>
					{t('emailTemplates.preview', 'Preview')}
				</Button>
				<Button onClick={handleSave} disabled={busy || !formValid} variant="contained"
					sx={{ textTransform: 'none', borderRadius: 1.5, boxShadow: 'none', backgroundColor: tokens.brand.main, '&:hover': { backgroundColor: tokens.brand.hover } }}>
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
