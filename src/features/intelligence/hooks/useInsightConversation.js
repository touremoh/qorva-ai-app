import { useCallback, useEffect, useRef, useState } from 'react';
import { askInsight, getConversations, getConversationHistory, deleteConversation } from '../api/libraryInsightsService.js';
import { getCVById } from '../../cv/api/cvService.js';
import { turnToResult } from '../model/insights.js';

/** One talent-intelligence conversation: its turns, asking a question (with @-mentions), history, deleting a conversation, and the resume opened from an answer. */
export default function useInsightConversation() {

    // Left panel state
    const [conversations, setConversations] = useState([]);
    const [listLoading, setListLoading] = useState(false);

    // Right panel state
    const [activeConvId, setActiveConvId] = useState(null);
    const [turns, setTurns] = useState([]);
    const [question, setQuestion] = useState('');
    const [mentions, setMentions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [inputFocusToken, setInputFocusToken] = useState(0);

    const [selectedCV, setSelectedCV] = useState(null);
    const [cvLoading, setCvLoading] = useState(false);

    const [conversationToDelete, setConversationToDelete] = useState(null); // { id, title }
    const [deletingConversation, setDeletingConversation] = useState(false);

    const conversationIdRef = useRef(null);
    const bottomRef = useRef(null);

    // Cache of full summaries keyed by conversationId (for instant history load on click)
    const summaryCache = useRef({});

    // Load conversation list from server on mount
    useEffect(() => {
        const fetchConversations = async () => {
            setListLoading(true);
            try {
                const res = await getConversations();
                const raw = res?.data?.data ?? res?.data ?? [];
                // API returns List<InsightConversationSummaryDTO>
                summaryCache.current = Object.fromEntries(raw.map(s => [s.conversationId, s]));
                const list = [...raw].sort(
                    (a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt)
                ).map(s => ({
                    conversationId: s.conversationId,
                    title: s.title,
                    intent: s.turns?.at(-1)?.intent,
                    lastActivityAt: s.lastActivityAt,
                }));
                setConversations(list);
            } catch {
                // Non-critical — sidebar stays empty
            } finally {
                setListLoading(false);
            }
        };
        fetchConversations();
    }, []);

    const scrollToBottom = () =>
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    // ── Start a brand-new conversation ──────────────────────────────────────
    const handleNewConversation = useCallback(() => {
        conversationIdRef.current = null;
        setActiveConvId(null);
        setTurns([]);
        setQuestion('');
        setMentions([]);
    }, []);

    // ── Load existing conversation ───────────────────────────────────────────
    const handleSelectConversation = useCallback(async (convId) => {
        if (convId === activeConvId) return;
        setActiveConvId(convId);
        conversationIdRef.current = convId;
        setTurns([]);

        const turnsFromCache = summaryCache.current[convId]?.turns;
        if (turnsFromCache?.length) {
            setTurns(turnsFromCache.flatMap(t => [
                { type: 'question', text: t.question },
                { type: 'answer', result: turnToResult(t) },
            ]));
            scrollToBottom();
            return;
        }

        // Fallback: fetch from API (conversation started mid-session, not yet in cache)
        setLoadingHistory(true);
        try {
            const res = await getConversationHistory(convId);
            const history = res?.data?.data ?? res?.data ?? [];
            setTurns(history.flatMap(t => [
                { type: 'question', text: t.question },
                { type: 'answer', result: turnToResult(t) },
            ]));
        } catch {
            setTurns([{ type: 'error', text: 'Could not load conversation history.' }]);
        } finally {
            setLoadingHistory(false);
            scrollToBottom();
        }
    }, [activeConvId]);

    // ── Submit a question ────────────────────────────────────────────────────
    const submit = useCallback(async (q, mentionsOverride) => {
        const trimmed = (q ?? question).trim();
        if (!trimmed || loading) return;

        const submittedMentions = mentionsOverride ?? mentions;
        const wireMentions = submittedMentions
            .filter((m) => trimmed.includes(`${m.type === 'job' ? '#' : '@'}${m.name}`))
            .map(({ type, id, name }) => ({ type, id, name }));

        setTurns(prev => [...prev, { type: 'question', text: trimmed }]);
        setQuestion('');
        setMentions([]);
        setLoading(true);
        scrollToBottom();

        try {
            const isFirstTurn = !conversationIdRef.current;
            const payload = { question: trimmed };
            if (wireMentions.length > 0) payload.mentions = wireMentions;
            if (conversationIdRef.current) payload.conversationId = conversationIdRef.current;

            const res = await askInsight(payload);
            const data = res?.data?.data ?? res?.data;
            const convId = data?.conversationId;

            if (convId) {
                conversationIdRef.current = convId;
                setActiveConvId(convId);
                const now = new Date().toISOString();
                setConversations(prev => {
                    const exists = prev.find(c => c.conversationId === convId);
                    const entry = {
                        conversationId: convId,
                        title: exists?.title ?? trimmed,
                        intent: data?.intent,
                        lastActivityAt: now,
                    };
                    return exists
                        ? [entry, ...prev.filter(c => c.conversationId !== convId)]
                        : [entry, ...prev];
                });

                // Refresh to pick up server-generated title for the first turn
                if (isFirstTurn) {
                    getConversations().then(r => {
                        const raw = r?.data?.data ?? r?.data ?? [];
                        const found = raw.find(s => s.conversationId === convId);
                        if (found?.title) {
                            summaryCache.current[convId] = found;
                            setConversations(prev => prev.map(c =>
                                c.conversationId === convId ? { ...c, title: found.title } : c
                            ));
                        }
                    }).catch(() => {});
                }
            }

            setTurns(prev => [...prev, { type: 'answer', result: data }]);
        } catch (err) {
            const msg = err?.response?.data?.message ?? 'Something went wrong. Please try again.';
            setTurns(prev => [...prev, { type: 'error', text: msg }]);
        } finally {
            setLoading(false);
            scrollToBottom();
        }
    }, [question, mentions, loading]);

    const handleFollowUp = useCallback((s) => submit(s, []), [submit]);

    const handleDeleteRequest = useCallback((convId, convTitle) => {
        setConversationToDelete({ id: convId, title: convTitle });
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!conversationToDelete) return;
        setDeletingConversation(true);
        try {
            await deleteConversation(conversationToDelete.id);
            delete summaryCache.current[conversationToDelete.id];
            setConversations(prev => prev.filter(c => c.conversationId !== conversationToDelete.id));
            if (activeConvId === conversationToDelete.id) {
                conversationIdRef.current = null;
                setActiveConvId(null);
                setTurns([]);
            }
            setConversationToDelete(null);
        } catch {
            // keep dialog open on error — user can retry or cancel
        } finally {
            setDeletingConversation(false);
        }
    }, [conversationToDelete, activeConvId]);

    const handleCandidateClick = useCallback(async (candidate) => {
        if (!candidate?.id) return;
        if (selectedCV?.id === candidate.id) { setSelectedCV(null); return; }
        setCvLoading(true);
        try {
            const res = await getCVById(candidate.id);
            setSelectedCV(res?.data?.data ?? res?.data ?? null);
        } catch {
            setSelectedCV(null);
        } finally {
            setCvLoading(false);
        }
    }, [selectedCV?.id]);

    const activeTitle = conversations.find(c => c.conversationId === activeConvId)?.title;
    const isEmpty = turns.length === 0 && !loading && !loadingHistory;

    return {
        activeConvId, activeTitle, bottomRef, conversationToDelete, conversations, cvLoading, deletingConversation, handleCandidateClick, handleDeleteConfirm, handleDeleteRequest, handleFollowUp, handleNewConversation, handleSelectConversation, inputFocusToken, isEmpty, listLoading, loading, loadingHistory, mentions, question, selectedCV, setConversationToDelete, setInputFocusToken, setMentions, setQuestion, setSelectedCV, submit, turns,
    };
}
