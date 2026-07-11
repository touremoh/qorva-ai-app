import React, { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { useTranslation } from 'react-i18next';
import { askInsight, getConversations, getConversationHistory, deleteConversation } from '../../../services/libraryInsightsService.js';
import { getCVById } from '../../../services/cvService.js';
import InsightResultCard from './InsightResultCard.jsx';
import InsightConversationList from './InsightConversationList.jsx';
import InsightIntentCards from './InsightIntentCards.jsx';
import MentionInput from './MentionInput.jsx';
import AppCVDetails from '../cv/AppCVDetails.jsx';

// Map InsightConversationTurnDTO to the shape InsightResultCard expects
const turnToResult = (turn) => ({
    intent:              turn.intent,
    answerText:          turn.answerText,
    candidates:          turn.candidates,
    totalCandidateCount: turn.totalCandidateCount,
    metrics:             turn.metrics,
    charts:              turn.charts,
    followUpQuestions:   turn.followUpQuestions,
    disclaimer:          turn.disclaimer,
    rawData:             turn.rawData,
});

const AppLibraryInsights = () => {
    const { t } = useTranslation();

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

    return (
        <>
        <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden', backgroundColor: '#f8fafc' }}>

            {/* ── Left panel: conversation list ─────────────────────────────── */}
            <Box sx={{
                width: 260,
                flexShrink: 0,
                borderRight: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}>
                <InsightConversationList
                    conversations={conversations}
                    activeConvId={activeConvId}
                    onSelect={handleSelectConversation}
                    onNew={handleNewConversation}
                    onDelete={handleDeleteRequest}
                    loading={listLoading}
                />
            </Box>

            {/* ── Center panel: active conversation ─────────────────────────── */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

                {/* Section header */}
                <Box sx={{
                    px: 2.5,
                    py: 1.25,
                    backgroundColor: '#ffffff',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    flexShrink: 0,
                    minHeight: 52,
                }}>
                    <Box sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(98,156,68,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <PsychologyOutlinedIcon sx={{ fontSize: 18, color: '#629C44' }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            color: '#0f172a',
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {activeTitle || t('header.intelligence', 'Talent Intelligence')}
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.2 }}>
                            {activeTitle ? t('header.intelligence', 'Talent Intelligence') : 'Ask questions about your talent pool'}
                        </Typography>
                    </Box>
                </Box>

                {/* Conversation area */}
                <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 2, md: 3 }, py: 2 }}>
                <Box sx={{ maxWidth: 820, mx: 'auto', width: '100%' }}>

                    {/* Empty state */}
                    {isEmpty && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, gap: 2 }}>
                            <Box sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(98,156,68,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <ForumOutlinedIcon sx={{ fontSize: 26, color: '#629C44' }} />
                            </Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b', textAlign: 'center' }}>
                                {t('insight.intro.title')}
                            </Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', maxWidth: 480 }}>
                                {t('insight.intro.subtitle')}
                            </Typography>
                            <InsightIntentCards
                                onCardClick={(example) => {
                                    setQuestion(example);
                                    setInputFocusToken((n) => n + 1);
                                }}
                            />
                        </Box>
                    )}

                    {/* History loading spinner */}
                    {loadingHistory && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                            <CircularProgress size={22} sx={{ color: '#629C44' }} />
                        </Box>
                    )}

                    {/* Turns */}
                    {!loadingHistory && turns.map((entry, i) => {
                        if (entry.type === 'question') {
                            return (
                                <Box key={i} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
                                    <Box sx={{
                                        maxWidth: '68%',
                                        px: 1.75,
                                        py: 1,
                                        borderRadius: '18px 18px 4px 18px',
                                        background: 'linear-gradient(135deg, #629C44 0%, #4d7a35 100%)',
                                        color: '#ffffff',
                                        boxShadow: '0 2px 8px rgba(98,156,68,0.25)',
                                    }}>
                                        <Typography sx={{ fontSize: '0.84rem', lineHeight: 1.6 }}>{entry.text}</Typography>
                                    </Box>
                                </Box>
                            );
                        }
                        if (entry.type === 'answer') {
                            return (
                                <Box key={i} sx={{ mb: 0.5 }}>
                                    <InsightResultCard result={entry.result} onFollowUp={handleFollowUp} onCandidateClick={handleCandidateClick} />
                                </Box>
                            );
                        }
                        if (entry.type === 'error') {
                            return (
                                <Box key={i} sx={{ mb: 1.5, px: 1.5, py: 1, borderRadius: 1.5, backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
                                    <Typography sx={{ fontSize: '0.8rem', color: '#dc2626' }}>{entry.text}</Typography>
                                </Box>
                            );
                        }
                        return null;
                    })}

                    {/* Typing indicator */}
                    {loading && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 1 }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.4,
                                px: 1.5,
                                py: 0.75,
                                backgroundColor: '#ffffff',
                                border: '1px solid #e8edf3',
                                borderRadius: '18px 18px 18px 4px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            }}>
                                {[0, 1, 2].map(dot => (
                                    <Box key={dot} sx={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        backgroundColor: '#629C44',
                                        animation: 'pulse 1.4s ease-in-out infinite',
                                        animationDelay: `${dot * 0.2}s`,
                                        '@keyframes pulse': {
                                            '0%, 80%, 100%': { opacity: 0.3, transform: 'scale(0.8)' },
                                            '40%': { opacity: 1, transform: 'scale(1)' },
                                        },
                                    }} />
                                ))}
                            </Box>
                            <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                Analyzing…
                            </Typography>
                        </Box>
                    )}

                    <div ref={bottomRef} />
                </Box>
                </Box>

                {/* Input bar */}
                <Box sx={{
                    px: { xs: 2, md: 3 },
                    py: 1.5,
                    backgroundColor: '#ffffff',
                    borderTop: '1px solid #e2e8f0',
                    flexShrink: 0,
                }}>
                    <Box sx={{ maxWidth: 820, mx: 'auto' }}>
                        <Box sx={{
                            backgroundColor: '#f8fafc',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: 3,
                            px: 1.5,
                            py: 0.75,
                            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                            '&:focus-within': {
                                borderColor: '#629C44',
                                boxShadow: '0 0 0 3px rgba(98,156,68,0.1)',
                                backgroundColor: '#ffffff',
                            },
                        }}>
                            <MentionInput
                                value={question}
                                onChange={setQuestion}
                                mentions={mentions}
                                onMentionsChange={setMentions}
                                onSubmit={() => submit()}
                                disabled={loading || loadingHistory}
                                placeholder={t('insight.input.placeholder')}
                                focusToken={inputFocusToken}
                            />
                        </Box>
                        <Typography sx={{ fontSize: '0.62rem', color: '#cbd5e1', textAlign: 'center', mt: 0.6 }}>
                            {t('insight.input.hint')}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* ── Right panel: CV details ────────────────────────────────────── */}
            {(selectedCV || cvLoading) && (
                <Box sx={{
                    width: '42%',
                    flexShrink: 0,
                    borderLeft: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    {cvLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <CircularProgress size={24} sx={{ color: '#629C44' }} />
                        </Box>
                    ) : (
                        <AppCVDetails
                            cv={selectedCV}
                            onClose={() => setSelectedCV(null)}
                            onUpdate={(updated) => setSelectedCV(updated)}
                        />
                    )}
                </Box>
            )}
        </Box>

            {/* ── Delete conversation confirmation dialog ─────────────────────── */}
            <Dialog
                open={!!conversationToDelete}
                onClose={() => { if (!deletingConversation) setConversationToDelete(null); }}
                maxWidth="xs"
                fullWidth
                slotProps={{ paper: { elevation: 0, sx: { borderRadius: 3, border: '1px solid #e2e8f0' } } }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DeleteOutlineIcon sx={{ fontSize: 18, color: '#ef4444' }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                            {t('insight.deleteConversation.title')}
                        </Typography>
                    </Box>
                </DialogTitle>
                <Divider sx={{ borderColor: '#f1f5f9' }} />
                <DialogContent sx={{ pt: 2 }}>
                    <Typography sx={{ fontSize: '0.85rem', color: '#475569' }}>
                        {t('insight.deleteConversation.message')}
                    </Typography>
                    {conversationToDelete?.title && (
                        <Box sx={{ mt: 1.5, px: 1.5, py: 1, borderRadius: 2, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                                {conversationToDelete.title}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <Divider sx={{ borderColor: '#f1f5f9' }} />
                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button
                        onClick={() => setConversationToDelete(null)}
                        disabled={deletingConversation}
                        sx={{ borderRadius: 2, fontSize: '0.82rem', textTransform: 'none', color: '#64748b' }}
                    >
                        {t('insight.deleteConversation.cancel')}
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        disabled={deletingConversation}
                        startIcon={deletingConversation ? <CircularProgress size={14} color="inherit" /> : <DeleteOutlineIcon sx={{ fontSize: 16 }} />}
                        sx={{
                            backgroundColor: '#ef4444', borderRadius: 2, fontSize: '0.82rem',
                            textTransform: 'none', fontWeight: 600, boxShadow: 'none',
                            '&:hover': { backgroundColor: '#dc2626', boxShadow: 'none' },
                        }}
                    >
                        {t('insight.deleteConversation.confirm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AppLibraryInsights;
