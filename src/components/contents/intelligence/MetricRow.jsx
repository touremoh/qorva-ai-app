import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const MetricRow = ({ metrics }) => {
    if (!metrics?.length) return null;
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
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: 'linear-gradient(90deg, #629C44, transparent)',
                        opacity: 0.6,
                    },
                }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#1e293b', lineHeight: 1, letterSpacing: '-0.02em' }}>
                        {m.value}
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: '#64748b', mt: 0.5, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 }}>
                        {m.label}
                    </Typography>
                    {(m.unit || m.subLabel) && (
                        <Typography sx={{ fontSize: '0.63rem', color: '#94a3b8', mt: 0.15 }}>
                            {m.unit ?? m.subLabel}
                        </Typography>
                    )}
                </Box>
            ))}
        </Box>
    );
};

export default MetricRow;
