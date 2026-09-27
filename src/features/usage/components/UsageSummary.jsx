import PropTypes from 'prop-types';
import SectionHeader from '../../../shared/ui/SectionHeader.jsx';
import { Box, Paper, Tooltip, Typography } from '@mui/material';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';

/** Usage per feature for the current billing period, against the plan's limits. */
const UsageSummary = ({ data, featureConfig, formatPeriodDate, templateUsage }) => {
    const { t } = useTranslation();
    return (
        <>
        <Paper elevation={0} sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, p: 2.5 }}>
            <SectionHeader sx={{ pb: 1.5 }}
                icon={SpeedOutlinedIcon}
                label={t('header.usageMonitoring', 'Usage Monitoring')}
                action={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <CalendarTodayOutlinedIcon sx={{ fontSize: tokens.iconSize.xs, color: tokens.ink.subtle }} />
                        <Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle, fontWeight: 500 }}>
                            {formatPeriodDate(data.currentPeriodStart)} – {formatPeriodDate(data.currentPeriodEnd)}
                        </Typography>
                    </Box>
                }
            />

            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                gap: 2,
            }}>
                {featureConfig.map(({ key, label, icon: Icon, accent, bg }) => {
                    const feature = data.features?.[key];
                    if (!feature) return null;
                    const pct = feature.limit > 0 ? Math.min(100, (feature.consumed / feature.limit) * 100) : 0;
                    const isWarning = pct >= 80;
                    const barColor = isWarning ? `${tokens.status.warning.bright}` : accent;

                    return (
                        <Box key={key} sx={{
                            border: `1px solid ${isWarning ? 'rgba(245,158,11,0.25)' : `${tokens.surface.muted}`}`,
                            borderRadius: 2,
                            p: 2,
                            backgroundColor: isWarning ? 'rgba(245,158,11,0.03)' : `${tokens.surface.coolWhite}`,
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
                                <Box sx={{ width: 32, height: 32, borderRadius: 1.5, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Icon sx={{ fontSize: tokens.iconSize.md, color: accent }} />
                                </Box>
                                <Typography sx={{ fontSize: tokens.fontSize.small, fontWeight: 600, color: tokens.ink.body, lineHeight: 1.3 }}>
                                    {label}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                                <Typography sx={{ fontSize: tokens.fontSize.xxl, fontWeight: 800, color: tokens.ink.strong, lineHeight: 1 }}>
                                    {feature.consumed.toLocaleString()}
                                </Typography>
                                <Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle, fontWeight: 500 }}>
                                    / {feature.limit.toLocaleString()}
                                </Typography>
                            </Box>

                            <Box sx={{ height: 7, backgroundColor: tokens.line.main, borderRadius: 4, overflow: 'hidden', mb: 0.75 }}>
                                <Box sx={{
                                    height: '100%',
                                    width: `${pct}%`,
                                    backgroundColor: barColor,
                                    borderRadius: 4,
                                    transition: 'width 0.6s ease',
                                }} />
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontSize: tokens.fontSize.caption, fontWeight: 600, color: isWarning ? `${tokens.status.warning.strong}` : `${tokens.ink.muted}` }}>
                                    {pct.toFixed(1)}% {t('dashboard.usage.used', 'used')}
                                </Typography>
                                <Tooltip title={t('dashboard.usage.cumulativeTooltip', 'All-time total across all periods')} arrow placement="top">
                                    <Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle, cursor: 'default' }}>
                                        {feature.cumulative.toLocaleString()} {t('dashboard.usage.allTime', 'all-time')}
                                    </Typography>
                                </Tooltip>
                            </Box>
                        </Box>
                    );
                })}

                {/* Email templates: static plan cap (saved count), not a monthly consumption metric */}
                {templateUsage && (() => {
                    const { count, limit } = templateUsage;
                    const pct = limit > 0 ? Math.min(100, (count / limit) * 100) : 0;
                    const isWarning = limit !== null && pct >= 80;
                    const accent = tokens.status.warning.bright;
                    return (
                        <Box sx={{
                            border: `1px solid ${isWarning ? 'rgba(245,158,11,0.25)' : `${tokens.surface.muted}`}`,
                            borderRadius: 2,
                            p: 2,
                            backgroundColor: isWarning ? 'rgba(245,158,11,0.03)' : `${tokens.surface.coolWhite}`,
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
                                <Box sx={{ width: 32, height: 32, borderRadius: 1.5, backgroundColor: 'rgba(245,158,11,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <MarkEmailReadOutlinedIcon sx={{ fontSize: tokens.iconSize.md, color: accent }} />
                                </Box>
                                <Typography sx={{ fontSize: tokens.fontSize.small, fontWeight: 600, color: tokens.ink.body, lineHeight: 1.3 }}>
                                    {t('header.emailTemplates', 'Email Templates')}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                                <Typography sx={{ fontSize: tokens.fontSize.xxl, fontWeight: 800, color: tokens.ink.strong, lineHeight: 1 }}>
                                    {count.toLocaleString()}
                                </Typography>
                                <Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle, fontWeight: 500 }}>
                                    {limit !== null
                                        ? `/ ${limit.toLocaleString()}`
                                        : t('dashboard.usage.unlimited', 'Unlimited')}
                                </Typography>
                            </Box>

                            {limit !== null && (
                                <Box sx={{ height: 7, backgroundColor: tokens.line.main, borderRadius: 4, overflow: 'hidden', mb: 0.75 }}>
                                    <Box sx={{
                                        height: '100%',
                                        width: `${pct}%`,
                                        backgroundColor: isWarning ? `${tokens.status.warning.bright}` : `${tokens.brand.main}`,
                                        borderRadius: 4,
                                        transition: 'width 0.6s ease',
                                    }} />
                                </Box>
                            )}

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {limit !== null && (
                                    <Typography sx={{ fontSize: tokens.fontSize.caption, fontWeight: 600, color: isWarning ? `${tokens.status.warning.strong}` : `${tokens.ink.muted}` }}>
                                        {pct.toFixed(1)}% {t('dashboard.usage.used', 'used')}
                                    </Typography>
                                )}
                                <Tooltip title={t('dashboard.usage.templatesTooltip', 'Saved invitation templates — a plan allowance, not a monthly quota')} arrow placement="top">
                                    <Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle, cursor: 'default', ml: 'auto' }}>
                                        {t('dashboard.usage.planAllowance', 'plan allowance')}
                                    </Typography>
                                </Tooltip>
                            </Box>
                        </Box>
                    );
                })()}
            </Box>

            {data.lastUpdatedAt && (
                <Typography sx={{ mt: 1.75, fontSize: tokens.fontSize.caption, color: tokens.ink.faint, textAlign: 'right' }}>
                    {t('dashboard.usage.lastUpdated', 'Last updated')}: {new Date(data.lastUpdatedAt).toLocaleString()}
                </Typography>
            )}
        </Paper>
        </>
    );
};

UsageSummary.propTypes = {
    data: PropTypes.any,
    featureConfig: PropTypes.any,
    formatPeriodDate: PropTypes.func,
    templateUsage: PropTypes.any,
};

export default UsageSummary;
