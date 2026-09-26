// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from '../../shared/lib/dayjs.js';
import {
	Alert,
	Box,
	Button,
	ButtonGroup,
	Chip,
	CircularProgress,
	Collapse,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Link,
	Menu,
	MenuItem,
	Paper,
	Select,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { useCandidateOutreach } from '../../contexts/CandidateOutreachContext.jsx';
import { draftOutreach, recordExternalOutreach, sendOutreach } from '../../services/candidateOutreachService.js';
import {
	HANDOFF,
	buildHandoffUrl,
	isMailtoTooLong,
	lastHandoffChoice,
	openExternal,
	rememberHandoffChoice,
} from '../../utils/mailLinks.js';
import { USER_EMAIL } from '../../constants.js';

const THEME_GREEN = '#629C44';
const DOCK_WIDTH = 520;
const LANGUAGES = ['en', 'fr', 'de', 'es', 'it', 'nl', 'pt'];
const INTENTS = ['INTRO', 'INTERVIEW', 'FOLLOW_UP', 'KEEP_WARM', 'CUSTOM'];
const TONES = ['', 'formal', 'friendly', 'short'];
const SUBJECT_MAX = 200;
const BODY_MAX = 8000;
const SHORTER_CONTEXT_CHARS = 700;

const primaryButtonSx = {
	textTransform: 'none', fontSize: '0.78rem', fontWeight: 600, borderRadius: 1.5, boxShadow: 'none',
	backgroundColor: THEME_GREEN, '&:hover': { backgroundColor: '#528035' },
};
const outlinedButtonSx = {
	textTransform: 'none', fontSize: '0.78rem', fontWeight: 600, borderRadius: 1.5,
	color: '#334155', borderColor: '#e2e8f0', '&:hover': { borderColor: '#cbd5e1', backgroundColor: '#f8fafc' },
};
const inputSx = { fontSize: '0.82rem', borderRadius: 1.5, backgroundColor: '#fff' };

const errorCodeOf = (err) => err?.response?.data?.errorCode;

/**
 * Gmail-style composer docked bottom-right. Mounted once in AppHome; opened by the entry points on
 * the CV list, CV details and matching report through useCandidateOutreach().openComposer(). The
 * primary action depends on the recruiter's mailbox: connected Microsoft 365 → Send from Qorva
 * (as them, into their Sent folder); otherwise a hand-off to their own client. Hidden from print.
 */
const CandidateOutreachDock = () => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const {
		target, isOpen, minimized, context, contextLoading, contextError,
		close, minimize, restore, prependHistory, patchContext,
	} = useCandidateOutreach();

	const [to, setTo] = useState('');
	const [subject, setSubject] = useState('');
	const [body, setBody] = useState('');
	const [intent, setIntent] = useState('INTRO');
	const [tone, setTone] = useState('');
	const [language, setLanguage] = useState('en');
	const [instructions, setInstructions] = useState('');
	const [drafting, setDrafting] = useState(false);
	const [sending, setSending] = useState(false);
	const [historyOpen, setHistoryOpen] = useState(false);
	const [discardOpen, setDiscardOpen] = useState(false);
	const [handoffAnchor, setHandoffAnchor] = useState(null);
	const [handoffChoice, setHandoffChoice] = useState(() => lastHandoffChoice() ?? HANDOFF.GMAIL);
	const [mailtoWarning, setMailtoWarning] = useState(false);
	const lastCvIdRef = useRef(null);

	const uiLanguage = (i18n.language || 'en').slice(0, 2);
	const locale = LANGUAGES.includes(uiLanguage) ? uiLanguage : 'en';

	// A new target resets the message; the same target re-opened keeps what was typed.
	useEffect(() => {
		if (!target) return;
		if (lastCvIdRef.current !== target.cvId) {
			lastCvIdRef.current = target.cvId;
			setSubject('');
			setBody('');
			setInstructions('');
			setIntent(target.matchingReportId ? 'INTERVIEW' : 'INTRO');
			setLanguage(locale);
			setHistoryOpen(false);
			setMailtoWarning(false);
		}
	}, [target, locale]);

	useEffect(() => {
		if (!isOpen) lastCvIdRef.current = null;
	}, [isOpen]);

	useEffect(() => {
		if (context && context.email !== undefined) setTo(context.email ?? '');
	}, [context]);

	const suppressed = Boolean(context?.suppressed);
	const noEmail = Boolean(context) && !context.email;
	const mailbox = context?.mailbox ?? 'NONE';
	const canSendFromQorva = mailbox === 'MICROSOFT';
	const dirty = subject.trim().length > 0 || body.trim().length > 0;
	const message = useMemo(() => ({ to, subject, body }), [to, subject, body]);
	const hasRecipient = /\S+@\S+\.\S+/.test(to);
	const readyToSend = hasRecipient && subject.trim() && body.trim() && !suppressed;

	const handleClose = useCallback(() => {
		if (dirty) setDiscardOpen(true);
		else close();
	}, [dirty, close]);

	const applyErrorToContext = useCallback((err) => {
		const code = errorCodeOf(err);
		if (code === 'error.mailbox.reauth_required') patchContext({ mailbox: 'REAUTH_REQUIRED' });
		if (code === 'error.outreach.suppressed') patchContext({ suppressed: true });
	}, [patchContext]);

	const runDraft = useCallback(async (extraInstructions) => {
		if (!target) return;
		setDrafting(true);
		try {
			const res = await draftOutreach({
				cvId: target.cvId,
				jobPostId: target.jobPostId,
				matchingReportId: target.matchingReportId,
				intent,
				tone: tone || undefined,
				language,
				instructions: [instructions.trim(), extraInstructions].filter(Boolean).join('\n').slice(0, 1000) || undefined,
			});
			setSubject((res.data?.subject ?? '').slice(0, SUBJECT_MAX));
			setBody((res.data?.body ?? '').slice(0, BODY_MAX));
		} catch {
			// The global interceptor already toasts; the fields stay as they were.
		} finally {
			setDrafting(false);
		}
	}, [target, intent, tone, language, instructions]);

	const handleShorter = () => runDraft(
		`Make it noticeably shorter (about half the length), same intent and language, keep the best sentences of this draft:\n${body.slice(0, SHORTER_CONTEXT_CHARS)}`);

	const handleSend = async () => {
		if (!target || !readyToSend) return;
		setSending(true);
		try {
			const res = await sendOutreach({
				cvId: target.cvId,
				jobPostId: target.jobPostId,
				matchingReportId: target.matchingReportId,
				to: to.trim(),
				subject: subject.trim(),
				body: body.trim(),
			});
			if (res.data?.entry) prependHistory(res.data.entry);
			toast.success(t('candidateOutreach.sent', { to: to.trim() }));
			setSubject('');
			setBody('');
			setHistoryOpen(true);
		} catch (err) {
			applyErrorToContext(err);
		} finally {
			setSending(false);
		}
	};

	const handleHandoff = async (via) => {
		if (!target || suppressed || !hasRecipient) return;
		setHandoffAnchor(null);
		if (via === HANDOFF.MAILTO && isMailtoTooLong(message)) {
			setMailtoWarning(true);
			return;
		}
		setMailtoWarning(false);
		setHandoffChoice(via);
		rememberHandoffChoice(via);
		openExternal(buildHandoffUrl(via, {
			...message,
			authuser: via === HANDOFF.GMAIL ? localStorage.getItem(USER_EMAIL) : undefined,
		}));
		try {
			const res = await recordExternalOutreach({
				cvId: target.cvId,
				jobPostId: target.jobPostId,
				matchingReportId: target.matchingReportId,
				via,
				to: to.trim(),
				subject: subject.trim() || undefined,
				body: body.trim() || undefined,
			});
			if (res.data) prependHistory(res.data);
			setHistoryOpen(true);
		} catch (err) {
			applyErrorToContext(err);
		}
	};

	const copyBody = async () => {
		try {
			await navigator.clipboard.writeText(`${subject}\n\n${body}`);
			toast.success(t('candidateOutreach.copied'));
		} catch {
			toast.error(t('candidateOutreach.copyFailed'));
		}
	};

	const goToSettings = () => navigate('/app/settings');

	if (!isOpen) return null;

	const title = context?.candidateName || target?.candidateName || t('candidateOutreach.title');
	const lastContact = context?.history?.[0];

	return (
		<>
			<Paper
				elevation={0}
				role="dialog"
				aria-label={t('candidateOutreach.title')}
				sx={{
					position: 'fixed', right: 24, bottom: 0,
					width: { xs: 'calc(100vw - 32px)', sm: DOCK_WIDTH },
					maxHeight: minimized ? 48 : 'calc(100vh - 88px)',
					display: 'flex', flexDirection: 'column',
					borderRadius: '12px 12px 0 0',
					border: '1px solid #e2e8f0', borderBottom: 'none',
					boxShadow: '0 -4px 24px rgba(15, 23, 42, 0.12)',
					backgroundColor: '#fff', overflow: 'hidden',
					zIndex: (theme) => theme.zIndex.modal - 1,
					transition: 'max-height 0.2s ease',
					'@media print': { display: 'none' },
				}}
			>
				{/* Title bar */}
				<Box
					onClick={minimized ? restore : undefined}
					sx={{
						display: 'flex', alignItems: 'center', gap: 1, px: 1.5, height: 48, flexShrink: 0,
						backgroundColor: '#0f172a', color: '#fff', cursor: minimized ? 'pointer' : 'default',
					}}
				>
					<MailOutlineIcon sx={{ fontSize: 18, color: '#a5d68a' }} />
					<Typography sx={{ fontSize: '0.85rem', fontWeight: 600, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
						{title}
					</Typography>
					<Tooltip title={minimized ? t('candidateOutreach.restore') : t('candidateOutreach.minimize')}>
						<IconButton size="small" onClick={(e) => { e.stopPropagation(); minimized ? restore() : minimize(); }} sx={{ color: '#cbd5e1' }}>
							{minimized ? <OpenInFullIcon sx={{ fontSize: 15 }} /> : <RemoveIcon sx={{ fontSize: 18 }} />}
						</IconButton>
					</Tooltip>
					<Tooltip title={t('candidateOutreach.close')}>
						<IconButton size="small" onClick={(e) => { e.stopPropagation(); handleClose(); }} sx={{ color: '#cbd5e1' }}>
							<CloseIcon sx={{ fontSize: 18 }} />
						</IconButton>
					</Tooltip>
				</Box>

				{!minimized && (
					<Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' }}>
						{/* Context strip */}
						{(target?.jobTitle || lastContact) && (
							<Box sx={{ px: 2, py: 1, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
								{target?.jobTitle && (
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
										<WorkOutlineOutlinedIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
										<Typography sx={{ fontSize: '0.75rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
											{target.jobTitle}{target.score != null ? ` · ${Math.round(target.score)}%` : ''}
										</Typography>
									</Box>
								)}
								{lastContact && (
									<Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
										{t('candidateOutreach.lastContacted', {
											when: dayjs(lastContact.createdAt).locale(locale).fromNow(),
											who: lastContact.senderEmail === (localStorage.getItem(USER_EMAIL) || '') ? t('candidateOutreach.you') : (lastContact.senderName || lastContact.senderEmail),
										})}
									</Typography>
								)}
							</Box>
						)}

						<Box sx={{ px: 2, pt: 1.5, pb: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
							{contextLoading && (
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#94a3b8' }}>
									<CircularProgress size={14} sx={{ color: THEME_GREEN }} />
									<Typography sx={{ fontSize: '0.78rem' }}>{t('candidateOutreach.loading')}</Typography>
								</Box>
							)}
							{contextError && (
								<Alert severity="error" sx={{ fontSize: '0.78rem', borderRadius: 1.5 }}>{t('candidateOutreach.contextError')}</Alert>
							)}
							{suppressed && (
								<Alert severity="error" sx={{ fontSize: '0.78rem', borderRadius: 1.5 }}>{t('candidateOutreach.suppressed')}</Alert>
							)}
							{!suppressed && noEmail && (
								<Alert severity="warning" sx={{ fontSize: '0.78rem', borderRadius: 1.5 }}>{t('candidateOutreach.noEmail')}</Alert>
							)}
							{mailbox === 'REAUTH_REQUIRED' && (
								<Alert
									severity="warning"
									sx={{ fontSize: '0.78rem', borderRadius: 1.5 }}
									action={<Button size="small" onClick={goToSettings} sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}>{t('candidateOutreach.reconnect')}</Button>}
								>
									{t('candidateOutreach.reauthRequired')}
								</Alert>
							)}

							{/* AI draft bar */}
							<Box sx={{ border: '1px dashed #cbd5e1', borderRadius: 2, p: 1.25, backgroundColor: '#fbfdf9' }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
									<AutoAwesomeIcon sx={{ fontSize: 15, color: THEME_GREEN }} />
									<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>{t('candidateOutreach.ai.title')}</Typography>
								</Box>
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
									{INTENTS.map(key => (
										<Chip
											key={key}
											size="small"
											label={t(`candidateOutreach.ai.intent.${key}`)}
											onClick={() => setIntent(key)}
											disabled={suppressed}
											sx={{
												fontSize: '0.72rem', height: 26, borderRadius: 1.5, cursor: 'pointer',
												backgroundColor: intent === key ? THEME_GREEN : '#fff',
												color: intent === key ? '#fff' : '#334155',
												border: `1px solid ${intent === key ? THEME_GREEN : '#e2e8f0'}`,
												'&:hover': { backgroundColor: intent === key ? '#528035' : '#f1f5f9' },
											}}
										/>
									))}
								</Box>
								<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
									<Select
										size="small" value={tone} onChange={(e) => setTone(e.target.value)} displayEmpty disabled={suppressed}
										sx={{ ...inputSx, minWidth: 120, height: 32, '& .MuiSelect-select': { py: 0.5 } }}
									>
										{TONES.map(key => (
											<MenuItem key={key || 'default'} value={key} sx={{ fontSize: '0.78rem' }}>{t(`candidateOutreach.ai.tone.${key || 'default'}`)}</MenuItem>
										))}
									</Select>
									<Select
										size="small" value={language} onChange={(e) => setLanguage(e.target.value)} disabled={suppressed}
										sx={{ ...inputSx, minWidth: 90, height: 32, '& .MuiSelect-select': { py: 0.5 } }}
									>
										{LANGUAGES.map(code => (
											<MenuItem key={code} value={code} sx={{ fontSize: '0.78rem' }}>{t(`candidateOutreach.ai.language.${code}`)}</MenuItem>
										))}
									</Select>
									<Box sx={{ flexGrow: 1 }} />
									{body.trim() && (
										<Button size="small" variant="outlined" onClick={handleShorter} disabled={drafting || suppressed} sx={outlinedButtonSx}>
											{t('candidateOutreach.ai.shorter')}
										</Button>
									)}
									<Button
										size="small" variant="contained" onClick={() => runDraft()} disabled={drafting || suppressed || !context}
										startIcon={drafting ? <CircularProgress size={12} sx={{ color: '#fff' }} /> : <AutoAwesomeIcon sx={{ fontSize: 14 }} />}
										sx={primaryButtonSx}
									>
										{body.trim() ? t('candidateOutreach.ai.regenerate') : t('candidateOutreach.ai.generate')}
									</Button>
								</Box>
								<TextField
									size="small" fullWidth multiline minRows={1} maxRows={3}
									placeholder={t('candidateOutreach.ai.instructionsPlaceholder')}
									value={instructions} onChange={(e) => setInstructions(e.target.value.slice(0, 1000))}
									disabled={suppressed}
									InputProps={{ sx: { ...inputSx, mt: 1 } }}
								/>
							</Box>

							{/* Fields */}
							<TextField
								size="small" fullWidth label={t('candidateOutreach.to')} value={to}
								onChange={(e) => setTo(e.target.value)} disabled={suppressed}
								error={Boolean(to) && !hasRecipient}
								InputProps={{ sx: inputSx }} InputLabelProps={{ sx: { fontSize: '0.82rem' } }}
							/>
							<TextField
								size="small" fullWidth label={t('candidateOutreach.subject')} value={subject}
								onChange={(e) => setSubject(e.target.value.slice(0, SUBJECT_MAX))} disabled={suppressed}
								InputProps={{ sx: inputSx }} InputLabelProps={{ sx: { fontSize: '0.82rem' } }}
							/>
							<TextField
								size="small" fullWidth multiline minRows={8} maxRows={16} label={t('candidateOutreach.body')} value={body}
								onChange={(e) => setBody(e.target.value.slice(0, BODY_MAX))} disabled={suppressed}
								InputProps={{ sx: inputSx }} InputLabelProps={{ sx: { fontSize: '0.82rem' } }}
							/>
							{mailtoWarning && (
								<Alert
									severity="info" sx={{ fontSize: '0.78rem', borderRadius: 1.5 }}
									action={<Button size="small" startIcon={<ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />} onClick={copyBody} sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}>{t('candidateOutreach.copy')}</Button>}
								>
									{t('candidateOutreach.mailtoTooLong')}
								</Alert>
							)}

							{/* Footer */}
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
								{canSendFromQorva && (
									<Tooltip title={context?.mailboxAddress ? t('candidateOutreach.sendAs', { address: context.mailboxAddress }) : ''}>
										<span>
											<Button
												variant="contained" onClick={handleSend} disabled={!readyToSend || sending}
												startIcon={sending ? <CircularProgress size={12} sx={{ color: '#fff' }} /> : <SendIcon sx={{ fontSize: 14 }} />}
												sx={primaryButtonSx}
											>
												{t('candidateOutreach.send')}
											</Button>
										</span>
									</Tooltip>
								)}
								<ButtonGroup variant={canSendFromQorva ? 'outlined' : 'contained'} disableElevation>
									<Button
										onClick={() => handleHandoff(handoffChoice)} disabled={suppressed || !hasRecipient}
										startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
										sx={canSendFromQorva ? outlinedButtonSx : primaryButtonSx}
									>
										{t(`candidateOutreach.handoff.${handoffChoice}`)}
									</Button>
									<Button
										size="small" onClick={(e) => setHandoffAnchor(e.currentTarget)} disabled={suppressed || !hasRecipient}
										aria-label={t('candidateOutreach.handoff.choose')}
										sx={{ ...(canSendFromQorva ? outlinedButtonSx : primaryButtonSx), px: 0.5, minWidth: 32 }}
									>
										<ArrowDropDownIcon />
									</Button>
								</ButtonGroup>
								<Menu anchorEl={handoffAnchor} open={Boolean(handoffAnchor)} onClose={() => setHandoffAnchor(null)}>
									{Object.values(HANDOFF).map(via => (
										<MenuItem key={via} onClick={() => handleHandoff(via)} sx={{ fontSize: '0.82rem' }}>
											{t(`candidateOutreach.handoff.${via}`)}
										</MenuItem>
									))}
								</Menu>
								<Box sx={{ flexGrow: 1 }} />
								{context?.history?.length > 0 && (
									<Button
										size="small" onClick={() => setHistoryOpen(o => !o)}
										startIcon={<HistoryOutlinedIcon sx={{ fontSize: 15 }} />}
										endIcon={historyOpen ? <ExpandLessIcon sx={{ fontSize: 15 }} /> : <ExpandMoreIcon sx={{ fontSize: 15 }} />}
										sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#64748b' }}
									>
										{t('candidateOutreach.history.title', { count: context.history.length })}
									</Button>
								)}
							</Box>
							{!canSendFromQorva && mailbox === 'NONE' && (
								<Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>
									{t('candidateOutreach.connectHint')}{' '}
									<Link component="button" type="button" onClick={goToSettings} sx={{ fontSize: '0.72rem', fontWeight: 600, color: THEME_GREEN }}>
										{t('candidateOutreach.connectLink')}
									</Link>
								</Typography>
							)}

							{/* History */}
							<Collapse in={historyOpen}>
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, pt: 0.5 }}>
									{(context?.history ?? []).map(row => (
										<Box key={row.id} sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, px: 1.25, py: 0.75, backgroundColor: '#f8fafc' }}>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
												<Chip
													size="small"
													label={t(`candidateOutreach.history.status.${row.status}`, { via: t(`candidateOutreach.history.via.${row.via}`) })}
													sx={{
														height: 20, fontSize: '0.68rem', fontWeight: 600, borderRadius: 1,
														backgroundColor: row.status === 'SENT' ? '#ecfdf3' : row.status === 'FAILED' ? '#fef2f2' : '#f1f5f9',
														color: row.status === 'SENT' ? '#15803d' : row.status === 'FAILED' ? '#b91c1c' : '#475569',
													}}
												/>
												<Typography sx={{ fontSize: '0.72rem', color: '#64748b', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
													{row.senderName || row.senderEmail} · {dayjs(row.createdAt).locale(locale).fromNow()}
												</Typography>
												{row.providerWebLink && (
													<Link href={row.providerWebLink} target="_blank" rel="noopener" sx={{ fontSize: '0.72rem', fontWeight: 600, color: THEME_GREEN, whiteSpace: 'nowrap' }}>
														{t('candidateOutreach.history.openInOutlook')}
													</Link>
												)}
											</Box>
											{row.subject && (
												<Typography sx={{ fontSize: '0.78rem', color: '#0f172a', mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
													{row.subject}
												</Typography>
											)}
										</Box>
									))}
								</Box>
							</Collapse>
						</Box>
					</Box>
				)}
			</Paper>

			<Dialog open={discardOpen} onClose={() => setDiscardOpen(false)} PaperProps={{ sx: { borderRadius: 2, minWidth: 360 } }}>
				<DialogTitle sx={{ fontSize: '1rem', fontWeight: 700 }}>{t('candidateOutreach.discardTitle')}</DialogTitle>
				<DialogContent>
					<Typography sx={{ fontSize: '0.85rem', color: '#475569' }}>{t('candidateOutreach.discardBody')}</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={() => setDiscardOpen(false)} sx={{ textTransform: 'none', fontSize: '0.78rem', color: '#64748b' }}>
						{t('candidateOutreach.keepEditing')}
					</Button>
					<Button
						variant="contained" onClick={() => { setDiscardOpen(false); close(); }}
						sx={{ ...primaryButtonSx, backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' } }}
					>
						{t('candidateOutreach.discard')}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default CandidateOutreachDock;
