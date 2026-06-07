import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTranslation } from 'react-i18next';

const COLORS = ['#629C44', '#4f46e5', '#0891b2', '#d97706', '#dc2626', '#7c3aed', '#0f766e'];

// Mirrors LABEL_MAP / DIMENSION_MAP in MetricRow
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

const translateBucketKey = (key, t) =>
    t(`dashboard.talent.labels.${key}`, LABEL_MAP[key] ?? key);

// "seniorityLevel Distribution" → "Seniority Level Distribution"
// Only translates words that are known domain keys; rest passed through as-is
const translateTitle = (title, t) => {
    if (!title) return title;
    return title.split(' ').map(w =>
        DIMENSION_MAP[w] ? t(`dashboard.talent.${w}`, DIMENSION_MAP[w]) : w
    ).join(' ');
};

const MiniPie = ({ title, labels = [], values = [], t }) => {
    const data = labels.map((label, i) => ({
        id: i,
        label: translateBucketKey(label, t),
        value: Number(values[i]) || 0,
        color: COLORS[i % COLORS.length],
    }));

    return (
        <Box sx={{ textAlign: 'center', flex: '1 1 180px', minWidth: 0 }}>
            {title && (
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                    {translateTitle(title, t)}
                </Typography>
            )}
            <PieChart
                series={[{ data, innerRadius: 28, outerRadius: 52, paddingAngle: 2, cornerRadius: 3 }]}
                width={150}
                height={120}
                margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                slotProps={{ legend: { hidden: true } }}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.4, mt: 0.5 }}>
                {data.map((d, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.62rem', color: '#64748b' }}>{d.label} ({d.value}%)</Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

const BarChartCard = ({ title, labels = [], values = [], t }) => (
    <Box sx={{ width: '100%' }}>
        {title && (
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                {translateTitle(title, t)}
            </Typography>
        )}
        <BarChart
            xAxis={[{ data: labels.map(l => translateBucketKey(l, t)), scaleType: 'band' }]}
            series={[{ data: values.map(Number), color: COLORS[0] }]}
            height={220}
            margin={{ top: 16, bottom: 32, left: 40, right: 16 }}
        />
    </Box>
);

const ChartSection = ({ charts }) => {
    const { t } = useTranslation();
    if (!charts?.length) return null;

    const pies   = charts.filter(c => (c.chartType ?? '').toUpperCase() === 'PIE');
    const others = charts.filter(c => (c.chartType ?? '').toUpperCase() !== 'PIE');

    return (
        <Box sx={{ mt: 1.5 }}>
            {pies.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-around' }}>
                    {pies.map((c, i) => (
                        <MiniPie key={i} title={c.title} labels={c.labels} values={c.values} t={t} />
                    ))}
                </Box>
            )}
            {others.map((c, i) => (
                <BarChartCard key={i} title={c.title} labels={c.labels} values={c.values} t={t} />
            ))}
        </Box>
    );
};

export default ChartSection;
