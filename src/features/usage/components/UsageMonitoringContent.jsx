import { useEffect, useState } from 'react';
import {
    Box,
    CircularProgress,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import { useTranslation } from 'react-i18next';
import { getUsageMonitoring } from '../api/usageMonitoringService.js';
import { getEmailTemplates } from '../../email-templates/api/emailTemplateService.js';
import UsageSummary from './UsageSummary.jsx';

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

const UsageMonitoringContent = () => {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [templateUsage, setTemplateUsage] = useState(null); // { count, limit } — limit null = unlimited
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError('');
                const res = await getUsageMonitoring();
                // 204 = the tenant has no active usage period (nothing to meter against yet)
                setData(res?.status === 204 || !res?.data ? null : res.data);
            } catch (e) {
                console.error('Error loading usage monitoring', e);
                setError(t('dashboard.errors.loadFailed', 'Failed to load data'));
            } finally {
                setLoading(false);
            }
        })();
        // Email templates are a static plan cap, not a period metric — fetched separately;
        // the card simply stays hidden for users without template permissions.
        (async () => {
            try {
                const res = await getEmailTemplates();
                const templates = (res.data?.data ?? res.data);
                setTemplateUsage({
                    count: (templates?.templates ?? []).length,
                    limit: Number.isFinite(templates?.limit) ? templates.limit : null,
                });
            } catch { /* card is best-effort */ }
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

                {!loading && !error && !data && (
                    <Paper elevation={0} sx={{ border: '1px dashed #e2e8f0', borderRadius: 2.5, p: 4 }}>
                        <Stack alignItems="center" spacing={1.25} sx={{ textAlign: 'center' }}>
                            <SpeedOutlinedIcon sx={{ fontSize: 36, color: '#cbd5e1' }} />
                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                                {t('dashboard.usage.noPeriodTitle', 'No usage period is active for this account')}
                            </Typography>
                            <Typography sx={{ fontSize: '0.82rem', color: '#64748b', maxWidth: 520 }}>
                                {t('dashboard.usage.noPeriodHint', 'Usage is metered per billing period. A period is opened automatically a few minutes after a subscription starts or renews; if this message persists, contact support.')}
                            </Typography>
                        </Stack>
                    </Paper>
                )}

                {!loading && !error && data && (
                    <UsageSummary
                        data={data}
                        featureConfig={featureConfig}
                        formatPeriodDate={formatPeriodDate}
                        templateUsage={templateUsage}
                    />
                )}
            </Box>
        </Box>
    );
};

export default UsageMonitoringContent;
