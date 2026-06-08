import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

// Legacy camelCase fallback maps (pre-i18n-key era)
const LABEL_MAP = {
    specialist: 'Specialist', tShaped: 'T-Shaped', generalist: 'Generalist', hybrid: 'Hybrid',
    senior: 'Senior', midLevel: 'Mid-Level', junior: 'Junior', lead: 'Lead',
    principal: 'Principal', manager: 'Manager', director: 'Director', executive: 'Executive',
    individualContributor: 'Individual Contributor', teamLead: 'Team Lead', none: 'None',
    crossFunctionalLeader: 'Cross-Functional', strategicLeader: 'Strategic Leader',
    executiveInfluence: 'Executive Influence', high: 'High', medium: 'Medium',
    veryHigh: 'Very High', low: 'Low', unknown: 'Unknown',
};

const DIMENSION_MAP = {
    skillDepth: 'Skill Depth', seniorityLevel: 'Seniority Level',
    leadership: 'Leadership', leadershipAndInfluence: 'Leadership',
    learningVelocity: 'Learning Velocity',
};

const CLUSTER_PREFIXES = ['SENIORITY_', 'SKILL_DEPTH_', 'LEADERSHIP_', 'LEARNING_VELOCITY_', 'CLUSTER_'];
const isClusterKey = (k) => k && CLUSTER_PREFIXES.some(p => k.startsWith(p));
const isUpperSnake = (k) => k && /^[A-Z][A-Z0-9_]+$/.test(k);

// Translate a bucket/cluster key — handles both new UPPERCASE keys and legacy camelCase
const translateBucketKey = (key, t) => {
    if (isClusterKey(key)) return t(`insight.clusters.${key}`, key);
    return t(`dashboard.talent.labels.${key}`, LABEL_MAP[key] ?? key);
};

// Translate a dimension/metric label key
const translateDimensionKey = (key, t) => {
    if (isUpperSnake(key)) return t(`insight.metrics.${key}`, key);
    return t(`dashboard.talent.${key}`, DIMENSION_MAP[key] ?? key);
};

// Translate a unit — '%' passes through as-is, UNIT_* keys are looked up
const translateUnit = (unit, t) => {
    if (!unit || unit === '%') return unit;
    if (unit.startsWith('UNIT_')) return t(`insight.units.${unit}`, unit);
    return unit;
};

// Translate a metric label (stat-card format)
const translateLabel = (label, t) => {
    if (!label) return label;
    if (isUpperSnake(label)) return t(`insight.metrics.${label}`, label);
    return label.split(' ').map(w => {
        if (DIMENSION_MAP[w] || LABEL_MAP[w]) return translateDimensionKey(w, t);
        return w;
    }).join(' ');
};

// "senior (56%)" → "Senior (56%)" — translates only the first token (legacy values)
const translateValue = (value, t) => {
    if (!value) return value;
    const match = value.match(/^(\S+)([\s\S]*)$/);
    if (!match) return value;
    const [, key, rest] = match;
    if (LABEL_MAP[key] || DIMENSION_MAP[key]) {
        return translateBucketKey(key, t) + rest;
    }
    return value;
};

const isDistribution = (metrics) => metrics?.some(m => m.key != null);

const groupByLabel = (metrics) =>
    metrics.reduce((acc, m) => {
        (acc[m.label] ??= []).push(m);
        return acc;
    }, {});

// New format: percentage field holds the bar width (e.g. "65")
// Mid format: unit="%" and value holds the number (e.g. "67")
// Legacy format: unit holds the percentage string (e.g. "42%")
const parsePct = (m) => {
    if (m.percentage != null) return Math.min(100, Math.max(0, parseFloat(m.percentage) || 0));
    const src = m.unit === '%' ? m.value : m.unit;
    const n = parseFloat(src);
    return isNaN(n) ? 0 : Math.min(100, Math.max(0, n));
};

const BAR_COLORS = ['#629C44', '#4f46e5', '#0891b2', '#d97706', '#7c3aed', '#0f766e', '#db2777'];

const MetricRow = ({ metrics }) => {
    const { t } = useTranslation();
    if (!metrics?.length) return null;

    // ── Distribution format (has `key` field) ────────────────────────────────
    if (isDistribution(metrics)) {
        const groups = groupByLabel(metrics);
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 1.5 }}>
                {Object.entries(groups).map(([label, buckets]) => {
                    const totalRow = buckets.find(m => m.key === 'TOTAL_CANDIDATES');
                    const rows = buckets.filter(m => m.key !== 'TOTAL_CANDIDATES');
                    return (
                        <Box key={label} sx={{ p: 1.75, borderRadius: 2, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.25 }}>
                                <Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                    {translateDimensionKey(label, t)}
                                </Typography>
                                {totalRow && (
                                    <Typography sx={{ fontSize: '0.60rem', color: '#94a3b8' }}>
                                        {totalRow.value} {translateUnit(totalRow.unit, t)}
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85 }}>
                                {rows.map((m, i) => {
                                    const pct = parsePct(m);
                                    const color = BAR_COLORS[i % BAR_COLORS.length];
                                    return (
                                        <Box key={m.key ?? i}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.4 }}>
                                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                                                    {translateBucketKey(m.key, t)}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                                                    <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
                                                        {m.value}{m.percentage != null ? ` ${translateUnit(m.unit, t)}` : ''}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', minWidth: 36, textAlign: 'right' }}>
                                                        {m.percentage != null ? `${m.percentage}%` : m.unit}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ height: 5, backgroundColor: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                                                <Box sx={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: 99, transition: 'width 0.5s ease' }} />
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        );
    }

    // ── Legacy format — stat cards ────────────────────────────────────────────
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
            {metrics.map((m, i) => (
                <Box key={i} sx={{
                    flex: '1 1 120px',
                    px: 1.75,
                    py: 1.25,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(98,156,68,0.06) 0%, rgba(98,156,68,0.02) 100%)',
                    border: '1px solid rgba(98,156,68,0.15)',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0, left: 0, right: 0,
                        height: '2px',
                        background: 'linear-gradient(90deg, #629C44, transparent)',
                        opacity: 0.6,
                    },
                }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                        {translateValue(m.value, t)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: '#64748b', mt: 0.5, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 }}>
                        {translateLabel(m.label, t)}
                    </Typography>
                    {m.unit && (
                        <Typography sx={{ fontSize: '0.63rem', color: '#94a3b8', mt: 0.15 }}>
                            {translateUnit(m.unit, t)}
                        </Typography>
                    )}
                </Box>
            ))}
        </Box>
    );
};

export default MetricRow;
