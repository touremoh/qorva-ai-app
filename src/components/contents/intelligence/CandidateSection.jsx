import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import RecyclingOutlinedIcon from '@mui/icons-material/RecyclingOutlined';

const getInitials = (name = '') =>
    name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();

const toLabel = (str = '') =>
    str.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().replace(/^\w/, c => c.toUpperCase());

// matchScore is on a 0–1 scale from the API
const scoreColor = (s) => s >= 0.70 ? '#16a34a' : s >= 0.40 ? '#d97706' : '#dc2626';
const scoreBg    = (s) => s >= 0.70 ? 'rgba(22,163,74,0.08)' : s >= 0.40 ? 'rgba(217,119,6,0.08)' : 'rgba(220,38,38,0.08)';

const CandidateSection = ({ candidates, showRediscoveredTag, onCandidateClick }) => {
    if (!candidates?.length) return null;
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {candidates.map((c, i) => (
                <Box key={c.id ?? i} onClick={() => onCandidateClick?.(c)} sx={{
                    display: 'flex',
                    gap: 1.25,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 1.5,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    cursor: onCandidateClick ? 'pointer' : 'default',
                    transition: 'background-color 0.15s ease, border-color 0.15s ease',
                    '&:hover': onCandidateClick ? { backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' } : {},
                }}>
                    {/* Rank + Avatar */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                        <Typography sx={{ fontSize: '0.65rem', color: '#cbd5e1', fontWeight: 600, lineHeight: 1 }}>
                            #{i + 1}
                        </Typography>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#629C44', color: '#fff' }}>
                            {getInitials(c.name)}
                        </Avatar>
                    </Box>

                    {/* Main info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Name row */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 0.25 }}>
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
                                {c.name}
                            </Typography>
                            {c.seniorityLevel && (
                                <Chip
                                    label={toLabel(c.seniorityLevel)}
                                    size="small"
                                    sx={{ fontSize: '0.6rem', height: 16, fontWeight: 600, backgroundColor: 'rgba(99,102,241,0.08)', color: '#4f46e5', border: '1px solid rgba(99,102,241,0.2)', '& .MuiChip-label': { px: 0.75 } }}
                                />
                            )}
                            {showRediscoveredTag && c.rediscovered && (
                                <Chip
                                    icon={<RecyclingOutlinedIcon sx={{ fontSize: 11 }} />}
                                    label="Rediscovered"
                                    size="small"
                                    sx={{ fontSize: '0.6rem', height: 16, backgroundColor: 'rgba(98,156,68,0.08)', border: '1px solid rgba(98,156,68,0.2)', color: '#629C44', '& .MuiChip-icon': { color: '#629C44' }, '& .MuiChip-label': { px: 0.75 } }}
                                />
                            )}
                        </Box>

                        {/* Role + location */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                            {c.currentRole && (
                                <Typography sx={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.2 }}>
                                    {c.currentRole}
                                </Typography>
                            )}
                            {c.locationHint && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                    <LocationOnOutlinedIcon sx={{ fontSize: 11, color: '#cbd5e1' }} />
                                    <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.2 }}>
                                        {c.locationHint}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Top skills */}
                        {c.topSkills?.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
                                {c.topSkills.map((s, si) => (
                                    <Chip
                                        key={si}
                                        label={s}
                                        size="small"
                                        sx={{ fontSize: '0.62rem', height: 17, backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', '& .MuiChip-label': { px: 0.75 } }}
                                    />
                                ))}
                            </Box>
                        )}
                    </Box>

                    {/* Match score */}
                    {c.matchScore != null && (
                        <Box sx={{
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            backgroundColor: scoreBg(c.matchScore),
                            border: `2px solid ${scoreColor(c.matchScore)}30`,
                            alignSelf: 'center',
                        }}>
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: scoreColor(c.matchScore), lineHeight: 1 }}>
                                {Math.round(c.matchScore * 100)}%
                            </Typography>
                        </Box>
                    )}
                </Box>
            ))}
        </Box>
    );
};

export default CandidateSection;
