import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCandidateOutreach } from '../../../contexts/CandidateOutreachContext.jsx';
import { draftOutreach, recordExternalOutreach, sendOutreach } from '../api/candidateOutreachService.js';
import { HANDOFF, buildHandoffUrl, isMailtoTooLong, lastHandoffChoice, openExternal, rememberHandoffChoice } from '../../../utils/mailLinks.js';
import { USER_EMAIL } from '../../../constants.js';
import { LANGUAGES, SUBJECT_MAX, BODY_MAX, SHORTER_CONTEXT_CHARS, errorCodeOf } from '../model/outreach.js';

/** The outreach composer's state: recipient, intent, language and tone, the AI draft, sending or handing off to a mail app, and the dock's open/minimized state. */
export default function useOutreachComposer() {
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

	return {
		body, canSendFromQorva, close, context, contextError, contextLoading, copyBody, discardOpen, drafting, goToSettings, handleClose, handleHandoff, handleSend, handleShorter, handoffAnchor, handoffChoice, hasRecipient, historyOpen, instructions, intent, isOpen, language, locale, mailbox, mailtoWarning, minimize, minimized, noEmail, readyToSend, restore, runDraft, sending, setBody, setDiscardOpen, setHandoffAnchor, setHistoryOpen, setInstructions, setIntent, setLanguage, setSubject, setTo, setTone, subject, suppressed, target, to, tone,
	};
}
