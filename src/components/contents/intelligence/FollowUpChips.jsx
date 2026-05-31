import React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';

const FollowUpChips = ({ suggestions, onSelect }) => {
    if (!suggestions?.length) return null;
    return (
        <Box sx={{ mt: 1.5 }}>
            <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
                Follow-up suggestions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {suggestions.map((s, i) => (
                    <Chip
                        key={i}
                        label={s}
                        size="small"
                        icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: 13 }} />}
                        onClick={() => onSelect?.(s)}
                        sx={{
                            fontSize: '0.73rem',
                            height: 26,
                            backgroundColor: 'rgba(99,102,241,0.06)',
                            border: '1px solid rgba(99,102,241,0.2)',
                            color: '#4f46e5',
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: 'rgba(99,102,241,0.12)' },
                            '& .MuiChip-icon': { color: '#4f46e5' },
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
};

export default FollowUpChips;
