import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';

// Chart schema: { chartType: 'PIE'|'BAR', title, labels: string[], values: number[] }
// PIE  → zip labels+values into donut slices
// BAR  → labels = x-axis categories, values = single series

const COLORS = ['#629C44', '#4f46e5', '#0891b2', '#d97706', '#dc2626', '#7c3aed', '#0f766e'];

const MiniPie = ({ title, labels = [], values = [] }) => {
    const data = labels.map((label, i) => ({
        id: i,
        label,
        value: Number(values[i]) || 0,
        color: COLORS[i % COLORS.length],
    }));

    return (
        <Box sx={{ textAlign: 'center', flex: '1 1 180px', minWidth: 0 }}>
            {title && (
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                    {title}
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
                        <Typography sx={{ fontSize: '0.62rem', color: '#64748b' }}>{d.label} ({d.value})</Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

const BarChartCard = ({ title, labels = [], values = [] }) => (
    <Box sx={{ width: '100%' }}>
        {title && (
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                {title}
            </Typography>
        )}
        <BarChart
            xAxis={[{ data: labels, scaleType: 'band' }]}
            series={[{ data: values.map(Number), color: COLORS[0] }]}
            height={220}
            margin={{ top: 16, bottom: 32, left: 40, right: 16 }}
        />
    </Box>
);

const ChartSection = ({ charts }) => {
    if (!charts?.length) return null;

    const pies   = charts.filter(c => (c.chartType ?? '').toUpperCase() === 'PIE');
    const others = charts.filter(c => (c.chartType ?? '').toUpperCase() !== 'PIE');

    return (
        <Box sx={{ mt: 1.5 }}>
            {pies.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-around' }}>
                    {pies.map((c, i) => (
                        <MiniPie key={i} title={c.title} labels={c.labels} values={c.values} />
                    ))}
                </Box>
            )}
            {others.map((c, i) => (
                <BarChartCard key={i} title={c.title} labels={c.labels} values={c.values} />
            ))}
        </Box>
    );
};

export default ChartSection;
