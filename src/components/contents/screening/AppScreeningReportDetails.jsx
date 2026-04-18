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
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';

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
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, pb: 1, borderBottom: '2px solid #629C44' }}>
		<Icon sx={{ fontSize: 16, color: '#629C44' }} />
		<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#629C44', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
			{label}
		</Typography>
	</Box>
);

const ScoreGauge = ({ value, label }) => {
	const [animated, setAnimated] = useState(false);
	const radius = 46;
	const strokeWidth = 10;
	const circumference = 2 * Math.PI * radius;
	const color = getColor(value);

	useEffect(() => {
		const t = setTimeout(() => setAnimated(true), 80);
		return () => clearTimeout(t);
	}, []);

	const offset = animated ? circumference * (1 - value / 100) : circumference;

	return (
		<Box sx={{
			flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5,
			p: 2, borderRadius: 3,
			background: `linear-gradient(145deg, ${color}0a 0%, ${color}18 100%)`,
			border: `1px solid ${color}28`,
		}}>
			<Box sx={{ position: 'relative', width: 120, height: 120 }}>
				<svg width="120" height="120" viewBox="0 0 120 120" style={{ overflow: 'visible' }}>
					{/* Track ring */}
					<circle
						cx="60" cy="60" r={radius}
						fill="none"
						stroke="#e2e8f0"
						strokeWidth={strokeWidth}
					/>
					{/* Animated value arc */}
					<circle
						cx="60" cy="60" r={radius}
						fill="none"
						stroke={color}
						strokeWidth={strokeWidth}
						strokeLinecap="round"
						strokeDasharray={circumference}
						strokeDashoffset={offset}
						transform="rotate(-90 60 60)"
						style={{
							transition: 'stroke-dashoffset 1.2s cubic-bezier(0.25, 1, 0.5, 1)',
							filter: `drop-shadow(0 0 6px ${color}99)`,
						}}
					/>
				</svg>
				{/* Score text */}
				<Box sx={{
					position: 'absolute', inset: 0,
					display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
				}}>
					<Typography sx={{
						fontSize: '1.9rem', fontWeight: 800, color, lineHeight: 1,
						letterSpacing: '-0.04em',
					}}>
						{value}
					</Typography>
					<Typography sx={{
						fontSize: '0.58rem', fontWeight: 700, color: '#94a3b8',
						textTransform: 'uppercase', letterSpacing: '0.1em',
					}}>
						/ 100
					</Typography>
				</Box>
			</Box>
			<Typography sx={{
				fontSize: '0.72rem', fontWeight: 700, color: '#475569',
				textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em',
			}}>
				{label}
			</Typography>
		</Box>
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

	const overallScore = Number(details?.overallSummary?.score ?? 0);
	const skillsMatchDegree = Number(details?.skillsMatch?.degreeOfMatch ?? 0);
	const experienceDegree = Number(details?.experienceAlignment?.degreeOfMatch ?? 0);
	const jobTitle = reportData?.jobPostTitle || t('appCVScreening.unknownJob') || 'Unknown job';
	const nameInitials = candidate.candidateName
		.split(' ').slice(0, 2).map((p) => p[0] ?? '').join('').toUpperCase();

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', textAlign: 'left' }}>

			{/* Sticky header */}
			<Box sx={{
				display: 'flex', alignItems: 'center', gap: 2,
				px: 3, py: 1.5, flexShrink: 0,
				backgroundColor: '#ffffff',
				borderBottom: '1px solid #e2e8f0',
			}}>
				<Avatar sx={{
					width: 40, height: 40, fontSize: '0.85rem', fontWeight: 700,
					backgroundColor: '#629C44', color: '#fff',
				}}>
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
						<Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
							{jobTitle}
						</Typography>
					</Box>
				</Box>
				{reportData?.candidateCVID && (
					<Button
						variant="outlined"
						size="small"
						onClick={handleOpenCv}
						sx={{
							borderRadius: 2, fontSize: '0.75rem', fontWeight: 600,
							borderColor: '#629C44', color: '#629C44',
							'&:hover': { borderColor: '#4a7a33', backgroundColor: 'rgba(98,156,68,0.06)' },
						}}
					>
						{t('appCVScreening.seeCvDetails') || 'View CV'}
					</Button>
				)}
			</Box>

			{/* Scrollable body */}
			<Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>

				{/* Score gauges */}
				<Box sx={{ display: 'flex', gap: 1.5 }}>
					<ScoreGauge value={overallScore} label={t('appCVScreening.overallSummary') || 'Overall Score'} />
					<ScoreGauge value={skillsMatchDegree} label={t('appCVScreening.skillsMatch') || 'Skills Match'} />
					{Number.isFinite(experienceDegree) && experienceDegree > 0 && (
						<ScoreGauge value={experienceDegree} label={t('appCVScreening.experienceAlignment') || 'Experience'} />
					)}
				</Box>

				{/* Candidate Profile */}
				<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
					<SectionHeader icon={PersonOutlineOutlinedIcon} label={t('appCVScreening.candidateProfile') || 'Candidate Profile'} />
					{candidate.candidateProfileSummary && (
						<Typography sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6, mb: 1.5 }}>
							{candidate.candidateProfileSummary}
						</Typography>
					)}
					{Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
						<>
							<Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />
							<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#629C44', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
								{t('appCVScreening.skills') || 'Skills'}
							</Typography>
							<Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
								{candidate.skills.map((sk, idx) => (
									<Chip
										key={`${sk}-${idx}`}
										label={sk}
										size="small"
										sx={{
											height: 22, fontSize: '0.72rem', fontWeight: 500,
											backgroundColor: 'rgba(98,156,68,0.10)', color: '#166534',
											border: '1px solid rgba(98,156,68,0.25)',
										}}
									/>
								))}
							</Stack>
						</>
					)}
				</Paper>

				{/* Overall Summary */}
				<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
					<SectionHeader icon={StarOutlineOutlinedIcon} label={t('appCVScreening.overallSummary') || 'Overall Summary'} />
					<Typography sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
						{details?.overallSummary?.summary}
					</Typography>
					{Array.isArray(details?.overallSummary?.pointsForImprovement) && details.overallSummary.pointsForImprovement.length > 0 && (
						<>
							<Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />
							<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
								{t('appCVScreening.pointsForImprovement') || 'Points for Improvement'}
							</Typography>
							<Box component="ul" sx={{ m: 0, pl: 2, listStyleType: 'disc' }}>
								{details.overallSummary.pointsForImprovement.map((p, i) => (
									<Box component="li" key={i} sx={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
										{p}
									</Box>
								))}
							</Box>
						</>
					)}
				</Paper>

				{/* Experience Alignment */}
				<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, pb: 1, borderBottom: '2px solid #629C44' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<TrendingUpOutlinedIcon sx={{ fontSize: 16, color: '#629C44' }} />
							<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#629C44', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
								{t('appCVScreening.experienceAlignment') || 'Experience Alignment'}
							</Typography>
						</Box>
						{Number.isFinite(experienceDegree) && experienceDegree > 0 && (
							<Chip
								label={`${experienceDegree}%`}
								size="small"
								sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, backgroundColor: getBgColor(experienceDegree), color: getColor(experienceDegree) }}
							/>
						)}
					</Box>
					<Typography sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
						{details?.experienceAlignment?.summary}
					</Typography>
				</Paper>

				{/* Skills Match */}
				<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, pb: 1, borderBottom: '2px solid #629C44' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<BuildOutlinedIcon sx={{ fontSize: 16, color: '#629C44' }} />
							<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#629C44', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
								{t('appCVScreening.skillsMatch') || 'Skills Match'}
							</Typography>
						</Box>
						<Chip
							label={`${skillsMatchDegree}%`}
							size="small"
							sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, backgroundColor: getBgColor(skillsMatchDegree), color: getColor(skillsMatchDegree) }}
						/>
					</Box>
					<Typography sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
						{details?.skillsMatch?.summary}
					</Typography>
				</Paper>

				{/* Lacking Skills */}
				<Paper elevation={0} sx={{ border: '1px solid #fee2e2', borderRadius: 2.5, p: 2.5 }}>
					<SectionHeader icon={ErrorOutlineOutlinedIcon} label={t('appCVScreening.lackingSkills') || 'Lacking Skills'} />
					<Typography sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
						{details?.lackingSkills?.summary}
					</Typography>
				</Paper>

				{/* Exceeds Requirements */}
				<Paper elevation={0} sx={{ border: '1px solid #dcfce7', borderRadius: 2.5, p: 2.5 }}>
					<SectionHeader icon={EmojiEventsOutlinedIcon} label={t('appCVScreening.exceedsRequirements') || 'Exceeds Requirements'} />
					<Typography sx={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
						{details?.exceedsRequirements?.summary}
					</Typography>
				</Paper>

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
			detailsID: PropTypes.string.isRequired,
			skillsMatch: PropTypes.shape({
				summary: PropTypes.string.isRequired,
				degreeOfMatch: PropTypes.number.isRequired,
			}).isRequired,
			exceedsRequirements: PropTypes.shape({
				summary: PropTypes.string.isRequired,
			}).isRequired,
			lackingSkills: PropTypes.shape({
				summary: PropTypes.string.isRequired,
			}).isRequired,
			experienceAlignment: PropTypes.shape({
				summary: PropTypes.string.isRequired,
				degreeOfMatch: PropTypes.number,
			}).isRequired,
			overallSummary: PropTypes.shape({
				summary: PropTypes.string.isRequired,
				score: PropTypes.number.isRequired,
				pointsForImprovement: PropTypes.arrayOf(PropTypes.string).isRequired,
			}).isRequired,
		}).isRequired,
		candidateCVID: PropTypes.string,
	}),
};

export default AppScreeningReportDetails;
