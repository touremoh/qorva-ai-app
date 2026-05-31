import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';

const INTENT_COLOR = {
    TALENT_POOL_INTELLIGENCE:        '#4f46e5',
    TALENT_CLUSTERING:               '#4f46e5',
    CANDIDATE_RANKING:               '#629C44',
    CANDIDATE_REDISCOVERY:           '#0891b2',
    SKILL_GAP_ANALYSIS:              '#d97706',
    GENERAL_RECRUITING_QUESTION:     '#64748b',
    LOCATION_INTELLIGENCE:           '#0f766e',
    SALARY_EXPECTATION_ANALYSIS:     '#7c3aed',
    CANDIDATE_COMPARISON:            '#0891b2',
    JOB_DESCRIPTION_ANALYSIS:        '#d97706',
    RESUME_DATA_QUALITY_ANALYSIS:    '#64748b',
    SENIORITY_DISTRIBUTION_ANALYSIS: '#629C44',
};

const INTENT_LABEL = {
    TALENT_POOL_INTELLIGENCE:        'Talent Pool',
    TALENT_CLUSTERING:               'Clustering',
    CANDIDATE_RANKING:               'Ranking',
    CANDIDATE_REDISCOVERY:           'Rediscovery',
    SKILL_GAP_ANALYSIS:              'Skill Gap',
    GENERAL_RECRUITING_QUESTION:     'General',
    LOCATION_INTELLIGENCE:           'Location',
    SALARY_EXPECTATION_ANALYSIS:     'Salary',
    CANDIDATE_COMPARISON:            'Comparison',
    JOB_DESCRIPTION_ANALYSIS:        'Job Description',
    RESUME_DATA_QUALITY_ANALYSIS:    'Data Quality',
    SENIORITY_DISTRIBUTION_ANALYSIS: 'Seniority',
};

const formatTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const groupByDate = (conversations) => {
    const now = new Date();
    const startOfToday     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday - 86400000);
    const startOfWeek      = new Date(startOfToday - 6 * 86400000);

    const groups = [
        { key: 'Today',      items: [] },
        { key: 'Yesterday',  items: [] },
        { key: 'This Week',  items: [] },
        { key: 'Older',      items: [] },
    ];

    conversations.forEach(conv => {
        const d = new Date(conv.lastActivityAt ?? 0);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        if (dayStart >= startOfToday)     groups[0].items.push(conv);
        else if (dayStart >= startOfYesterday) groups[1].items.push(conv);
        else if (dayStart >= startOfWeek) groups[2].items.push(conv);
        else                              groups[3].items.push(conv);
    });

    return groups.filter(g => g.items.length > 0);
};

const ConversationItem = ({ conv, isActive, onSelect }) => {
    const intentColor = INTENT_COLOR[conv.intent] ?? '#64748b';
    const intentLabel = INTENT_LABEL[conv.intent];

    return (
        <Box
            onClick={() => onSelect(conv.conversationId)}
            sx={{
                px: 1.25,
                py: 0.9,
                mb: 0.25,
                borderRadius: 1.5,
                cursor: 'pointer',
                borderLeft: `3px solid ${isActive ? '#629C44' : 'transparent'}`,
                backgroundColor: isActive ? 'rgba(98,156,68,0.07)' : 'transparent',
                transition: 'all 0.13s ease',
                '&:hover': { backgroundColor: isActive ? 'rgba(98,156,68,0.09)' : '#f8fafc' },
            }}
        >
            <Typography sx={{
                fontSize: '0.78rem',
                color: isActive ? '#0f172a' : '#334155',
                fontWeight: isActive ? 600 : 400,
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 0.4,
            }}>
                {conv.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {intentLabel && (
                    <Chip
                        label={intentLabel}
                        size="small"
                        sx={{
                            fontSize: '0.58rem',
                            height: 15,
                            fontWeight: 600,
                            backgroundColor: `${intentColor}14`,
                            color: intentColor,
                            border: `1px solid ${intentColor}28`,
                            '& .MuiChip-label': { px: 0.6 },
                        }}
                    />
                )}
                <Typography sx={{ fontSize: '0.6rem', color: '#cbd5e1', ml: 'auto', flexShrink: 0 }}>
                    {formatTime(conv.lastActivityAt)}
                </Typography>
            </Box>
        </Box>
    );
};

const InsightConversationList = ({ conversations, activeConvId, onSelect, onNew, loading }) => {
    const groups = groupByDate(conversations);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{ px: 1.5, pt: 1.5, pb: 1, flexShrink: 0 }}>
                <Button
                    fullWidth
                    startIcon={<AddOutlinedIcon sx={{ fontSize: 16 }} />}
                    variant="contained"
                    onClick={onNew}
                    sx={{
                        backgroundColor: '#629C44',
                        '&:hover': { backgroundColor: '#528035' },
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        boxShadow: 'none',
                        py: 0.85,
                    }}
                >
                    New Conversation
                </Button>
            </Box>

            {/* Section label */}
            <Box sx={{ px: 2, mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    History
                </Typography>
            </Box>

            {/* List */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 0.75 }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <CircularProgress size={18} sx={{ color: '#629C44' }} />
                    </Box>
                )}

                {!loading && conversations.length === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 1 }}>
                        <ForumOutlinedIcon sx={{ fontSize: 26, color: '#e2e8f0' }} />
                        <Typography sx={{ fontSize: '0.73rem', color: '#cbd5e1', textAlign: 'center' }}>
                            No conversations yet
                        </Typography>
                    </Box>
                )}

                {groups.map(({ key, items }) => (
                    <Box key={key} sx={{ mb: 1.5 }}>
                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.08em', px: 1.25, mb: 0.4 }}>
                            {key}
                        </Typography>
                        {items.map(conv => (
                            <ConversationItem
                                key={conv.conversationId}
                                conv={conv}
                                isActive={conv.conversationId === activeConvId}
                                onSelect={onSelect}
                            />
                        ))}
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default InsightConversationList;
