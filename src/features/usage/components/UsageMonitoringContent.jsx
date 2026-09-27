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
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

const USAGE_FEATURE_CONFIG = (t) => [
    {
        key: 'screeningActions',
        label: t('dashboard.usage.matchingActions', 'Matching Actions'),
        icon: ManageSearchOutlinedIcon,
        accent: tokens.brand.text,
        bg: alpha(tokens.brand.main, 0.08),
    },
    {
        key: 'aiResumeChats',
        label: t('dashboard.usage.aiResumeChats', 'AI Resume Chats'),
        icon: QuestionAnswerOutlinedIcon,
        accent: tokens.status.info.blue,
        bg: 'rgba(59,130,246,0.08)',
    },
    {
        key: 'talentIntelligenceQueries',
        label: t('dashboard.usage.talentIntelligenceQueries', 'Talent Intelligence'),
        icon: InsightsOutlinedIcon,
        accent: tokens.status.accent.purple,
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
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: tokens.surface.subtle }}>
            <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SpeedOutlinedIcon sx={{ fontSize: tokens.iconSize.lg, color: tokens.brand.text }} />
                    <Typography sx={{ fontWeight: 700, fontSize: tokens.fontSize.body, color: tokens.ink.strong }}>
                        {t('header.usageMonitoring', 'Usage Monitoring')}
                    </Typography>
                </Box>

                {loading && (
                    <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, py: 8, textAlign: 'center' }} spacing={1.5}>
                        <CircularProgress size={32} sx={{ color: tokens.brand.text }} />
                        <Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.subtle }}>{t('dashboard.loading')}</Typography>
                    </Stack>
                )}

                {!loading && error && (
                    <Paper elevation={0} sx={{ border: `1px solid ${tokens.status.error.tint}`, borderRadius: 2.5, p: 2.5 }}>
                        <Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.status.error.main }}>{error}</Typography>
                    </Paper>
                )}

                {!loading && !error && !data && (
                    <Paper elevation={0} sx={{ border: `1px dashed ${tokens.line.main}`, borderRadius: 2.5, p: 4 }}>
                        <Stack alignItems="center" spacing={1.25} sx={{ textAlign: 'center' }}>
                            <SpeedOutlinedIcon sx={{ fontSize: 36, color: tokens.ink.faint }} />
                            <Typography sx={{ fontSize: tokens.fontSize.body, fontWeight: 600, color: tokens.ink.strong }}>
                                {t('dashboard.usage.noPeriodTitle', 'No usage period is active for this account')}
                            </Typography>
                            <Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.muted, maxWidth: 520 }}>
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
