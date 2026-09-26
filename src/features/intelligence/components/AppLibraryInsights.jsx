import ConfirmDialog from '../../../shared/ui/ConfirmDialog.jsx';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import { useTranslation } from 'react-i18next';
import InsightResultCard from './InsightResultCard.jsx';
import InsightConversationList from './InsightConversationList.jsx';
import InsightCvPanel from './InsightCvPanel.jsx';
import InsightInputBar from './InsightInputBar.jsx';
import InsightTyping from './InsightTyping.jsx';
import InsightEmptyState from './InsightEmptyState.jsx';
import useInsightConversation from '../hooks/useInsightConversation.js';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

const AppLibraryInsights = () => {
    const { t } = useTranslation();
    const insight = useInsightConversation();
    return (
        <>
        <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden', backgroundColor: tokens.surface.subtle }}>

            {/* ── Left panel: conversation list ─────────────────────────────── */}
            <Box sx={{
                width: 260,
                flexShrink: 0,
                borderRight: `1px solid ${tokens.line.main}`,
                backgroundColor: tokens.surface.paper,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}>
                <InsightConversationList
                    conversations={insight.conversations}
                    activeConvId={insight.activeConvId}
                    onSelect={insight.handleSelectConversation}
                    onNew={insight.handleNewConversation}
                    onDelete={insight.handleDeleteRequest}
                    loading={insight.listLoading}
                />
            </Box>

            {/* ── Center panel: active conversation ─────────────────────────── */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

                {/* Section header */}
                <Box sx={{
                    px: 2.5,
                    py: 1.25,
                    backgroundColor: tokens.surface.paper,
                    borderBottom: `1px solid ${tokens.line.main}`,
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
                        backgroundColor: alpha(tokens.brand.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <PsychologyOutlinedIcon sx={{ fontSize: 18, color: tokens.brand.text }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            color: tokens.ink.strong,
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {insight.activeTitle || t('header.intelligence', 'Talent Intelligence')}
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', color: tokens.ink.subtle, lineHeight: 1.2 }}>
                            {insight.activeTitle ? t('header.intelligence', 'Talent Intelligence') : 'Ask questions about your talent pool'}
                        </Typography>
                    </Box>
                </Box>

                {/* Conversation area */}
                <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 2, md: 3 }, py: 2 }}>
                <Box sx={{ maxWidth: 820, mx: 'auto', width: '100%' }}>

                    {/* Empty state */}
                    <InsightEmptyState isEmpty={insight.isEmpty} setInputFocusToken={insight.setInputFocusToken} setQuestion={insight.setQuestion} />

                    {/* History insight.loading spinner */}
                    {insight.loadingHistory && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                            <CircularProgress size={22} sx={{ color: tokens.brand.text }} />
                        </Box>
                    )}

                    {/* Turns */}
                    {!insight.loadingHistory && insight.turns.map((entry, i) => {
                        if (entry.type === 'insight.question') {
                            return (
                                <Box key={i} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
                                    <Box sx={{
                                        maxWidth: '68%',
                                        px: 1.75,
                                        py: 1,
                                        borderRadius: '18px 18px 4px 18px',
                                        background: `linear-gradient(135deg, ${tokens.brand.main} 0%, ${tokens.brand.deep} 100%)`,
                                        color: tokens.ink.inverse,
                                        boxShadow: `0 2px 8px ${alpha(tokens.brand.main, 0.25)}`,
                                    }}>
                                        <Typography sx={{ fontSize: '0.84rem', lineHeight: 1.6 }}>{entry.text}</Typography>
                                    </Box>
                                </Box>
                            );
                        }
                        if (entry.type === 'answer') {
                            return (
                                <Box key={i} sx={{ mb: 0.5 }}>
                                    <InsightResultCard result={entry.result} onFollowUp={insight.handleFollowUp} onCandidateClick={insight.handleCandidateClick} />
                                </Box>
                            );
                        }
                        if (entry.type === 'error') {
                            return (
                                <Box key={i} sx={{ mb: 1.5, px: 1.5, py: 1, borderRadius: 1.5, backgroundColor: tokens.status.error.tint, border: `1px solid ${tokens.status.error.border}` }}>
                                    <Typography sx={{ fontSize: '0.8rem', color: tokens.status.error.main }}>{entry.text}</Typography>
                                </Box>
                            );
                        }
                        return null;
                    })}

                    {/* Typing indicator */}
                    <InsightTyping loading={insight.loading} />

                    <div ref={insight.bottomRef} />
                </Box>
                </Box>

                {/* Input bar */}
                <InsightInputBar
                    inputFocusToken={insight.inputFocusToken}
                    loading={insight.loading}
                    loadingHistory={insight.loadingHistory}
                    mentions={insight.mentions}
                    question={insight.question}
                    setMentions={insight.setMentions}
                    setQuestion={insight.setQuestion}
                    submit={insight.submit}
                />
            </Box>

            {/* ── Right panel: CV details ────────────────────────────────────── */}
            <InsightCvPanel cvLoading={insight.cvLoading} selectedCV={insight.selectedCV} setSelectedCV={insight.setSelectedCV} />
        </Box>

            {/* ── Delete conversation confirmation dialog ─────────────────────── */}
            <ConfirmDialog
                open={!!insight.conversationToDelete}
                title={t('insight.deleteConversation.title')}
                subject={insight.conversationToDelete?.title && (
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: 'ink.strong' }}>{insight.conversationToDelete.title}</Typography>
                )}
                cancelLabel={t('insight.deleteConversation.cancel')}
                confirmLabel={t('insight.deleteConversation.confirm')}
                onCancel={() => insight.setConversationToDelete(null)}
                onConfirm={insight.handleDeleteConfirm}
                busy={insight.deletingConversation}
                tone="danger"
                maxWidth="xs"
                fullWidth
            >
                {t('insight.deleteConversation.message')}
            </ConfirmDialog>
        </>
    );
};

export default AppLibraryInsights;
