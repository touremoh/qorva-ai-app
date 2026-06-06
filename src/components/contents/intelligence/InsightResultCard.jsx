import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import MetricRow from './MetricRow.jsx';
import ChartSection from './ChartSection.jsx';
import CandidateSection from './CandidateSection.jsx';
import FollowUpChips from './FollowUpChips.jsx';
import DisclaimerBanner from './DisclaimerBanner.jsx';

const INTENT_CONFIG = {
    TALENT_POOL_INTELLIGENCE:        { label: 'Talent Pool Intelligence',  color: '#4f46e5', bg: 'rgba(79,70,229,0.07)'   },
    TALENT_CLUSTERING:               { label: 'Talent Clustering',         color: '#4f46e5', bg: 'rgba(79,70,229,0.07)'   },
    CANDIDATE_RANKING:               { label: 'Candidate Ranking',         color: '#629C44', bg: 'rgba(98,156,68,0.07)'   },
    CANDIDATE_REDISCOVERY:           { label: 'Candidate Rediscovery',     color: '#0891b2', bg: 'rgba(8,145,178,0.07)'   },
    SKILL_GAP_ANALYSIS:              { label: 'Skill Gap Analysis',        color: '#d97706', bg: 'rgba(217,119,6,0.07)'   },
    GENERAL_RECRUITING_QUESTION:     { label: 'Recruiting Question',       color: '#64748b', bg: 'rgba(100,116,139,0.07)' },
    LOCATION_INTELLIGENCE:           { label: 'Location Intelligence',     color: '#0f766e', bg: 'rgba(15,118,110,0.07)'  },
    SALARY_EXPECTATION_ANALYSIS:     { label: 'Salary Analysis',           color: '#7c3aed', bg: 'rgba(124,58,237,0.07)'  },
    CANDIDATE_COMPARISON:            { label: 'Candidate Comparison',      color: '#0891b2', bg: 'rgba(8,145,178,0.07)'   },
    JOB_DESCRIPTION_ANALYSIS:        { label: 'Job Description Analysis',  color: '#d97706', bg: 'rgba(217,119,6,0.07)'   },
    RESUME_DATA_QUALITY_ANALYSIS:    { label: 'Resume Quality Analysis',   color: '#64748b', bg: 'rgba(100,116,139,0.07)' },
    SENIORITY_DISTRIBUTION_ANALYSIS: { label: 'Seniority Distribution',   color: '#629C44', bg: 'rgba(98,156,68,0.07)'   },
};

const InsightResultCard = ({ result, onFollowUp, onCandidateClick }) => {
    const { intent, answerText, metrics, charts, candidates, followUpQuestions, disclaimer, showRediscoveredTag } = result;
    const cfg = INTENT_CONFIG[intent] ?? INTENT_CONFIG.GENERAL_RECRUITING_QUESTION;

    return (
        <Box sx={{
            backgroundColor: '#ffffff',
            borderRadius: 2.5,
            border: '1px solid #e8edf3',
            borderLeft: `3px solid ${cfg.color}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 0 0 0 transparent',
            overflow: 'hidden',
            mb: 1.5,
            transition: 'box-shadow 0.2s ease',
            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.07)' },
        }}>
            {/* Intent header stripe */}
            <Box sx={{
                px: 2,
                pt: 1.5,
                pb: 1,
                borderBottom: `1px solid ${cfg.color}18`,
                background: `linear-gradient(135deg, ${cfg.bg} 0%, transparent 80%)`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
            }}>
                <PsychologyOutlinedIcon sx={{ fontSize: 15, color: cfg.color, flexShrink: 0 }} />
                <Chip
                    label={cfg.label}
                    size="small"
                    sx={{
                        fontSize: '0.67rem',
                        height: 20,
                        fontWeight: 700,
                        backgroundColor: 'transparent',
                        color: cfg.color,
                        border: 'none',
                        '& .MuiChip-label': { px: 0 },
                    }}
                />
            </Box>

            {/* Card body */}
            <Box sx={{ p: 2 }}>
                {/* Answer text */}
                {answerText && (
                    <Typography sx={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        {answerText}
                    </Typography>
                )}

                {/* Metrics */}
                <MetricRow metrics={metrics} />

                {/* Charts */}
                <ChartSection charts={charts} />

                {/* Candidates */}
                {candidates?.length > 0 && (
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
                            Candidates
                        </Typography>
                        <CandidateSection candidates={candidates} showRediscoveredTag={showRediscoveredTag} onCandidateClick={onCandidateClick} />
                    </Box>
                )}

                {/* Disclaimer */}
                <DisclaimerBanner text={disclaimer} />

                {/* Follow-ups */}
                {followUpQuestions?.length > 0 && (
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                        <FollowUpChips suggestions={followUpQuestions} onSelect={onFollowUp} />
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default InsightResultCard;
