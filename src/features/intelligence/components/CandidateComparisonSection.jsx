import Box from '@mui/material/Box';
import { getInitials } from '../../../shared/lib/text.js';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import * as tokens from '../../../theme/tokens.js';

const ACCENT = tokens.status.info.bright;

const CandidateComparisonSection = ({ candidates = [], rawData = {}, onCandidateClick }) => {
    const { t } = useTranslation();
    const { commonSkills = [], differentiatingSkills = {}, candidateDetails = {}, jobPost } = rawData;

    return (
        <Box>
            {/* Optional job context banner */}
            {jobPost?.title && (
                <Box sx={{
                    display: 'flex', alignItems: 'flex-start', gap: 1,
                    px: 1.5, py: 1, mb: 1.5, borderRadius: 1.5,
                    backgroundColor: 'rgba(8,145,178,0.05)', border: '1px solid rgba(8,145,178,0.15)',
                }}>
                    <WorkOutlineOutlinedIcon sx={{ fontSize: 14, color: ACCENT, mt: 0.15, flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: ACCENT, mb: 0.4 }}>
                            {t('insight.comparison.jobContext')} · {jobPost.title}
                        </Typography>
                        {jobPost.requiredSkills?.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
                                {jobPost.requiredSkills.map((s, i) => (
                                    <Chip key={i} label={s} size="small" sx={{
                                        fontSize: '0.60rem', height: 16,
                                        backgroundColor: 'rgba(8,145,178,0.08)', color: ACCENT,
                                        border: '1px solid rgba(8,145,178,0.2)',
                                        '& .MuiChip-label': { px: 0.75 },
                                    }} />
                                ))}
                            </Box>
                        )}
                    </Box>
                </Box>
            )}

            {/* Candidate cards — two-column grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1.25 }}>
                {candidates.map((c) => {
                    const ref = c.applicantNumber;
                    const details = candidateDetails[ref] ?? {};
                    const uniqueSkills = differentiatingSkills[ref] ?? [];

                    return (
                        <Box
                            key={c.id ?? ref}
                            onClick={() => onCandidateClick?.(c)}
                            sx={{
                                p: 1.5, borderRadius: 2,
                                border: `1px solid ${tokens.line.main}`,
                                backgroundColor: tokens.surface.subtle,
                                cursor: onCandidateClick ? 'pointer' : 'default',
                                transition: 'border-color 0.15s, background-color 0.15s',
                                '&:hover': onCandidateClick ? { backgroundColor: tokens.surface.muted, borderColor: tokens.line.strong } : {},
                                display: 'flex', flexDirection: 'column', gap: 1,
                            }}
                        >
                            {/* Header: avatar + name + role */}
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                <Avatar sx={{ width: 34, height: 34, fontSize: '0.72rem', fontWeight: 700, backgroundColor: ACCENT, color: tokens.ink.inverse, flexShrink: 0 }}>
                                    {getInitials(c.name)}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: tokens.ink.strong, lineHeight: 1.2 }}>
                                        {c.name}
                                    </Typography>
                                    {c.currentRole && (
                                        <Typography sx={{ fontSize: '0.70rem', color: tokens.ink.muted, mt: 0.2 }}>
                                            {c.currentRole}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            {/* Stat pills: years exp + seniority */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {details.yearsOfExperience != null && (
                                    <Chip label={`${details.yearsOfExperience} ${t('insight.comparison.yearsExperience')}`} size="small" sx={{
                                        fontSize: '0.62rem', height: 18, fontWeight: 600,
                                        backgroundColor: 'rgba(8,145,178,0.08)', color: ACCENT,
                                        border: '1px solid rgba(8,145,178,0.18)',
                                        '& .MuiChip-label': { px: 0.75 },
                                    }} />
                                )}
                                {c.seniorityLevel && (
                                    <Chip
                                        label={t(`dashboard.talent.labels.${c.seniorityLevel}`, c.seniorityLevel)}
                                        size="small"
                                        sx={{ fontSize: '0.62rem', height: 18, fontWeight: 600, backgroundColor: 'rgba(99,102,241,0.08)', color: tokens.status.accent.main, border: '1px solid rgba(99,102,241,0.2)', '& .MuiChip-label': { px: 0.75 } }}
                                    />
                                )}
                                {details.skillDepth && (
                                    <Chip
                                        label={t(`dashboard.talent.labels.${details.skillDepth}`, details.skillDepth)}
                                        size="small"
                                        sx={{ fontSize: '0.62rem', height: 18, fontWeight: 600, backgroundColor: tokens.surface.muted, color: tokens.ink.soft, border: `1px solid ${tokens.line.main}`, '& .MuiChip-label': { px: 0.75 } }}
                                    />
                                )}
                                {details.leadership && details.leadership !== 'none' && (
                                    <Chip
                                        label={t(`dashboard.talent.labels.${details.leadership}`, details.leadership)}
                                        size="small"
                                        sx={{ fontSize: '0.62rem', height: 18, fontWeight: 600, backgroundColor: tokens.surface.muted, color: tokens.ink.soft, border: `1px solid ${tokens.line.main}`, '& .MuiChip-label': { px: 0.75 } }}
                                    />
                                )}
                            </Box>

                            {/* Differentiating skills */}
                            {uniqueSkills.length > 0 && (
                                <Box>
                                    <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.5 }}>
                                        {t('insight.comparison.differentiatingSkills')}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
                                        {uniqueSkills.map((s, i) => (
                                            <Chip key={i} label={s} size="small" sx={{
                                                fontSize: '0.60rem', height: 16,
                                                backgroundColor: tokens.surface.paper, color: tokens.ink.soft,
                                                border: `1px solid ${tokens.line.main}`,
                                                '& .MuiChip-label': { px: 0.6 },
                                            }} />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Certifications */}
                            {details.certifications?.length > 0 && (
                                <Typography sx={{ fontSize: '0.68rem', color: tokens.ink.muted, lineHeight: 1.5 }}>
                                    <Box component="span" sx={{ fontWeight: 700, color: tokens.ink.soft }}>
                                        {t('insight.comparison.certifications')}:{' '}
                                    </Box>
                                    {details.certifications.join(', ')}
                                </Typography>
                            )}
                        </Box>
                    );
                })}
            </Box>

            {/* Common skills */}
            {commonSkills.length > 0 && (
                <Box sx={{ mt: 1.25, pt: 1.25, borderTop: `1px solid ${tokens.surface.muted}` }}>
                    <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.75 }}>
                        {t('insight.comparison.commonSkills')}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
                        {commonSkills.map((s, i) => (
                            <Chip key={i} label={s} size="small" sx={{
                                fontSize: '0.62rem', height: 18,
                                backgroundColor: 'rgba(8,145,178,0.07)', color: ACCENT,
                                border: '1px solid rgba(8,145,178,0.2)',
                                '& .MuiChip-label': { px: 0.75 },
                            }} />
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

CandidateComparisonSection.propTypes = {
    candidates: PropTypes.arrayOf(PropTypes.object),
    rawData: PropTypes.object,
    onCandidateClick: PropTypes.func,
};

export default CandidateComparisonSection;
