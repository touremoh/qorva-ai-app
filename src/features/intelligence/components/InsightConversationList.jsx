import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

const INTENT_COLOR = {
    TALENT_POOL_INTELLIGENCE: tokens.status.accent.main,
    TALENT_CLUSTERING: tokens.status.accent.main,
    CANDIDATE_RANKING: tokens.brand.main,
    CANDIDATE_REDISCOVERY: tokens.status.info.bright,
    SKILL_GAP_ANALYSIS: tokens.status.warning.main,
    GENERAL_RECRUITING_QUESTION: tokens.ink.muted,
    LOCATION_INTELLIGENCE: tokens.status.success.teal,
    SALARY_EXPECTATION_ANALYSIS: tokens.status.accent.violet,
    CANDIDATE_COMPARISON: tokens.status.info.bright,
    JOB_DESCRIPTION_ANALYSIS: tokens.status.warning.main,
    RESUME_DATA_QUALITY_ANALYSIS: tokens.ink.muted,
    SENIORITY_DISTRIBUTION_ANALYSIS: tokens.brand.main,
    SKILLS_DISTRIBUTION: tokens.status.info.sky,
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
    SKILLS_DISTRIBUTION:             'Skills',
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

const ConversationItem = ({ conv, isActive, onSelect, onDelete }) => {
    const { t } = useTranslation();
    const intentColor = INTENT_COLOR[conv.intent] ?? `${tokens.ink.muted}`;
    const intentLabel = t(`insight.intentsShort.${conv.intent}`, INTENT_LABEL[conv.intent]);

    return (
        <Box
            onClick={() => onSelect(conv.conversationId)}
            sx={{
                px: 1.25,
                py: 0.9,
                mb: 0.25,
                borderRadius: 1.5,
                cursor: 'pointer',
                borderLeft: `3px solid ${isActive ? `${tokens.brand.main}` : 'transparent'}`,
                backgroundColor: isActive ? alpha(tokens.brand.main, 0.07) : 'transparent',
                transition: 'all 0.13s ease',
                position: 'relative',
                '&:hover': {
                    backgroundColor: isActive ? alpha(tokens.brand.main, 0.09) : `${tokens.surface.subtle}`,
                    '& .conv-delete-btn': { opacity: 1 },
                },
            }}
        >
            <Typography sx={{
                fontSize: '0.78rem',
                color: isActive ? `${tokens.ink.strong}` : `${tokens.ink.body}`,
                fontWeight: isActive ? 600 : 400,
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 0.4,
                pr: 2.5,
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
                <Typography sx={{ fontSize: '0.6rem', color: tokens.ink.faint, ml: 'auto', flexShrink: 0 }}>
                    {formatTime(conv.lastActivityAt)}
                </Typography>
            </Box>
            <IconButton
                className="conv-delete-btn"
                size="small"
                onClick={(e) => { e.stopPropagation(); onDelete?.(conv.conversationId, conv.title); }}
                sx={{
                    position: 'absolute',
                    top: 6,
                    right: 4,
                    opacity: 0,
                    transition: 'opacity 0.15s ease',
                    p: 0.3,
                    color: tokens.ink.subtle,
                    '&:hover': { color: tokens.status.error.bright, backgroundColor: 'rgba(239,68,68,0.08)' },
                }}
            >
                <DeleteOutlineIcon sx={{ fontSize: 14 }} />
            </IconButton>
        </Box>
    );
};

ConversationItem.propTypes = {
    conv: PropTypes.shape({
        conversationId: PropTypes.string,
        title: PropTypes.string,
        intent: PropTypes.string,
        lastActivityAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    isActive: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
};

const InsightConversationList = ({ conversations, activeConvId, onSelect, onNew, onDelete, loading }) => {
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
                        backgroundColor: tokens.brand.main,
                        '&:hover': { backgroundColor: tokens.brand.hover },
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
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    History
                </Typography>
            </Box>

            {/* List */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 0.75 }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <CircularProgress size={18} sx={{ color: tokens.brand.text }} />
                    </Box>
                )}

                {!loading && conversations.length === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 1 }}>
                        <ForumOutlinedIcon sx={{ fontSize: 26, color: tokens.ink.faintest }} />
                        <Typography sx={{ fontSize: '0.73rem', color: tokens.ink.faint, textAlign: 'center' }}>
                            No conversations yet
                        </Typography>
                    </Box>
                )}

                {groups.map(({ key, items }) => (
                    <Box key={key} sx={{ mb: 1.5 }}>
                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: tokens.ink.faint, textTransform: 'uppercase', letterSpacing: '0.08em', px: 1.25, mb: 0.4 }}>
                            {key}
                        </Typography>
                        {items.map(conv => (
                            <ConversationItem
                                key={conv.conversationId}
                                conv={conv}
                                isActive={conv.conversationId === activeConvId}
                                onSelect={onSelect}
                                onDelete={onDelete}
                            />
                        ))}
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

InsightConversationList.propTypes = {
    conversations: PropTypes.arrayOf(PropTypes.object).isRequired,
    activeConvId: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    onNew: PropTypes.func,
    onDelete: PropTypes.func,
    loading: PropTypes.bool,
};

export default InsightConversationList;
