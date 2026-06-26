import React, { useEffect, useState } from 'react';
import {
    Box,
    CircularProgress,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import { useTranslation } from 'react-i18next';
import { getUsageMonitoring } from '../../../services/usageMonitoringService.js';

const USAGE_FEATURE_CONFIG = (t) => [
    {
        key: 'screeningActions',
        label: t('dashboard.usage.matchingActions', 'Matching Actions'),
        icon: ManageSearchOutlinedIcon,
        accent: '#629C44',
        bg: 'rgba(98,156,68,0.08)',
    },
    {
        key: 'aiResumeChats',
        label: t('dashboard.usage.aiResumeChats', 'AI Resume Chats'),
        icon: QuestionAnswerOutlinedIcon,
        accent: '#3b82f6',
        bg: 'rgba(59,130,246,0.08)',
    },
    {
        key: 'talentIntelligenceQueries',
        label: t('dashboard.usage.talentIntelligenceQueries', 'Talent Intelligence'),
        icon: InsightsOutlinedIcon,
        accent: '#8b5cf6',
        bg: 'rgba(139,92,246,0.08)',
    },
];

const SectionHeader = ({ icon: Icon, label, right }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, pb: 1.5, borderBottom: '2px solid #629C44', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon sx={{ fontSize: 15, color: '#629C44' }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#629C44', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {label}
            </Typography>
        </Box>
        {right}
    </Box>
);

const UsageMonitoringContent = () => {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError('');
                const res = await getUsageMonitoring();
                setData(res?.data ?? null);
            } catch (e) {
                console.error('Error loading usage monitoring', e);
                setError(t('dashboard.errors.loadFailed', 'Failed to load data'));
            } finally {
                setLoading(false);
            }
        })();
    }, [t]);

    const formatPeriodDate = (iso) =>
        new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const featureConfig = USAGE_FEATURE_CONFIG(t);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
            <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SpeedOutlinedIcon sx={{ fontSize: 20, color: '#629C44' }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                        {t('header.usageMonitoring', 'Usage Monitoring')}
                    </Typography>
                </Box>

                {loading && (
                    <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, py: 8 }} spacing={1.5}>
                        <CircularProgress size={32} sx={{ color: '#629C44' }} />
                        <Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>{t('dashboard.loading')}</Typography>
                    </Stack>
                )}

                {!loading && error && (
                    <Paper elevation={0} sx={{ border: '1px solid #fee2e2', borderRadius: 2.5, p: 2.5 }}>
                        <Typography sx={{ fontSize: '0.85rem', color: '#dc2626' }}>{error}</Typography>
                    </Paper>
                )}

                {!loading && !error && data && (
                    <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
                        <SectionHeader
                            icon={SpeedOutlinedIcon}
                            label={t('header.usageMonitoring', 'Usage Monitoring')}
                            right={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                                    <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
                                        {formatPeriodDate(data.currentPeriodStart)} – {formatPeriodDate(data.currentPeriodEnd)}
                                    </Typography>
                                </Box>
                            }
                        />

                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                            gap: 2,
                        }}>
                            {featureConfig.map(({ key, label, icon: Icon, accent, bg }) => {
                                const feature = data.features?.[key];
                                if (!feature) return null;
                                const pct = feature.limit > 0 ? Math.min(100, (feature.consumed / feature.limit) * 100) : 0;
                                const isWarning = pct >= 80;
                                const barColor = isWarning ? '#f59e0b' : accent;

                                return (
                                    <Box key={key} sx={{
                                        border: `1px solid ${isWarning ? 'rgba(245,158,11,0.25)' : '#f1f5f9'}`,
                                        borderRadius: 2,
                                        p: 2,
                                        backgroundColor: isWarning ? 'rgba(245,158,11,0.03)' : '#fafcfd',
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
                                            <Box sx={{ width: 32, height: 32, borderRadius: 1.5, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Icon sx={{ fontSize: 16, color: accent }} />
                                            </Box>
                                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', lineHeight: 1.3 }}>
                                                {label}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                                            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                                                {feature.consumed.toLocaleString()}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
                                                / {feature.limit.toLocaleString()}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ height: 7, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden', mb: 0.75 }}>
                                            <Box sx={{
                                                height: '100%',
                                                width: `${pct}%`,
                                                backgroundColor: barColor,
                                                borderRadius: 4,
                                                transition: 'width 0.6s ease',
                                            }} />
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: isWarning ? '#b45309' : '#64748b' }}>
                                                {pct.toFixed(1)}% {t('dashboard.usage.used', 'used')}
                                            </Typography>
                                            <Tooltip title={t('dashboard.usage.cumulativeTooltip', 'All-time total across all periods')} arrow placement="top">
                                                <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', cursor: 'default' }}>
                                                    {feature.cumulative.toLocaleString()} {t('dashboard.usage.allTime', 'all-time')}
                                                </Typography>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>

                        {data.lastUpdatedAt && (
                            <Typography sx={{ mt: 1.75, fontSize: '0.68rem', color: '#cbd5e1', textAlign: 'right' }}>
                                {t('dashboard.usage.lastUpdated', 'Last updated')}: {new Date(data.lastUpdatedAt).toLocaleString()}
                            </Typography>
                        )}
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default UsageMonitoringContent;
