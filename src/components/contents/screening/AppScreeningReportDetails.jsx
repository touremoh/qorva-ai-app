// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { Box, Typography, Divider, List, ListItem, ListItemText, Chip, Button, Dialog, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';

const AppScreeningReportDetails = ({ reportData }) => {
	const { t } = useTranslation();
	const [cvData, setCvData] = useState(null);
	const [openCvDialog, setOpenCvDialog] = useState(false);

	const candidate = reportData?.candidateInfo;
	const details = reportData?.aiAnalysisReportDetails;

	const getColor = (value) => (value >= 70 ? 'green' : value >= 40 ? 'orange' : 'red');

	const handleOpenCv = async () => {
		if (reportData?.candidateCVID) {
			try {
				const response = await axios.get(`/api/cv/${reportData.candidateCVID}`);
				setCvData(response.data);
				setOpenCvDialog(true);
			} catch (error) {
				console.error('Error fetching CV data', error);
			}
		}
	};

	const handleCloseCv = () => {
		setOpenCvDialog(false);
		setCvData(null);
	};

	if (!reportData || !candidate || !details) {
		return (
			<Box sx={{ flex: 1, padding: 3, height: '85vh', overflow: 'hidden', backgroundColor: 'white', boxShadow: 1, marginLeft: 2, color: '#232F3E' }}>
				<Typography variant="body1">{t('appCVScreening.noAnalysisResult')}</Typography>
			</Box>
		);
	}

	const overallScore = Number(details?.overallSummary?.score ?? 0);
	const skillsMatchDegree = Number(details?.skillsMatch?.degreeOfMatch ?? 0);
	const experienceDegree = Number(details?.experienceAlignment?.degreeOfMatch ?? 0);

	// NEW: read job title from payload (e.g., "Senior Java Architect")
	const jobTitle = reportData?.jobPostTitle || t('appCVScreening.unknownJob') || 'Unknown job';

	return (
		<Box sx={{ flex: 1, padding: 2, height: '85vh', overflowY: 'auto', backgroundColor: 'white', boxShadow: 1, marginLeft: 2, color: '#232F3E' }}>
			{/* Header: Candidate + Job */}
			<Box sx={{ mb: 2 }}>
				<Typography variant="h6" sx={{ fontWeight: 'bold' }}>
					{candidate.candidateName} {candidate.nbYearsExperience != null ? `• ${candidate.nbYearsExperience} ${t('years') || 'years'} ${t('experience') || 'experience'}` : ''}
				</Typography>

				{/* NEW: Job title line */}
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 0.5 }}>
					<WorkOutlineIcon fontSize="small" />
					<Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600 }}>
						{t('appCVScreening.job') || 'Job'}: {jobTitle}
					</Typography>
				</Box>

				<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
					{t('appCVScreening.analysisDetails')}
				</Typography>
			</Box>

			<Divider sx={{ mb: 2 }} />

			{/* Top summary cards: Gauges */}
			<Box sx={{ display: 'flex', gap: 3, alignItems: 'center', justifyContent: "center", flexWrap: 'wrap', mb: 2 }}>
				<Box>
					<Gauge
						width={200}
						height={100}
						value={overallScore}
						sx={(theme) => ({
							[`& .${gaugeClasses.valueText}`]: { fontSize: 40 },
							[`& .${gaugeClasses.valueArc}`]: { fill: getColor(overallScore) },
							[`& .${gaugeClasses.referenceArc}`]: { fill: theme.palette.text.disabled },
						})}
					/>
					<Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
						{t('appCVScreening.overallSummary') || 'Overall Summary'}
					</Typography>
				</Box>

				<Box>
					<Gauge
						width={200}
						height={100}
						value={skillsMatchDegree}
						sx={(theme) => ({
							[`& .${gaugeClasses.valueText}`]: { fontSize: 40 },
							[`& .${gaugeClasses.valueArc}`]: { fill: getColor(skillsMatchDegree) },
							[`& .${gaugeClasses.referenceArc}`]: { fill: theme.palette.text.disabled },
						})}
					/>
					<Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
						{t('appCVScreening.skillsMatch') || 'Skills Match'}
					</Typography>
				</Box>

				{Number.isFinite(experienceDegree) && experienceDegree > 0 && (
					<Box>
						<Gauge
							width={200}
							height={100}
							value={experienceDegree}
							sx={(theme) => ({
								[`& .${gaugeClasses.valueText}`]: { fontSize: 40 },
								[`& .${gaugeClasses.valueArc}`]: { fill: getColor(experienceDegree) },
								[`& .${gaugeClasses.referenceArc}`]: { fill: theme.palette.text.disabled },
							})}
						/>
						<Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
							{t('appCVScreening.experienceAlignment') || 'Experience Alignment'}
						</Typography>
					</Box>
				)}

				{reportData?.candidateCVID && (
					<Button variant="contained" onClick={handleOpenCv} sx={{ ml: 'auto' }}>
						{t('appCVScreening.seeCvDetails') || 'See CV Details'}
					</Button>
				)}
			</Box>

			{/* Candidate Profile Summary */}
			<Box sx={{ border: '1px solid lightgray', borderRadius: 2, p: 2, mb: 2 }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
					{t('appCVScreening.candidateProfile') || 'Candidate Profile'}
				</Typography>
				{candidate.candidateProfileSummary && (
					<Typography variant="body2" sx={{ mt: 1, textAlign: 'justify' }}>
						{candidate.candidateProfileSummary}
					</Typography>
				)}

				{Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
					<>
						<Divider sx={{ my: 1.5 }} />
						<Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
							{t('appCVScreening.skills') || 'Skills'}
						</Typography>
						<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
							{candidate.skills.map((sk, idx) => (
								<Chip key={`${sk}-${idx}`} label={sk} size="small" />
							))}
						</Stack>
					</>
				)}
			</Box>

			{/* Overall Summary */}
			<Box sx={{ border: '1px solid lightgray', borderRadius: 2, p: 2, mb: 2 }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
					{t('appCVScreening.overallSummary') || 'Overall Summary'}
				</Typography>
				<Typography variant="body2" sx={{ mt: 1 }}>{details?.overallSummary?.summary}</Typography>
				<Typography variant="body2" sx={{ mt: 1 }}>
					{(t('appCVScreening.score') || 'Score')}: {overallScore}
				</Typography>
				{Array.isArray(details?.overallSummary?.pointsForImprovement) && details.overallSummary.pointsForImprovement.length > 0 && (
					<>
						<Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
							{t('appCVScreening.pointsForImprovement') || 'Points for Improvement'}:
						</Typography>
						<List dense sx={{ pt: 0 }}>
							{details.overallSummary.pointsForImprovement.map((p, i) => (
								<ListItem key={i} sx={{ py: 0 }}>
									<ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={`• ${p}`} />
								</ListItem>
							))}
						</List>
					</>
				)}
			</Box>

			{/* Experience Alignment */}
			<Box sx={{ border: '1px solid lightgray', borderRadius: 2, p: 2, mb: 2 }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
					{t('appCVScreening.experienceAlignment') || 'Experience Alignment'}
				</Typography>
				<Typography variant="body2" sx={{ mt: 1 }}>{details?.experienceAlignment?.summary}</Typography>
				{Number.isFinite(experienceDegree) && (
					<Typography variant="body2" sx={{ mt: 1 }}>
						{(t('appCVScreening.degreeOfMatch') || 'Degree of Match')}: {experienceDegree}%
					</Typography>
				)}
			</Box>

			{/* Skills Match */}
			<Box sx={{ border: '1px solid lightgray', borderRadius: 2, p: 2, mb: 2 }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
					{t('appCVScreening.skillsMatch') || 'Skills Match'}
				</Typography>
				<Typography variant="body2" sx={{ mt: 1 }}>{details?.skillsMatch?.summary}</Typography>
				{Number.isFinite(skillsMatchDegree) && (
					<Typography variant="body2" sx={{ mt: 1 }}>
						{(t('appCVScreening.degreeOfMatch') || 'Degree of Match')}: {skillsMatchDegree}%
					</Typography>
				)}
			</Box>

			{/* Lacking Skills */}
			<Box sx={{ border: '1px solid lightgray', borderRadius: 2, p: 2, mb: 2 }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
					{t('appCVScreening.lackingSkills') || 'Lacking Skills'}
				</Typography>
				<Typography variant="body2" sx={{ mt: 1 }}>{details?.lackingSkills?.summary}</Typography>
			</Box>

			{/* Exceeds Requirements */}
			<Box sx={{ border: '1px solid lightgray', borderRadius: 2, p: 2, mb: 2 }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
					{t('appCVScreening.exceedsRequirements') || 'Exceeds Requirements'}
				</Typography>
				<Typography variant="body2" sx={{ mt: 1 }}>{details?.exceedsRequirements?.summary}</Typography>
			</Box>

			{/* CV Dialog (optional) */}
			<Dialog open={openCvDialog} onClose={handleCloseCv} fullWidth maxWidth="md">
				<Box sx={{ padding: 3 }}>
					<Typography variant="h6">{t('appCVScreening.cvInformation') || 'Candidate CV Information'}</Typography>
					{cvData ? (
						<Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
							{JSON.stringify(cvData, null, 2)}
						</Typography>
					) : (
						<Typography variant="body2">{t('loading') || 'Loading...'}</Typography>
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
		jobPostTitle: PropTypes.string, // <-- NEW
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
