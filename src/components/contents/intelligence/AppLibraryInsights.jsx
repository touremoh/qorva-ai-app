import React, { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { useTranslation } from 'react-i18next';
import { askInsight, getConversations, getConversationHistory } from '../../../services/libraryInsightsService.js';
import { getCVById } from '../../../services/cvService.js';
import InsightResultCard from './InsightResultCard.jsx';
import InsightConversationList from './InsightConversationList.jsx';
import AppCVDetails from '../cv/AppCVDetails.jsx';

const EXAMPLE_PROMPTS = [
    'Show me a clustering of my talent pool',
    'Who are my top candidates for senior engineering roles?',
    'What skill gaps exist in my pipeline?',
    'Find rediscoverable candidates for product management roles',
    'How healthy is my current hiring pipeline?',
];

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
    const [loading, setLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const [selectedCV, setSelectedCV] = useState(null);
    const [cvLoading, setCvLoading] = useState(false);

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
    const submit = useCallback(async (q) => {
        const trimmed = (q ?? question).trim();
        if (!trimmed || loading) return;

        setTurns(prev => [...prev, { type: 'question', text: trimmed }]);
        setQuestion('');
        setLoading(true);
        scrollToBottom();

        try {
            const isFirstTurn = !conversationIdRef.current;
            const payload = { question: trimmed };
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
    }, [question, loading]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
        }
    };

    const handleFollowUp = useCallback((s) => submit(s), [submit]);

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
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 6, gap: 2.5 }}>
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
                                Start a new conversation
                            </Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', maxWidth: 380 }}>
                                Get clustering insights, candidate shortlists, skill gap analysis, and more.
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, justifyContent: 'center', maxWidth: 520 }}>
                                {EXAMPLE_PROMPTS.map((p, i) => (
                                    <Paper
                                        key={i}
                                        onClick={() => submit(p)}
                                        elevation={0}
                                        sx={{
                                            px: 1.5,
                                            py: 0.75,
                                            fontSize: '0.74rem',
                                            color: '#475569',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                            '&:hover': { backgroundColor: '#f1f5f9', borderColor: '#cbd5e1', color: '#1e293b' },
                                        }}
                                    >
                                        {p}
                                    </Paper>
                                ))}
                            </Box>
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
                            display: 'flex',
                            gap: 1,
                            alignItems: 'flex-end',
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
                            <TextField
                                fullWidth
                                multiline
                                maxRows={4}
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about your talent pool…"
                                disabled={loading || loadingHistory}
                                variant="standard"
                                sx={{
                                    '& .MuiInput-root': {
                                        fontSize: '0.85rem',
                                        color: '#1e293b',
                                        '&::before, &::after': { display: 'none' },
                                    },
                                    '& .MuiInput-input': { py: 0.5 },
                                }}
                            />
                            <Tooltip title="Send (Enter)">
                                <span>
                                    <IconButton
                                        onClick={() => submit()}
                                        disabled={!question.trim() || loading || loadingHistory}
                                        sx={{
                                            width: 34,
                                            height: 34,
                                            backgroundColor: question.trim() && !loading ? '#629C44' : 'transparent',
                                            color: question.trim() && !loading ? '#ffffff' : '#cbd5e1',
                                            borderRadius: 2,
                                            flexShrink: 0,
                                            '&:hover': { backgroundColor: question.trim() && !loading ? '#4d7a35' : 'rgba(0,0,0,0.04)' },
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <SendOutlinedIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>
                        <Typography sx={{ fontSize: '0.62rem', color: '#cbd5e1', textAlign: 'center', mt: 0.6 }}>
                            Enter to send · Shift+Enter for new line
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
    );
};

export default AppLibraryInsights;
