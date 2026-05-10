// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import {
	Avatar, Box, Button, Chip, Dialog, Divider,
	IconButton, Paper, Stack, Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import axios from 'axios';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';

const THEME_GREEN = '#629C44';

const importanceI18nKey = {
	MANDATORY: 'mandatory', mandatory: 'mandatory',
	IMPORTANT: 'important', important: 'important',
	NICE_TO_HAVE: 'niceToHave', nice_to_have: 'niceToHave',
};

const importanceChipSx = {
	mandatory:   { backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' },
	important:   { backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a' },
	niceToHave:  { backgroundColor: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' },
};

const getColor = (value) => {
	if (value >= 70) return '#16a34a';
	if (value >= 40) return '#d97706';
	return '#dc2626';
};

const getBgColor = (value) => {
	if (value >= 70) return '#dcfce7';
	if (value >= 40) return '#fef9c3';
	return '#fee2e2';
};

const SectionHeader = ({ icon: Icon, label }) => (
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, pb: 1, borderBottom: `2px solid ${THEME_GREEN}` }}>
		<Icon sx={{ fontSize: 16, color: THEME_GREEN }} />
		<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: THEME_GREEN, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
			{label}
		</Typography>
	</Box>
);

const ScoreGaugeLarge = ({ value }) => {
	const [animated, setAnimated] = useState(false);
	const r = 62, sw = 12, size = 160;
	const circ = 2 * Math.PI * r;
	const color = getColor(value);

	useEffect(() => {
		const id = setTimeout(() => setAnimated(true), 100);
		return () => clearTimeout(id);
	}, []);

	const offset = animated ? circ * (1 - value / 100) : circ;

	return (
		<Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
				<circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={sw} />
				<circle
					cx={size / 2} cy={size / 2} r={r}
					fill="none" stroke={color} strokeWidth={sw}
					strokeLinecap="round"
					strokeDasharray={circ}
					strokeDashoffset={offset}
					transform={`rotate(-90 ${size / 2} ${size / 2})`}
					style={{
						transition: 'stroke-dashoffset 1.4s cubic-bezier(0.25, 1, 0.5, 1)',
						filter: `drop-shadow(0 0 10px ${color}99)`,
					}}
				/>
			</svg>
			<Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
				<Typography sx={{ fontSize: '3.4rem', fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.04em' }}>
					{value}
				</Typography>
				<Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
					/ 100
				</Typography>
			</Box>
		</Box>
	);
};

const ScoreGaugeSmall = ({ value }) => {
	const [animated, setAnimated] = useState(false);
	const r = 28, sw = 6, size = 72;
	const circ = 2 * Math.PI * r;
	const color = getColor(value);

	useEffect(() => {
		const id = setTimeout(() => setAnimated(true), 80);
		return () => clearTimeout(id);
	}, []);

	const offset = animated ? circ * (1 - value / 100) : circ;

	return (
		<Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
				<circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={sw} />
				<circle
					cx={size / 2} cy={size / 2} r={r}
					fill="none" stroke={color} strokeWidth={sw}
					strokeLinecap="round"
					strokeDasharray={circ}
					strokeDashoffset={offset}
					transform={`rotate(-90 ${size / 2} ${size / 2})`}
					style={{
						transition: 'stroke-dashoffset 1s cubic-bezier(0.25, 1, 0.5, 1)',
						filter: `drop-shadow(0 0 5px ${color}70)`,
					}}
				/>
			</svg>
			<Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.02em' }}>
					{value}
				</Typography>
			</Box>
		</Box>
	);
};

const DetailScoreCard = ({ icon: Icon, label, score, explanation, sx }) => {
	const color = getColor(score);
	return (
		<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2, display: 'flex', flexDirection: 'column', ...sx }}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, pb: 0.75, borderBottom: `2px solid ${THEME_GREEN}`, flexShrink: 0 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
					<Icon sx={{ fontSize: 14, color: THEME_GREEN }} />
					<Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: THEME_GREEN, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
						{label}
					</Typography>
				</Box>
				<Chip
					label={`${score}%`}
					size="small"
					sx={{ height: 18, fontSize: '0.68rem', fontWeight: 700, backgroundColor: getBgColor(score), color }}
				/>
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

const AppScreeningReportDetails = ({ reportData }) => {
	const { t } = useTranslation();
	const [cvData, setCvData] = useState(null);
	const [openCvDialog, setOpenCvDialog] = useState(false);

	const candidate = reportData?.candidateInfo;
	const details = reportData?.aiAnalysisReportDetails;

	const handleOpenCv = async () => {
		if (reportData?.candidateCVID) {
			try {
				const response = await axios.get(`/cvs/${reportData.candidateCVID}`);
				setCvData(response.data);
				setOpenCvDialog(true);
			} catch (error) {
				console.error('Error fetching CV data', error);
			}
		}
	};

	if (!reportData || !candidate || !details) {
		return (
			<Box sx={{
				flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
				height: '100%', backgroundColor: '#f8fafc', gap: 1.5,
			}}>
				<AssessmentOutlinedIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
				<Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
					{t('appCVScreening.noAnalysisResult')}
				</Typography>
			</Box>
		);
	}

	const finalScore = Math.ceil(Number(details?.finalScore?.score ?? 0));
	const finalScoreColor = getColor(finalScore);
	const jobTitle = reportData?.jobPostTitle || 'Unknown job';
	const nameInitials = candidate.candidateName
		.split(' ').slice(0, 2).map((p) => p[0] ?? '').join('').toUpperCase();

	const detailScores = [
		{
			key: 'skillsMatch',
			icon: BuildOutlinedIcon,
			label: t('appCVScreening.skillsMatch'),
			score: Math.ceil(Number(details?.skillsMatch?.score ?? 0)),
			explanation: details?.skillsMatch?.scoreExplanation,
		},
		{
			key: 'experienceMatch',
			icon: TrendingUpOutlinedIcon,
			label: t('appCVScreening.experienceAlignment'),
			score: Math.ceil(Number(details?.experienceMatch?.score ?? 0)),
			explanation: details?.experienceMatch?.scoreExplanation,
		},
		{
			key: 'locationMatch',
			icon: LocationOnOutlinedIcon,
			label: t('appCVScreening.locationMatch'),
			score: Math.ceil(Number(details?.locationMatch?.score ?? 0)),
			explanation: details?.locationMatch?.scoreExplanation,
		},
		{
			key: 'industryMatch',
			icon: BusinessCenterOutlinedIcon,
			label: t('appCVScreening.industryMatch'),
			score: Math.ceil(Number(details?.industryMatch?.score ?? 0)),
			explanation: details?.industryMatch?.scoreExplanation,
		},
	];

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', textAlign: 'left' }}>

			{/* Sticky header */}
			<Box sx={{
				display: 'flex', alignItems: 'center', gap: 2,
				px: 3, py: 1.5, flexShrink: 0,
				backgroundColor: '#ffffff',
				borderBottom: '1px solid #e2e8f0',
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
				{reportData?.candidateCVID && (
					<Button
						variant="outlined"
						size="small"
						onClick={handleOpenCv}
						sx={{
							borderRadius: 2, fontSize: '0.75rem', fontWeight: 600,
							borderColor: THEME_GREEN, color: THEME_GREEN,
							'&:hover': { borderColor: '#4a7a33', backgroundColor: 'rgba(98,156,68,0.06)' },
						}}
					>
						{t('appCVScreening.seeCvDetails')}
					</Button>
				)}
			</Box>

			{/* Scrollable body */}
			<Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2.5, alignItems: 'flex-start' }}>

				{/* Main content column */}
				<Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

					{/* HERO: Final Score */}
					<Paper elevation={0} sx={{
						borderRadius: 3,
						border: `1px solid ${finalScoreColor}30`,
						background: `linear-gradient(135deg, ${finalScoreColor}08 0%, ${finalScoreColor}1a 100%)`,
						p: 3,
					}}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
							<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
								<ScoreGaugeLarge value={finalScore} />
								<Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
									{t('appCVScreening.finalScore')}
								</Typography>
							</Box>
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: THEME_GREEN, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
									{t('appCVScreening.overallSummary')}
								</Typography>
								<Typography sx={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.65 }}>
									{details?.finalScore?.scoreExplanation}
								</Typography>
							</Box>
						</Box>
					</Paper>

					{/* 2×2 detail score grid — flat CSS grid: same-row cards are always equal height by default */}
					<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
						{detailScores.map((item) => (
							<DetailScoreCard key={item.key} icon={item.icon} label={item.label} score={item.score} explanation={item.explanation} />
						))}
					</Box>

					{/* Matching Skills */}
					{Array.isArray(details?.skillsMatch?.matchingSkills) && details.skillsMatch.matchingSkills.length > 0 && (
						<Paper elevation={0} sx={{ border: '1px solid #bbf7d0', borderRadius: 2.5, p: 2.5, backgroundColor: '#f0fdf4' }}>
							<SectionHeader icon={StarOutlineOutlinedIcon} label={t('appCVScreening.matchingSkills')} />
							<Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
								{details.skillsMatch.matchingSkills.map((sk, idx) => (
									<Chip
										key={`msk-${sk}-${idx}`}
										label={sk}
										size="small"
										sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}
									/>
								))}
							</Stack>
						</Paper>
					)}

					{/* Missing Skills */}
					{details?.missingSkills && (
						<Paper elevation={0} sx={{ border: '1px solid #fecaca', borderRadius: 2.5, p: 2.5, backgroundColor: '#fffafa' }}>
							<SectionHeader icon={ErrorOutlineOutlinedIcon} label={t('appCVScreening.lackingSkills')} />
							{details.missingSkills.summary && (
								<Typography sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6, mb: 1.5 }}>
									{details.missingSkills.summary}
								</Typography>
							)}
							{Array.isArray(details.missingSkills.skills) && details.missingSkills.skills.length > 0 && (
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
									{details.missingSkills.skills.map((item, idx) => {
										const i18nKey = importanceI18nKey[item.importance] ?? 'mandatory';
										const chipSx = importanceChipSx[i18nKey] ?? importanceChipSx.mandatory;
										return (
											<Box
												key={`mss-${idx}`}
												sx={{
													display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5,
													py: 0.75, px: 0.5,
													borderBottom: idx < details.missingSkills.skills.length - 1 ? '1px solid #fee2e2' : 'none',
												}}
											>
												<Typography sx={{ fontSize: '0.80rem', color: '#334155', flex: 1 }}>
													{item.skill}
												</Typography>
												<Chip
													label={t(`jobContent.${i18nKey}`)}
													size="small"
													sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, flexShrink: 0, ...chipSx }}
												/>
											</Box>
										);
									})}
								</Box>
							)}
						</Paper>
					)}

				</Box>

				{/* Candidate Profile — flexible right sidebar, natural height, sticky on md+ */}
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
								<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: THEME_GREEN, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
									{t('appCVScreening.skills')}
								</Typography>
								<Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
									{candidate.skills.map((sk, idx) => (
										<Chip
											key={`sk-${sk}-${idx}`}
											label={sk}
											size="small"
											sx={{ height: 22, fontSize: '0.72rem', fontWeight: 500, backgroundColor: 'rgba(98,156,68,0.10)', color: '#166534', border: '1px solid rgba(98,156,68,0.25)' }}
										/>
									))}
								</Stack>
							</>
						)}
					</Paper>
				</Box>

			</Box>

			{/* CV Dialog */}
			<Dialog open={openCvDialog} onClose={() => { setOpenCvDialog(false); setCvData(null); }} fullWidth maxWidth="md">
				<Box sx={{ p: 3 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
						<Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
							{t('appCVScreening.cvInformation') || 'Candidate CV Information'}
						</Typography>
						<IconButton size="small" onClick={() => { setOpenCvDialog(false); setCvData(null); }}>
							<CloseOutlinedIcon sx={{ fontSize: 18 }} />
						</IconButton>
					</Box>
					<Divider sx={{ mb: 2 }} />
					{cvData ? (
						<Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
							{JSON.stringify(cvData, null, 2)}
						</Typography>
					) : (
						<Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>
							{t('loading') || 'Loading...'}
						</Typography>
					)}
				</Box>
			</Dialog>
		</Box>
	);
};

AppScreeningReportDetails.propTypes = {
	reportData: PropTypes.shape({
		id: PropTypes.string.isRequired,
		jobPostId: PropTypes.string.isRequired,
		jobPostTitle: PropTypes.string,
		candidateInfo: PropTypes.shape({
			candidateId: PropTypes.string.isRequired,
			candidateName: PropTypes.string.isRequired,
			nbYearsExperience: PropTypes.number,
			candidateProfileSummary: PropTypes.string,
			skills: PropTypes.arrayOf(PropTypes.string),
		}).isRequired,
		aiAnalysisReportDetails: PropTypes.shape({
			detailsID: PropTypes.string,
			finalScore: PropTypes.shape({
				score: PropTypes.number.isRequired,
				scoreExplanation: PropTypes.string,
			}).isRequired,
			skillsMatch: PropTypes.shape({
				score: PropTypes.number.isRequired,
				scoreExplanation: PropTypes.string,
				matchingSkills: PropTypes.arrayOf(PropTypes.string),
			}).isRequired,
			experienceMatch: PropTypes.shape({
				score: PropTypes.number.isRequired,
				scoreExplanation: PropTypes.string,
			}).isRequired,
			locationMatch: PropTypes.shape({
				score: PropTypes.number.isRequired,
				scoreExplanation: PropTypes.string,
			}).isRequired,
			industryMatch: PropTypes.shape({
				score: PropTypes.number.isRequired,
				scoreExplanation: PropTypes.string,
			}).isRequired,
			missingSkills: PropTypes.shape({
				summary: PropTypes.string,
				skills: PropTypes.arrayOf(PropTypes.shape({
					skill: PropTypes.string.isRequired,
					importance: PropTypes.string.isRequired,
				})),
			}),
		}).isRequired,
		candidateCVID: PropTypes.string,
	}),
};

export default AppScreeningReportDetails;
