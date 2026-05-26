import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	Avatar, Box, Chip, Divider, IconButton,
	Paper, Stack, Tooltip, Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useReactToPrint } from 'react-to-print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
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
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import apiClient from '../../../../axiosConfig.js';
import { getTenantById } from '../../../services/tenantService.js';
import { TENANT_ID } from '../../../constants.js';

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

const toLabel = (str = '') =>
	str.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().replace(/^\w/, c => c.toUpperCase());

// skillDepth: generalist | specialist | tShaped | hybrid | unknown
const SKILL_DEPTH_STYLE = {
	specialist: { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', bdr: 'rgba(124,58,237,0.2)' },
	generalist: { color: '#2563eb', bg: 'rgba(37,99,235,0.08)',  bdr: 'rgba(37,99,235,0.2)'  },
	tShaped:    { color: '#0891b2', bg: 'rgba(8,145,178,0.08)',  bdr: 'rgba(8,145,178,0.2)'  },
	hybrid:     { color: '#6366f1', bg: 'rgba(99,102,241,0.08)', bdr: 'rgba(99,102,241,0.2)' },
};
const STYLE_UNKNOWN    = { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', bdr: 'rgba(148,163,184,0.2)' };
const STYLE_GREEN      = { color: '#629C44', bg: 'rgba(98,156,68,0.08)',   bdr: 'rgba(98,156,68,0.2)'   };
const STYLE_AMBER      = { color: '#d97706', bg: 'rgba(245,158,11,0.08)',  bdr: 'rgba(245,158,11,0.2)'  };
const STYLE_SLATE      = { color: '#64748b', bg: 'rgba(100,116,139,0.08)', bdr: 'rgba(100,116,139,0.2)' };

// seniorityLevel: junior | midLevel | senior | lead | principal | manager | director | executive | unknown
const SENIORITY_HIGH = new Set(['senior', 'lead', 'principal', 'manager', 'director', 'executive']);
const getSeniorityStyle = (v) => {
	const lower = (v || '').toLowerCase();
	if (SENIORITY_HIGH.has(lower)) return STYLE_GREEN;
	if (lower === 'midlevel')      return STYLE_AMBER;
	return STYLE_SLATE;
};

// leadershipAndInfluence: none | individualContributor | teamLead | crossFunctionalLeader | strategicLeader | executiveInfluence | unknown
const LEADERSHIP_HIGH = new Set(['crossfunctionalleader', 'strategicleader', 'executiveinfluence']);
const getLeadershipStyle = (v) => {
	const lower = (v || '').toLowerCase();
	if (LEADERSHIP_HIGH.has(lower)) return STYLE_GREEN;
	if (lower === 'teamlead')       return STYLE_AMBER;
	return STYLE_SLATE;
};

// learningVelocity: low | medium | high | veryHigh | unknown
const getVelocityStyle = (v) => {
	const lower = (v || '').toLowerCase();
	if (lower === 'veryhigh') return { color: '#16a34a', bg: 'rgba(22,163,74,0.10)', bdr: 'rgba(22,163,74,0.3)' };
	if (lower === 'high')     return { color: '#629C44', bg: 'rgba(98,156,68,0.10)', bdr: 'rgba(98,156,68,0.3)' };
	if (lower === 'medium')   return STYLE_AMBER;
	if (lower === 'low')      return { color: '#dc2626', bg: 'rgba(220,38,38,0.10)', bdr: 'rgba(220,38,38,0.3)' };
	return STYLE_UNKNOWN;
};

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

const AppMatchingReportDetails = ({ reportData }) => {
	const { t } = useTranslation();

	const componentRef = useRef(null);
	const printReport  = useReactToPrint({ contentRef: componentRef });
	const handleDownload = useCallback(() => printReport(), [printReport]);

	const [tenant, setTenant] = useState(null);
	const [tenantLogoUrl, setTenantLogoUrl] = useState('');

	useEffect(() => {
		const tenantId = localStorage.getItem(TENANT_ID);
		if (!tenantId) return;
		getTenantById(tenantId)
			.then(res => setTenant(res?.data?.data ?? null))
			.catch(() => {});
	}, []);

	useEffect(() => {
		if (!tenant?.companyLogoUrl) { setTenantLogoUrl(''); return; }
		let objectUrl = '';
		apiClient.get('/tenants/logo', { responseType: 'blob' })
			.then(res => {
				objectUrl = URL.createObjectURL(res.data);
				setTenantLogoUrl(objectUrl);
			})
			.catch(() => setTenantLogoUrl(''));
		return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
	}, [tenant?.companyLogoUrl]);

	const candidate = reportData?.candidateInfo;
	const details   = reportData?.matchingReportDetails;
	const decision  = details?.decisionSummary;

	if (!reportData || !candidate || !details) {
		return (
			<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f8fafc', gap: 1.5 }}>
				<AssessmentOutlinedIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
				<Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
					{t('appCVMatching.noAnalysisResult')}
				</Typography>
			</Box>
		);
	}

	const finalScore   = Math.ceil(Number(decision?.finalScore ?? 0));
	const finalColor   = getColor(finalScore);
	const jobTitle     = reportData?.jobPostTitle || '—';
	const nameInitials = candidate.candidateName.split(' ').slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase();
	const recKey       = (decision?.recommendation || '').toLowerCase();
	const recConfig    = RECOMMENDATION_CONFIG[recKey] ?? RECOMMENDATION_CONFIG.hold;
	const confKey      = (decision?.confidenceLevel || '').toLowerCase();
	const confConfig   = CONFIDENCE_CONFIG[confKey] ?? CONFIDENCE_CONFIG.medium;

	const detailScores = [
		{ key: 'skills',     icon: BuildOutlinedIcon,          label: t('appCVMatching.skillsMatch'),         score: Math.ceil(Number(details.skillsMatch?.score ?? 0)),     explanation: details.skillsMatch?.scoreSummary },
		{ key: 'experience', icon: TrendingUpOutlinedIcon,     label: t('appCVMatching.experienceAlignment'), score: Math.ceil(Number(details.experienceMatch?.score ?? 0)),  explanation: details.experienceMatch?.scoreSummary },
		{ key: 'location',   icon: LocationOnOutlinedIcon,     label: t('appCVMatching.locationMatch'),       score: Math.ceil(Number(details.locationMatch?.score ?? 0)),    explanation: details.locationMatch?.scoreSummary },
		{ key: 'industry',   icon: BusinessCenterOutlinedIcon, label: t('appCVMatching.industryMatch'),       score: Math.ceil(Number(details.industryMatch?.score ?? 0)),    explanation: details.industryMatch?.scoreSummary },
	];

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', textAlign: 'left' }}>

			{/* ── Action bar — not printed ── */}
			<Box sx={{
				display: 'flex', alignItems: 'center',
				px: 2.5, py: 1.25, flexShrink: 0,
				backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0',
			}}>
				<Box sx={{ flexGrow: 1 }} />
				<Tooltip title={t('appCVContent.downloadCV')}>
					<IconButton
						size="small"
						onClick={handleDownload}
						sx={{
							color: '#64748b', borderRadius: 1.5,
							border: '1px solid #e2e8f0',
							'&:hover': { backgroundColor: '#f1f5f9' },
						}}
					>
						<FileDownloadIcon sx={{ fontSize: 16 }} />
					</IconButton>
				</Tooltip>
			</Box>

			{/* ── Printable content ── */}
			<Box ref={componentRef} sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

				{/* Company branding */}
				{tenant && (
					<Box sx={{
						display: 'flex', alignItems: 'center', gap: 2,
						px: 3, py: 1.5, flexShrink: 0,
						backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0',
					}}>
						{tenantLogoUrl ? (
							<Box
								component="img"
								src={tenantLogoUrl}
								alt={tenant.tenantName}
								sx={{ height: 36, maxWidth: 100, objectFit: 'contain', flexShrink: 0 }}
							/>
						) : (
							<Box sx={{
								width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
								display: 'flex', alignItems: 'center', justifyContent: 'center',
								backgroundColor: 'rgba(98,156,68,0.08)', border: '1px solid rgba(98,156,68,0.2)',
							}}>
								<BusinessOutlinedIcon sx={{ fontSize: 18, color: THEME_GREEN }} />
							</Box>
						)}
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', lineHeight: 1.3 }}>
								{tenant.tenantName}
							</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.4 }}>
								{tenant.contactEmail && (
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
										<EmailIcon sx={{ fontSize: 11, color: '#94a3b8' }} />
										<Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
											{tenant.contactEmail}
										</Typography>
									</Box>
								)}
								{tenant.phoneNumber && (
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
										<PhoneIcon sx={{ fontSize: 11, color: '#94a3b8' }} />
										<Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
											{tenant.phoneNumber}
										</Typography>
									</Box>
								)}
								{tenant.websiteUrl && (
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
										<LanguageIcon sx={{ fontSize: 11, color: '#94a3b8' }} />
										<Typography
											component="a"
											href={tenant.websiteUrl}
											target="_blank"
											rel="noopener noreferrer"
											sx={{ fontSize: '0.72rem', color: THEME_GREEN, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
										>
											{tenant.websiteUrl.replace(/^https?:\/\//, '')}
										</Typography>
									</Box>
								)}
							</Box>
						</Box>
						<Typography sx={{ fontSize: '0.65rem', color: '#cbd5e1', fontStyle: 'italic', flexShrink: 0, alignSelf: 'flex-start' }}>
							{t('appCVContent.presentedBy')}
						</Typography>
					</Box>
				)}

				{/* Candidate header — sticky on screen, prints with content */}
				<Box sx={{
					display: 'flex', alignItems: 'center', gap: 2,
					px: 3, py: 1.5, flexShrink: 0,
					backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0',
					position: 'sticky', top: 0, zIndex: 1,
				}}>
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

				{/* Report body */}
				<Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2.5, alignItems: 'flex-start' }}>

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
										{t('appCVMatching.finalScore')}
									</Typography>
								</Box>
								<Box sx={{ flex: 1, minWidth: 0, pt: 0.5 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
										{recKey && (
											<Chip
												icon={recKey === 'interview' ? <ThumbUpOutlinedIcon sx={{ fontSize: '12px !important' }} /> : recKey === 'reject' ? <ThumbDownOutlinedIcon sx={{ fontSize: '12px !important' }} /> : undefined}
												label={t(`appCVMatching.recommendation.${recKey}`, recKey)}
												size="small"
												sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, backgroundColor: recConfig.bg, color: recConfig.color, border: `1px solid ${recConfig.border}` }}
											/>
										)}
										{confKey && (
											<Chip label={t(`appCVMatching.confidence.${confKey}`, confKey)} size="small"
												sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, backgroundColor: confConfig.bg, color: confConfig.color }} />
										)}
									</Box>
									{decision?.reportHeadline && (
										<Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.4, mb: 1 }}>
											{decision.reportHeadline}
										</Typography>
									)}
									<Typography sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.65 }}>
										{decision?.detailedSummary}
									</Typography>
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
								<SectionHeader icon={StarOutlineOutlinedIcon} label={t('appCVMatching.matchingSkills')} />
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
								<SectionHeader icon={ErrorOutlineOutlinedIcon} label={t('appCVMatching.lackingSkills')} />
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
								<SectionHeader icon={EmojiEventsOutlinedIcon} label={t('appCVMatching.strengths', 'Strengths')} />
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
								<SectionHeader icon={WarningAmberOutlinedIcon} label={t('appCVMatching.weaknesses', 'Weaknesses')} />
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
								<SectionHeader icon={ReportProblemOutlinedIcon} label={t('appCVMatching.redFlags', 'Red Flags')} />
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
																{t('appCVMatching.suggestedQuestion', 'Suggested interview question')}
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

					{/* ── Right sidebar: Candidate Profile + Clustering ── */}
					<Box sx={{ width: { xs: '100%', md: '30%' }, maxWidth: { md: 340 }, flexShrink: 0, alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 2 }}>

						{/* Candidate Profile */}
						<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
							<SectionHeader icon={PersonOutlineOutlinedIcon} label={t('appCVMatching.candidateProfile')} />
							{candidate.candidateProfileSummary && (
								<Typography sx={{ fontSize: '0.80rem', color: '#334155', lineHeight: 1.6, mb: 1.5 }}>
									{candidate.candidateProfileSummary}
								</Typography>
							)}
							{Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
								<>
									<Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />
									<Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: THEME_GREEN, textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
										{t('appCVMatching.skills')}
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

						{/* Candidate Clustering */}
						{candidate.candidateClustering && (() => {
							const cl = candidate.candidateClustering;
							const attrRows = [
								{ key: 'skillDepth',             label: t('appCVMatching.clustering.skillDepth'),      value: cl.skillDepth,             ...(SKILL_DEPTH_STYLE[cl.skillDepth] ?? STYLE_UNKNOWN) },
								{ key: 'seniorityLevel',         label: t('appCVMatching.clustering.seniority'),        value: cl.seniorityLevel,         ...getSeniorityStyle(cl.seniorityLevel) },
								{ key: 'leadershipAndInfluence', label: t('appCVMatching.clustering.leadership'),       value: cl.leadershipAndInfluence, ...getLeadershipStyle(cl.leadershipAndInfluence) },
								{ key: 'learningVelocity',       label: t('appCVMatching.clustering.learningVelocity'), value: cl.learningVelocity,       ...getVelocityStyle(cl.learningVelocity) },
							].filter(r => r.value && r.value !== 'unknown');
							const confPct = cl.clusterConfidenceScore != null
								? Math.round(cl.clusterConfidenceScore * 100) : null;
							return (
								<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
									<SectionHeader icon={HubOutlinedIcon} label={t('appCVMatching.clustering.sectionTitle')} />

									{/* Primary cluster */}
									{cl.primaryCluster && (
										<Chip label={cl.primaryCluster} size="small" sx={{
											mb: 1.5, height: 'auto', py: 0.5, fontSize: '0.75rem', fontWeight: 700, width: '100%',
											backgroundColor: 'rgba(99,102,241,0.08)', color: '#4f46e5',
											border: '1px solid rgba(99,102,241,0.2)', borderRadius: 1.5,
											'& .MuiChip-label': { whiteSpace: 'normal', textAlign: 'center' },
										}} />
									)}

									{/* Secondary clusters */}
									{Array.isArray(cl.secondaryClusters) && cl.secondaryClusters.length > 0 && (
										<>
											<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
												{t('appCVMatching.clustering.secondaryClusters')}
											</Typography>
											<Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
												{cl.secondaryClusters.map((sc, i) => (
													<Chip key={`sc-${i}`} label={sc} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 500, backgroundColor: 'rgba(99,102,241,0.05)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.15)' }} />
												))}
											</Stack>
										</>
									)}

									{/* Functional expertise */}
									{Array.isArray(cl.functionalExpertise) && cl.functionalExpertise.length > 0 && (
										<>
											<Divider sx={{ my: 1.25, borderColor: '#f1f5f9' }} />
											<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: THEME_GREEN, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
												{t('appCVMatching.clustering.functionalExpertise')}
											</Typography>
											<Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
												{cl.functionalExpertise.map((fe, i) => (
													<Chip key={`fe-${i}`} label={fe} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 500, backgroundColor: 'rgba(98,156,68,0.08)', color: '#166534', border: '1px solid rgba(98,156,68,0.2)' }} />
												))}
											</Stack>
										</>
									)}

									{/* Attribute rows */}
									{attrRows.length > 0 && (
										<>
											<Divider sx={{ my: 1.25, borderColor: '#f1f5f9' }} />
											<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
												{attrRows.map(row => (
													<Box key={row.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
														<Typography sx={{ fontSize: '0.68rem', color: '#64748b', flexShrink: 0 }}>
															{row.label}
														</Typography>
														<Chip label={toLabel(row.value)} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, backgroundColor: row.bg, color: row.color, border: `1px solid ${row.bdr}` }} />
													</Box>
												))}
											</Box>
										</>
									)}

									{/* Industry domains */}
									{Array.isArray(cl.industryDomains) && cl.industryDomains.length > 0 && (
										<>
											<Divider sx={{ my: 1.25, borderColor: '#f1f5f9' }} />
											<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
												{t('appCVMatching.clustering.industryDomains')}
											</Typography>
											<Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
												{cl.industryDomains.map((d, i) => (
													<Chip key={`id-${i}`} label={d} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 500, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }} />
												))}
											</Stack>
										</>
									)}

									{/* Environment fit */}
									{Array.isArray(cl.environmentFit) && cl.environmentFit.length > 0 && (
										<>
											<Divider sx={{ my: 1.25, borderColor: '#f1f5f9' }} />
											<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
												{t('appCVMatching.clustering.environmentFit')}
											</Typography>
											<Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
												{cl.environmentFit.map((e, i) => (
													<Chip key={`ef-${i}`} label={toLabel(e)} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 500, backgroundColor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }} />
												))}
											</Stack>
										</>
									)}

									{/* Business impact */}
									{Array.isArray(cl.businessImpact) && cl.businessImpact.length > 0 && (
										<>
											<Divider sx={{ my: 1.25, borderColor: '#f1f5f9' }} />
											<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
												{t('appCVMatching.clustering.businessImpact')}
											</Typography>
											<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
												{cl.businessImpact.map((impact, i) => (
													<Box key={`bi-${i}`} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
														<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 12, color: THEME_GREEN, mt: 0.25, flexShrink: 0 }} />
														<Typography sx={{ fontSize: '0.73rem', color: '#334155', lineHeight: 1.5 }}>
															{impact}
														</Typography>
													</Box>
												))}
											</Box>
										</>
									)}

									{/* Cluster confidence */}
									{confPct != null && (
										<>
											<Divider sx={{ my: 1.25, borderColor: '#f1f5f9' }} />
											<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
												<Typography sx={{ fontSize: '0.60rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
													{t('appCVMatching.clustering.confidence')}
												</Typography>
												<Typography sx={{ fontSize: '0.70rem', fontWeight: 700, color: THEME_GREEN }}>
													{confPct}%
												</Typography>
											</Box>
											<Box sx={{ height: 4, backgroundColor: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
												<Box sx={{ height: '100%', width: `${confPct}%`, backgroundColor: THEME_GREEN, borderRadius: 99 }} />
											</Box>
										</>
									)}

									{/* Reasoning */}
									{cl.clusterReasoning && (
										<>
											<Divider sx={{ my: 1.25, borderColor: '#f1f5f9' }} />
											<Typography sx={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.6, fontStyle: 'italic' }}>
												{cl.clusterReasoning}
											</Typography>
										</>
									)}
								</Paper>
							);
						})()}

					</Box>

				</Box>
			</Box>
		</Box>
	);
};

AppMatchingReportDetails.propTypes = {
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
			skillsMatch:     PropTypes.shape({ score: PropTypes.number, scoreSummary: PropTypes.string, matchingSkills: PropTypes.arrayOf(PropTypes.string) }),
			experienceMatch: PropTypes.shape({ score: PropTypes.number, scoreSummary: PropTypes.string }),
			locationMatch:   PropTypes.shape({ score: PropTypes.number, scoreSummary: PropTypes.string }),
			industryMatch:   PropTypes.shape({ score: PropTypes.number, scoreSummary: PropTypes.string }),
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

export default AppMatchingReportDetails;
