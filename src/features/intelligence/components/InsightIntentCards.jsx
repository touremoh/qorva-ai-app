import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import DonutLargeOutlinedIcon from '@mui/icons-material/DonutLargeOutlined';
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import * as tokens from '../../../theme/tokens.js';

const INTENT_CARDS = [
    { id: 'TALENT_POOL_INTELLIGENCE', icon: GroupsOutlinedIcon,        color: tokens.status.accent.main },
    { id: 'TALENT_CLUSTERING',        icon: HubOutlinedIcon,           color: tokens.status.accent.main },
    { id: 'CANDIDATE_RANKING',        icon: LeaderboardOutlinedIcon,   color: tokens.brand.text },
    { id: 'CANDIDATE_REDISCOVERY',    icon: RestartAltOutlinedIcon,    color: tokens.status.info.bright },
    { id: 'SKILL_GAP_ANALYSIS',       icon: ManageSearchOutlinedIcon,  color: tokens.status.warning.main },
    { id: 'SKILLS_DISTRIBUTION',      icon: DonutLargeOutlinedIcon,    color: tokens.status.info.sky },
    { id: 'CANDIDATE_COMPARISON',     icon: CompareArrowsOutlinedIcon, color: tokens.status.info.bright },
];

const withAlpha = (hex, alpha) => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
};

const InsightIntentCards = ({ onCardClick }) => {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: 1.5,
                width: '100%',
                maxWidth: 780,
                mt: 1,
            }}
        >
            {INTENT_CARDS.map(({ id, icon: Icon, color }) => {
                const label = t(`insight.intents.${id}`);
                const description = t(`insight.intents.descriptions.${id}`);
                const example = t(`insight.intents.examples.${id}`);
                return (
                    <Paper
                        key={id}
                        elevation={0}
                        onClick={() => onCardClick?.(example)}
                        sx={{
                            p: 1.5,
                            borderRadius: 2.5,
                            border: `1px solid ${tokens.line.main}`,
                            backgroundColor: tokens.surface.paper,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.75,
                            transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
                            '&:hover': {
                                borderColor: withAlpha(color, 0.4),
                                boxShadow: `0 4px 14px ${withAlpha(color, 0.12)}`,
                                transform: 'translateY(-1px)',
                            },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                                sx={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: withAlpha(color, 0.1),
                                    flexShrink: 0,
                                }}
                            >
                                <Icon sx={{ fontSize: tokens.iconSize.md, color }} />
                            </Box>
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize: tokens.fontSize.body2,
                                    color: tokens.ink.strong,
                                    lineHeight: 1.2,
                                }}
                            >
                                {label}
                            </Typography>
                        </Box>
                        <Typography
                            sx={{
                                fontSize: tokens.fontSize.caption,
                                color: tokens.ink.muted,
                                lineHeight: 1.4,
                            }}
                        >
                            {description}
                        </Typography>
                        <Box
                            sx={{
                                mt: 'auto',
                                pt: 0.75,
                                borderTop: `1px dashed ${tokens.line.main}`,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: tokens.fontSize.caption,
                                    color: tokens.ink.subtle,
                                    fontStyle: 'italic',
                                    lineHeight: 1.35,
                                }}
                            >
                                “{example}”
                            </Typography>
                        </Box>
                    </Paper>
                );
            })}
        </Box>
    );
};

InsightIntentCards.propTypes = {
    onCardClick: PropTypes.func,
};

export default InsightIntentCards;
