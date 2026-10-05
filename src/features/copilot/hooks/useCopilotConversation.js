import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAgentRun } from '../../../contexts/AgentRunContext.jsx';
import { deleteAgentConversation, getAgentConversation, listAgentConversations } from '../api/agentService.js';
import { getCVById } from '../../cv/api/cvService.js';
import { resolveError, toastError } from '../../../utils/errorHandler.js';
import { MAX_GOAL_LENGTH, toWireMentions, upsertConversation } from '../model/agentRun.js';
import { conversationFocus, focusFromParams, toWireFocus } from '../model/focus.js';
import resolveFocusRequest from './resolveFocusRequest.js';

/**
 * One Copilot conversation: its runs (each a goal + what the agent did + its answer), starting a run, the list,
 * deleting, and its focus — a candidate for a job, opened from a link (?cvId=&jobPostId=) and sent with the first run.
 */
export default function useCopilotConversation() {
	const { activeRun, startRun, cancelRun } = useAgentRun();
	const [conversations, setConversations] = useState([]);
	const [listLoading, setListLoading] = useState(true);
	const [activeConvId, setActiveConvId] = useState(null);
	const [runs, setRuns] = useState([]);
	const [loadingHistory, setLoadingHistory] = useState(false);
	const [goal, setGoal] = useState('');
	const [mentions, setMentions] = useState([]);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [conversationToDelete, setConversationToDelete] = useState(null);
	const [deleting, setDeleting] = useState(false);
	const [selectedCV, setSelectedCV] = useState(null);
	const [cvLoading, setCvLoading] = useState(false);
	const [inputFocusToken, setInputFocusToken] = useState(0);
	const [pendingFocus, setPendingFocus] = useState(null);
	const [params, setParams] = useSearchParams();
	const bottomRef = useRef(null);
	const mounted = useRef(true);

	useEffect(() => {
		mounted.current = true;
		return () => { mounted.current = false; };
	}, []);

	useEffect(() => {
		listAgentConversations()
			.then((res) => setConversations(Array.isArray(res.data) ? res.data : []))
			.catch(() => setConversations([]))
			.finally(() => setListLoading(false));
	}, []);

	// The context polls the working run; mirror its updates into this conversation.
	useEffect(() => {
		if (!activeRun) return;
		setRuns((current) => current.map((r) => (r.id === activeRun.id ? activeRun : r)));
		setConversations((current) => current.map((c) => (c.conversationId === activeRun.conversationId
			? { ...c, lastStatus: activeRun.status } : c)));
	}, [activeRun]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
	}, [runs]);

	const handleSelectConversation = useCallback(async (conversationId) => {
		if (conversationId === activeConvId) return;
		setActiveConvId(conversationId);
		setError(null);
		setLoadingHistory(true);
		try {
			const res = await getAgentConversation(conversationId);
			setRuns(Array.isArray(res.data) ? res.data : []);
		} catch (e) {
			setRuns([]);
			toastError(e);
		} finally {
			setLoadingHistory(false);
		}
	}, [activeConvId]);

	const handleNewConversation = useCallback(() => {
		setActiveConvId(null);
		setRuns([]);
		setError(null);
		setGoal('');
		setMentions([]);
		setPendingFocus(null);
		setInputFocusToken((n) => n + 1);
	}, []);

	// Opened about a candidate: a new conversation focused on them (or mentioning them), and the link is consumed.
	useEffect(() => {
		const requested = focusFromParams(params);
		if (!requested) return undefined;
		const next = new URLSearchParams(params);
		next.delete('cvId');
		next.delete('jobPostId');
		setParams(next, { replace: true });
		handleNewConversation();
		// Not cancelled by the params change just made: only leaving the page drops the answer.
		resolveFocusRequest(requested).then(({ focus, mention }) => {
			if (!mounted.current) return;
			if (focus) setPendingFocus(focus);
			if (mention) setMentions([mention]);
		});
		return undefined;
	}, [params, setParams, handleNewConversation]);

	const submit = useCallback(async (goalOverride) => {
		const text = (goalOverride ?? goal).trim();
		if (!text || text.length > MAX_GOAL_LENGTH || submitting) return;
		setSubmitting(true);
		setError(null);
		try {
			const run = await startRun({
				goal: text,
				mentions: toWireMentions(mentions),
				conversationId: activeConvId ?? undefined,
				focus: activeConvId ? undefined : toWireFocus(pendingFocus),
			});
			setRuns((current) => [...current, run]);
			setPendingFocus(null);
			setActiveConvId(run.conversationId);
			setConversations((current) => upsertConversation(current, run));
			setGoal('');
			setMentions([]);
		} catch (e) {
			setError(resolveError(e));
		} finally {
			setSubmitting(false);
		}
	}, [goal, mentions, activeConvId, pendingFocus, submitting, startRun]);

	const handleCancel = useCallback(async (runId) => {
		try {
			const run = await cancelRun(runId);
			setRuns((current) => current.map((r) => (r.id === run.id ? run : r)));
		} catch (e) {
			toastError(e);
		}
	}, [cancelRun]);

	/** A run changed by an approval decision (the context also follows it). */
	const replaceRun = useCallback((run) => {
		if (!run?.id) return;
		setRuns((current) => current.map((r) => (r.id === run.id ? run : r)));
	}, []);

	const handleDeleteConfirm = useCallback(async () => {
		const target = conversationToDelete;
		if (!target) return;
		setDeleting(true);
		try {
			await deleteAgentConversation(target.conversationId);
			setConversations((current) => current.filter((c) => c.conversationId !== target.conversationId));
			if (target.conversationId === activeConvId) handleNewConversation();
			setConversationToDelete(null);
		} catch (e) {
			setConversationToDelete(null);
			setError(resolveError(e));
		} finally {
			setDeleting(false);
		}
	}, [conversationToDelete, activeConvId, handleNewConversation]);

	const handleLinkClick = useCallback(async (link) => {
		if (link?.type !== 'CV' || !link.id) return;
		if (selectedCV?.id === link.id) { setSelectedCV(null); return; }
		setCvLoading(true);
		try {
			const res = await getCVById(link.id);
			setSelectedCV(res?.data?.data ?? res?.data ?? null);
		} catch {
			setSelectedCV(null);
		} finally {
			setCvLoading(false);
		}
	}, [selectedCV?.id]);

	const activeTitle = conversations.find((c) => c.conversationId === activeConvId)?.title;

	return {
		focus: pendingFocus ?? conversationFocus(runs), clearFocus: pendingFocus ? () => setPendingFocus(null) : undefined,
		activeConvId, activeTitle, bottomRef, conversationToDelete, conversations, cvLoading, deleting, error, goal,
		handleCancel, handleDeleteConfirm, handleLinkClick, handleNewConversation, handleSelectConversation,
		inputFocusToken, isEmpty: !loadingHistory && runs.length === 0, listLoading, loadingHistory, mentions, replaceRun, runs,
		selectedCV, setConversationToDelete, setGoal, setInputFocusToken, setMentions, setSelectedCV, submit, submitting,
	};
}
