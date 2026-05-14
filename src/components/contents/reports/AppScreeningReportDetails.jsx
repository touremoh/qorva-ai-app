import React, { useState, useEffect } from 'react';
import {
	Avatar, Box, Chip, Divider,
	Paper, Stack, Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';

const THEME_GREEN = '#629C44';

const importanceKey = {
	MANDATORY: 'mandatory', mandatory: 'mandatory',
	IMPORTANT: 'important', important: 'important',
	NICE_TO_HAVE: 'niceToHave', nice_to_have: 'niceToHave',
};

const importanceChipSx = {
	mandatory:  { backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' },
	important:  { backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a' },
	niceToHave: { backgroundColor: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' },
};

const severityChipSx = {
	high:   { backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' },
	medium: { backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a' },
	low:    { backgroundColor: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' },
};

const RECOMMENDATION_CONFIG = {
	strong_interview: { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
	interview:        { bg: '#d1fae5', color: '#059669', border: '#6ee7b7' },
	may_be:           { bg: '#fef9c3', color: '#854d0e', border: '#fde68a' },
	reject:           { bg: '#fee2e2', color: '#dc2626', border: '#fecaca' },
};

const CONFIDENCE_CONFIG = {
	high:   { bg: 'rgba(98,156,68,0.10)',  color: THEME_GREEN },
	medium: { bg: 'rgba(245,158,11,0.10)', color: '#d97706'  },
	low:    { bg: 'rgba(220,38,38,0.10)',  color: '#dc2626'  },
};

const getColor = (v) => v >= 70 ? '#16a34a' : v >= 40 ? '#d97706' : '#dc2626';
const getBg    = (v) => v >= 70 ? '#dcfce7' : v >= 40 ? '#fef9c3' : '#fee2e2';

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, label }) => (
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, pb: 1, borderBottom: `2px solid ${THEME_GREEN}` }}>
		<Icon sx={{ fontSize: 15, color: THEME_GREEN }} />
		<Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: THEME_GREEN, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
			{label}
		</Typography>
	</Box>
);

const ScoreGaugeLarge = ({ value }) => {
	const [animated, setAnimated] = useState(false);
	const r = 62, sw = 12, size = 160;
	const circ = 2 * Math.PI * r;
	const color = getColor(value);
	useEffect(() => { const id = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(id); }, []);
	const offset = animated ? circ * (1 - value / 100) : circ;
	return (
		<Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
				<circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={sw} />
				<circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
					strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
					transform={`rotate(-90 ${size/2} ${size/2})`}
					style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.25,1,0.5,1)', filter: `drop-shadow(0 0 10px ${color}99)` }}
				/>
			</svg>
			<Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
				<Typography sx={{ fontSize: '3.4rem', fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.04em' }}>{value}</Typography>
				<Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>/ 100</Typography>
			</Box>
		</Box>
	);
};

const ScoreGaugeSmall = ({ value }) => {
	const [animated, setAnimated] = useState(false);
	const r = 28, sw = 6, size = 72;
	const circ = 2 * Math.PI * r;
	const color = getColor(value);
	useEffect(() => { const id = setTimeout(() => setAnimated(true), 80); return () => clearTimeout(id); }, []);
	const offset = animated ? circ * (1 - value / 100) : circ;
	return (
		<Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
				<circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={sw} />
				<circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
					strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
					transform={`rotate(-90 ${size/2} ${size/2})`}
					style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.25,1,0.5,1)', filter: `drop-shadow(0 0 5px ${color}70)` }}
				/>
			</svg>
			<Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
			</Box>
		</Box>
	);
};

const DetailScoreCard = ({ icon: Icon, label, score, explanation }) => {
	const color = getColor(score);
	return (
		<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, pb: 0.75, borderBottom: `2px solid ${THEME_GREEN}` }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
					<Icon sx={{ fontSize: 14, color: THEME_GREEN }} />
					<Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: THEME_GREEN, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
						{label}
					</Typography>
				</Box>
				<Chip label={`${score}%`} size="small"
					sx={{ height: 18, fontSize: '0.68rem', fontWeight: 700, backgroundColor: getBg(score), color }} />
			</Box>
			<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
				<ScoreGaugeSmall value={score} />
				<Typography sx={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55, flex: 1, pt: 0.5 }}>
					{explanation}
				</Typography>
			</Box>
		</Paper>
	);
};

// ─── Main component ───────────────────────────────────────────────────────────

const AppScreeningReportDetails = ({ reportData }) => {
	const { t } = useTranslation();

	const candidate = reportData?.candidateInfo;
	const details   = reportData?.matchingReportDetails;
	const decision  = details?.decisionSummary;

	if (!reportData || !candidate || !details) {
		return (
			<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f8fafc', gap: 1.5 }}>
				<AssessmentOutlinedIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
				<Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
					{t('appCVScreening.noAnalysisResult')}
				</Typography>
			</Box>
		);
	}

	const finalScore      = Math.ceil(Number(decision?.finalScore ?? 0));
	const finalColor      = getColor(finalScore);
	const jobTitle        = reportData?.jobPostTitle || '—';
	const nameInitials    = candidate.candidateName.split(' ').slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase();
	const recKey          = (decision?.recommendation || '').toLowerCase();
	const recConfig       = RECOMMENDATION_CONFIG[recKey] ?? RECOMMENDATION_CONFIG.hold;
	const confKey         = (decision?.confidenceLevel || '').toLowerCase();
	const confConfig      = CONFIDENCE_CONFIG[confKey] ?? CONFIDENCE_CONFIG.medium;

	const detailScores = [
		{ key: 'skills',     icon: BuildOutlinedIcon,          label: t('appCVScreening.skillsMatch'),         score: Math.ceil(Number(details.skillsMatch?.score ?? 0)),     explanation: details.skillsMatch?.scoreExplanation },
		{ key: 'experience', icon: TrendingUpOutlinedIcon,     label: t('appCVScreening.experienceAlignment'), score: Math.ceil(Number(details.experienceMatch?.score ?? 0)),  explanation: details.experienceMatch?.scoreExplanation },
		{ key: 'location',   icon: LocationOnOutlinedIcon,     label: t('appCVScreening.locationMatch'),       score: Math.ceil(Number(details.locationMatch?.score ?? 0)),    explanation: details.locationMatch?.scoreExplanation },
		{ key: 'industry',   icon: BusinessCenterOutlinedIcon, label: t('appCVScreening.industryMatch'),       score: Math.ceil(Number(details.industryMatch?.score ?? 0)),    explanation: details.industryMatch?.scoreExplanation },
	];

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', textAlign: 'left' }}>

			{/* ── Sticky header ── */}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 1.5, flexShrink: 0, backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
				<Avatar sx={{ width: 40, height: 40, fontSize: '0.85rem', fontWeight: 700, backgroundColor: THEME_GREEN, color: '#fff' }}>
					{nameInitials}
				</Avatar>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.3 }}>
						{candidate.candidateName}
						{candidate.nbYearsExperience != null && (
							<Typography component="span" sx={{ fontSize: '0.78rem', fontWeight: 400, color: '#64748b', ml: 1 }}>
								• {candidate.nbYearsExperience} {t('appCVContent.yearsAbbr')} {t('appCVContent.experience')}
							</Typography>
						)}
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
						<WorkOutlineOutlinedIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
						<Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{jobTitle}</Typography>
					</Box>
				</Box>
			</Box>

			{/* ── Scrollable body ── */}
			<Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2.5, alignItems: 'flex-start' }}>

				{/* ── Left main column ── */}
				<Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

					{/* HERO: Decision + Final Score */}
					<Paper elevation={0} sx={{
						borderRadius: 3, p: 3,
						border: `1px solid ${finalColor}30`,
						background: `linear-gradient(135deg, ${finalColor}06 0%, ${finalColor}14 100%)`,
					}}>
						<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
							<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0 }}>
								<ScoreGaugeLarge value={finalScore} />
								<Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
									{t('appCVScreening.finalScore')}
								</Typography>
							</Box>
							<Box sx={{ flex: 1, minWidth: 0, pt: 0.5 }}>
								{/* Badges row */}
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
									{recKey && (
										<Chip
											icon={recKey === 'interview' ? <ThumbUpOutlinedIcon sx={{ fontSize: '12px !important' }} /> : recKey === 'reject' ? <ThumbDownOutlinedIcon sx={{ fontSize: '12px !important' }} /> : undefined}
											label={t(`appCVScreening.recommendation.${recKey}`, recKey)}
											size="small"
											sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, backgroundColor: recConfig.bg, color: recConfig.color, border: `1px solid ${recConfig.border}` }}
										/>
									)}
									{confKey && (
										<Chip label={t(`appCVScreening.confidence.${confKey}`, confKey)} size="small"
											sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, backgroundColor: confConfig.bg, color: confConfig.color }} />
									)}
								</Box>
								{/* Headline */}
								{decision?.reportHeadline && (
									<Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.4, mb: 1 }}>
										{decision.reportHeadline}
									</Typography>
								)}
								{/* Summary */}
								<Typography sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.65 }}>
									{decision?.detailedSummary}
								</Typography>
								{/* Short verdict */}
								{decision?.shortVerdict && (
									<Box sx={{ mt: 1.5, px: 1.5, py: 1, borderRadius: 1.5, backgroundColor: 'rgba(98,156,68,0.06)', borderLeft: `3px solid ${THEME_GREEN}` }}>
										<Typography sx={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.6, fontStyle: 'italic' }}>
											{decision.shortVerdict}
										</Typography>
									</Box>
								)}
							</Box>
						</Box>
					</Paper>

					{/* 2×2 detail score grid */}
					<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
						{detailScores.map(item => (
							<DetailScoreCard key={item.key} icon={item.icon} label={item.label} score={item.score} explanation={item.explanation} />
						))}
					</Box>

					{/* Matching Skills */}
					{Array.isArray(details.skillsMatch?.matchingSkills) && details.skillsMatch.matchingSkills.length > 0 && (
						<Paper elevation={0} sx={{ border: '1px solid #bbf7d0', borderRadius: 2.5, p: 2.5, backgroundColor: '#f0fdf4' }}>
							<SectionHeader icon={StarOutlineOutlinedIcon} label={t('appCVScreening.matchingSkills')} />
							<Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
								{details.skillsMatch.matchingSkills.map((sk, i) => (
									<Chip key={`msk-${i}`} label={sk} size="small"
										sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }} />
								))}
							</Stack>
						</Paper>
					)}

					{/* Missing Skills */}
					{details.missingSkills && (
						<Paper elevation={0} sx={{ border: '1px solid #fecaca', borderRadius: 2.5, p: 2.5, backgroundColor: '#fffafa' }}>
							<SectionHeader icon={ErrorOutlineOutlinedIcon} label={t('appCVScreening.lackingSkills')} />
							{details.missingSkills.summary && (
								<Typography sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6, mb: 1.5 }}>
									{details.missingSkills.summary}
								</Typography>
							)}
							{Array.isArray(details.missingSkills.skills) && details.missingSkills.skills.length > 0 && (
								<Box sx={{ display: 'flex', flexDirection: 'column' }}>
									{details.missingSkills.skills.map((item, i) => {
										const ik = importanceKey[item.importance] ?? 'mandatory';
										return (
											<Box key={`ms-${i}`} sx={{
												display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5,
												py: 0.75, px: 0.5,
												borderBottom: i < details.missingSkills.skills.length - 1 ? '1px solid #fee2e2' : 'none',
											}}>
												<Typography sx={{ fontSize: '0.80rem', color: '#334155', flex: 1 }}>{item.skill}</Typography>
												<Chip label={t(`jobContent.${ik}`)} size="small"
													sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, flexShrink: 0, ...importanceChipSx[ik] }} />
											</Box>
										);
									})}
								</Box>
							)}
						</Paper>
					)}

					{/* Strengths */}
					{Array.isArray(details.strengths) && details.strengths.length > 0 && (
						<Paper elevation={0} sx={{ border: '1px solid #bbf7d0', borderRadius: 2.5, p: 2.5 }}>
							<SectionHeader icon={EmojiEventsOutlinedIcon} label={t('appCVScreening.strengths', 'Strengths')} />
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
								{details.strengths.map((s, i) => (
									<Box key={`str-${i}`} sx={{
										borderLeft: '3px solid #629C44', pl: 1.5, py: 0.5,
										borderRadius: '0 8px 8px 0', backgroundColor: 'rgba(98,156,68,0.04)',
									}}>
										<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
											<Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{s.title}</Typography>
											{s.importance && (
												<Chip label={s.importance} size="small"
													sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, flexShrink: 0, backgroundColor: 'rgba(98,156,68,0.12)', color: THEME_GREEN, border: `1px solid rgba(98,156,68,0.25)` }} />
											)}
										</Box>
										<Typography sx={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>{s.evidence}</Typography>
									</Box>
								))}
							</Box>
						</Paper>
					)}

					{/* Weaknesses */}
					{Array.isArray(details.weaknesses) && details.weaknesses.length > 0 && (
						<Paper elevation={0} sx={{ border: '1px solid #fde68a', borderRadius: 2.5, p: 2.5 }}>
							<SectionHeader icon={WarningAmberOutlinedIcon} label={t('appCVScreening.weaknesses', 'Weaknesses')} />
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
								{details.weaknesses.map((w, i) => {
									const sevKey = (w.severity || 'medium').toLowerCase();
									const sevSx  = severityChipSx[sevKey] ?? severityChipSx.medium;
									return (
										<Box key={`wk-${i}`} sx={{
											borderLeft: '3px solid #d97706', pl: 1.5, py: 0.5,
											borderRadius: '0 8px 8px 0', backgroundColor: 'rgba(245,158,11,0.04)',
										}}>
											<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
												<Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{w.title}</Typography>
												{w.severity && (
													<Chip label={w.severity} size="small"
														sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, flexShrink: 0, ...sevSx }} />
												)}
											</Box>
											<Typography sx={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>{w.evidence}</Typography>
										</Box>
									);
								})}
							</Box>
						</Paper>
					)}

					{/* Red Flags */}
					{Array.isArray(details.redFlags) && details.redFlags.length > 0 && (
						<Paper elevation={0} sx={{ border: '1px solid #fecaca', borderRadius: 2.5, p: 2.5 }}>
							<SectionHeader icon={ReportProblemOutlinedIcon} label={t('appCVScreening.redFlags', 'Red Flags')} />
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
								{details.redFlags.map((rf, i) => {
									const sevKey = (rf.severity || 'medium').toLowerCase();
									const sevSx  = severityChipSx[sevKey] ?? severityChipSx.medium;
									return (
										<Box key={`rf-${i}`}>
											<Box sx={{
												borderLeft: '3px solid #dc2626', pl: 1.5, py: 0.5,
												borderRadius: '0 8px 8px 0', backgroundColor: 'rgba(220,38,38,0.04)',
											}}>
												<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
													<Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{rf.title}</Typography>
													{rf.severity && (
														<Chip label={rf.severity} size="small"
															sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, flexShrink: 0, ...sevSx }} />
													)}
												</Box>
												<Typography sx={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>{rf.evidence}</Typography>
											</Box>
											{rf.suggestedInterviewQuestion && (
												<Box sx={{
													mt: 1, mx: 0.5, px: 1.5, py: 1, borderRadius: 1.5,
													backgroundColor: '#f0f9ff', border: '1px solid #bae6fd',
													display: 'flex', alignItems: 'flex-start', gap: 1,
												}}>
													<QuestionAnswerOutlinedIcon sx={{ fontSize: 14, color: '#0369a1', mt: 0.2, flexShrink: 0 }} />
													<Box>
														<Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.25 }}>
															{t('appCVScreening.suggestedQuestion', 'Suggested interview question')}
														</Typography>
														<Typography sx={{ fontSize: '0.78rem', color: '#0c4a6e', lineHeight: 1.55, fontStyle: 'italic' }}>
															{rf.suggestedInterviewQuestion}
														</Typography>
													</Box>
												</Box>
											)}
										</Box>
									);
								})}
							</Box>
						</Paper>
					)}

				</Box>

				{/* ── Right sidebar: Candidate Profile ── */}
				<Box sx={{ width: { xs: '100%', md: '25%' }, maxWidth: { md: 280 }, flexShrink: 0, alignSelf: 'flex-start', position: { md: 'sticky' }, top: 0 }}>
					<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
						<SectionHeader icon={PersonOutlineOutlinedIcon} label={t('appCVScreening.candidateProfile')} />
						{candidate.candidateProfileSummary && (
							<Typography sx={{ fontSize: '0.80rem', color: '#334155', lineHeight: 1.6, mb: 1.5 }}>
								{candidate.candidateProfileSummary}
							</Typography>
						)}
						{Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
							<>
								<Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />
								<Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: THEME_GREEN, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
									{t('appCVScreening.skills')}
								</Typography>
								<Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
									{candidate.skills.map((sk, i) => (
										<Chip key={`sk-${i}`} label={sk} size="small"
											sx={{ height: 22, fontSize: '0.72rem', fontWeight: 500, backgroundColor: 'rgba(98,156,68,0.10)', color: '#166534', border: '1px solid rgba(98,156,68,0.25)' }} />
									))}
								</Stack>
							</>
						)}
					</Paper>
				</Box>

			</Box>
		</Box>
	);
};

AppScreeningReportDetails.propTypes = {
	reportData: PropTypes.shape({
		id: PropTypes.string,
		jobPostId: PropTypes.string,
		jobPostTitle: PropTypes.string,
		candidateInfo: PropTypes.shape({
			candidateId: PropTypes.string,
			candidateName: PropTypes.string.isRequired,
			nbYearsExperience: PropTypes.number,
			candidateProfileSummary: PropTypes.string,
			skills: PropTypes.arrayOf(PropTypes.string),
		}).isRequired,
		matchingReportDetails: PropTypes.shape({
			skillsMatch:     PropTypes.shape({ score: PropTypes.number, scoreExplanation: PropTypes.string, matchingSkills: PropTypes.arrayOf(PropTypes.string) }),
			experienceMatch: PropTypes.shape({ score: PropTypes.number, scoreExplanation: PropTypes.string }),
			locationMatch:   PropTypes.shape({ score: PropTypes.number, scoreExplanation: PropTypes.string }),
			industryMatch:   PropTypes.shape({ score: PropTypes.number, scoreExplanation: PropTypes.string }),
			missingSkills:   PropTypes.shape({ summary: PropTypes.string, skills: PropTypes.arrayOf(PropTypes.shape({ skill: PropTypes.string, importance: PropTypes.string })) }),
			strengths:  PropTypes.arrayOf(PropTypes.shape({ title: PropTypes.string, evidence: PropTypes.string, importance: PropTypes.string })),
			weaknesses: PropTypes.arrayOf(PropTypes.shape({ title: PropTypes.string, evidence: PropTypes.string, severity: PropTypes.string })),
			redFlags:   PropTypes.arrayOf(PropTypes.shape({ title: PropTypes.string, evidence: PropTypes.string, severity: PropTypes.string, suggestedInterviewQuestion: PropTypes.string })),
			decisionSummary: PropTypes.shape({
				reportHeadline:  PropTypes.string,
				finalScore:      PropTypes.number,
				detailedSummary: PropTypes.string,
				shortVerdict:    PropTypes.string,
				recommendation:  PropTypes.string,
				confidenceLevel: PropTypes.string,
			}),
		}).isRequired,
	}),
};

export default AppScreeningReportDetails;
