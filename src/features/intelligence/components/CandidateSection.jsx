import Box from '@mui/material/Box';
import { scoreColorsFor } from '../../../shared/lib/score.js';
import { getInitials, toLabel } from '../../../shared/lib/text.js';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import RecyclingOutlinedIcon from '@mui/icons-material/RecyclingOutlined';
import PropTypes from 'prop-types';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

// matchScore is on a 0–1 scale from the API
const scoreColor = (s) => scoreColorsFor(s, 1).main;
const scoreBg    = (s) => scoreColorsFor(s, 1).soft;

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
                    backgroundColor: tokens.surface.subtle,
                    border: `1px solid ${tokens.surface.muted}`,
                    cursor: onCandidateClick ? 'pointer' : 'default',
                    transition: 'background-color 0.15s ease, border-color 0.15s ease',
                    '&:hover': onCandidateClick ? { backgroundColor: tokens.surface.muted, borderColor: tokens.line.strong } : {},
                }}>
                    {/* Rank + Avatar */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                        <Typography sx={{ fontSize: '0.65rem', color: tokens.ink.faint, fontWeight: 600, lineHeight: 1 }}>
                            #{i + 1}
                        </Typography>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.7rem', fontWeight: 700, backgroundColor: tokens.brand.main, color: tokens.ink.inverse }}>
                            {getInitials(c.name)}
                        </Avatar>
                    </Box>

                    {/* Main info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Name row */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 0.25 }}>
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: tokens.ink.strong, lineHeight: 1.2 }}>
                                {c.name}
                            </Typography>
                            {c.seniorityLevel && (
                                <Chip
                                    label={toLabel(c.seniorityLevel)}
                                    size="small"
                                    sx={{ fontSize: '0.6rem', height: 16, fontWeight: 600, backgroundColor: 'rgba(99,102,241,0.08)', color: tokens.status.accent.main, border: '1px solid rgba(99,102,241,0.2)', '& .MuiChip-label': { px: 0.75 } }}
                                />
                            )}
                            {showRediscoveredTag && c.rediscovered && (
                                <Chip
                                    icon={<RecyclingOutlinedIcon sx={{ fontSize: 11 }} />}
                                    label="Rediscovered"
                                    size="small"
                                    sx={{ fontSize: '0.6rem', height: 16, backgroundColor: alpha(tokens.brand.main, 0.08), border: `1px solid ${alpha(tokens.brand.main, 0.2)}`, color: tokens.brand.text, '& .MuiChip-icon': { color: tokens.brand.text }, '& .MuiChip-label': { px: 0.75 } }}
                                />
                            )}
                        </Box>

                        {/* Role + location */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                            {c.currentRole && (
                                <Typography sx={{ fontSize: '0.72rem', color: tokens.ink.muted, lineHeight: 1.2 }}>
                                    {c.currentRole}
                                </Typography>
                            )}
                            {c.locationHint && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                    <LocationOnOutlinedIcon sx={{ fontSize: 11, color: tokens.ink.faint }} />
                                    <Typography sx={{ fontSize: '0.68rem', color: tokens.ink.subtle, lineHeight: 1.2 }}>
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
                                        sx={{ fontSize: '0.62rem', height: 17, backgroundColor: tokens.surface.muted, color: tokens.ink.soft, border: `1px solid ${tokens.line.main}`, '& .MuiChip-label': { px: 0.75 } }}
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

CandidateSection.propTypes = {
    candidates: PropTypes.arrayOf(PropTypes.object),
    showRediscoveredTag: PropTypes.bool,
    onCandidateClick: PropTypes.func,
};

export default CandidateSection;
