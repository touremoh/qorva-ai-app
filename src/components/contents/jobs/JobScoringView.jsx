import PropTypes from 'prop-types';
import { Box, Chip, Paper, Typography } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';

const THEME_GREEN = '#629C44';

// ─── Read-only scoring rules view (mirrors AppCVDetails widgets) ──────────────

const CVCard = ({ children, sx }) => (
	<Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0', ...sx }}>
		{children}
	</Paper>
);

CVCard.propTypes = { children: PropTypes.node, sx: PropTypes.object };

const CVSectionHeader = ({ Icon, title }) => (
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, pb: 0.75, borderBottom: '2px solid #629C44' }}>
		<Icon sx={{ fontSize: 14, color: '#629C44' }} />
		<Typography sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
			{title}
		</Typography>
	</Box>
);

CVSectionHeader.propTypes = { Icon: PropTypes.elementType.isRequired, title: PropTypes.string };

const importanceChipSx = (importance) => {
	if (importance === 'mandatory') return { fontSize: '0.72rem', backgroundColor: 'rgba(98,156,68,0.10)', color: '#3a6827', borderRadius: 0.75, height: 22, fontWeight: 600 };
	if (importance === 'important') return { fontSize: '0.72rem', backgroundColor: 'rgba(245,158,11,0.12)', color: '#d97706', borderRadius: 0.75, height: 22, fontWeight: 600 };
	return { fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: 0.75, height: 22, fontWeight: 500 };
};

// Maps stored enum values to existing i18n keys
const importanceI18nKey = { mandatory: 'mandatory', important: 'important', nice_to_have: 'niceToHave' };

const statLabelSx = { fontSize: '0.70rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' };

const JobScoringView = ({ scoringRules, t }) => {
	if (!scoringRules) return (
		<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
			<Typography sx={{ fontSize: '0.88rem', color: '#94a3b8' }}>{t('jobContent.noMatchingRules')}</Typography>
		</Box>
	);

	const sr = scoringRules;
	const weightPct = (v) => `${Math.round((v || 0) * 100)}%`;

	return (
		<Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>

			{/* ── Skills ── */}
			{sr.skills?.length > 0 && (
				<CVCard>
					<CVSectionHeader Icon={ConstructionIcon} title={t('jobContent.skills')} />
					<Box sx={{ display: 'flex', flexDirection: 'column' }}>
						{sr.skills.map((s, i) => (
							<Box key={i} sx={i > 0 ? { pt: 1.5, mt: 1.5, borderTop: '1px solid #f1f5f9' } : {}}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mb: 0.75 }}>
									<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{s.name}</Typography>
									<Chip label={t(`jobContent.${importanceI18nKey[s.importance] || s.importance}`)} size="small" sx={importanceChipSx(s.importance)} />
								</Box>
								<Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
									<Chip label={`${weightPct(s.weight)} ${t('jobContent.weightLabel')}`} size="small"
										sx={{ fontSize: '0.72rem', height: 22, backgroundColor: 'rgba(98,156,68,0.10)', color: '#3a6827', borderRadius: 0.75 }} />
									<Chip label={`${s.minYearsOfExperience} ${t('jobContent.yearsAbbr')} min.`} size="small"
										sx={{ fontSize: '0.72rem', height: 22, backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: 0.75 }} />
									{s.exactSkillOnly && (
										<Chip label={t('jobContent.exactSkillOnly')} size="small"
											sx={{ fontSize: '0.72rem', height: 22, backgroundColor: '#eff6ff', color: '#3b82f6', borderRadius: 0.75 }} />
									)}
								</Box>
							</Box>
						))}
					</Box>
				</CVCard>
			)}

			{/* ── Experience Requirements ── */}
			{sr.experienceRequirements && (
				<CVCard>
					<CVSectionHeader Icon={WorkOutlineOutlinedIcon} title={t('jobContent.experienceRequirements')} />
					<Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
						{sr.experienceRequirements.minYearsOfExperience != null && (
							<Box>
								<Typography sx={statLabelSx}>{t('jobContent.minYearsOfExperience')}</Typography>
								<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{sr.experienceRequirements.minYearsOfExperience} {t('jobContent.yearsAbbr')}</Typography>
							</Box>
						)}
						{sr.experienceRequirements.minRelevantYears != null && (
							<Box>
								<Typography sx={statLabelSx}>{t('jobContent.minRelevantYears')}</Typography>
								<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{sr.experienceRequirements.minRelevantYears} {t('jobContent.yearsAbbr')}</Typography>
							</Box>
						)}
						{sr.experienceRequirements.seniorityLevel && (
							<Box>
								<Typography sx={statLabelSx}>{t('jobContent.seniorityLevel')}</Typography>
								<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: THEME_GREEN }}>{t(`jobContent.${sr.experienceRequirements.seniorityLevel}`)}</Typography>
							</Box>
						)}
					</Box>
				</CVCard>
			)}

			{/* ── Location Preferences ── */}
			{sr.locationPreferences && (
				<CVCard>
					<CVSectionHeader Icon={LocationOnOutlinedIcon} title={t('jobContent.locationPreferences')} />
					{sr.locationPreferences.allowedLocations?.length > 0 && (
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.5 }}>
							{sr.locationPreferences.allowedLocations.map(loc => (
								<Chip key={loc} label={loc} size="small"
									sx={{ fontSize: '0.75rem', backgroundColor: 'rgba(98,156,68,0.10)', color: '#3a6827', borderRadius: 1, height: 24, fontWeight: 500 }} />
							))}
						</Box>
					)}
					<Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
						<Box>
							<Typography sx={statLabelSx}>{t('jobContent.remoteAllowed')}</Typography>
							<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: sr.locationPreferences.remoteAllowed ? THEME_GREEN : '#0f172a' }}>
								{sr.locationPreferences.remoteAllowed ? t('jobContent.yes') : t('jobContent.no')}
							</Typography>
						</Box>
						{sr.locationPreferences.strictness && (
							<Box>
								<Typography sx={statLabelSx}>{t('jobContent.strictness')}</Typography>
								<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{t(`jobContent.${sr.locationPreferences.strictness}`)}</Typography>
							</Box>
						)}
					</Box>
				</CVCard>
			)}

			{/* ── Industry Preferences ── */}
			{sr.industryPreferences && (
				<CVCard>
					<CVSectionHeader Icon={BusinessCenterOutlinedIcon} title={t('jobContent.industryPreferences')} />
					{sr.industryPreferences.preferredIndustries?.length > 0 && (
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.5 }}>
							{sr.industryPreferences.preferredIndustries.map(ind => (
								<Chip key={ind} label={ind} size="small"
									sx={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: 1, height: 24 }} />
							))}
						</Box>
					)}
					{sr.industryPreferences.strictness && (
						<Box>
							<Typography sx={statLabelSx}>{t('jobContent.strictness')}</Typography>
							<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{t(`jobContent.${sr.industryPreferences.strictness}`)}</Typography>
						</Box>
					)}
				</CVCard>
			)}

			{/* ── Scoring Weights ── */}
			{sr.scoringWeight && (
				<CVCard>
					<CVSectionHeader Icon={TuneIcon} title={t('jobContent.scoringWeights')} />
					<Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
						{[
							{ key: 'skills', label: t('jobContent.weightSkills') },
							{ key: 'experience', label: t('jobContent.weightExperience') },
							{ key: 'location', label: t('jobContent.weightLocation') },
							{ key: 'industry', label: t('jobContent.weightIndustry') },
						].map(({ key, label }) => (
							<Box key={key} sx={{ flex: '1 1 80px', p: 1.5, backgroundColor: '#f8fafc', borderRadius: 1.5, border: '1px solid #f1f5f9', textAlign: 'center' }}>
								<Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: THEME_GREEN, lineHeight: 1.2 }}>
									{weightPct(sr.scoringWeight[key])}
								</Typography>
								<Typography sx={{ ...statLabelSx, mt: 0.25 }}>{label}</Typography>
							</Box>
						))}
					</Box>
				</CVCard>
			)}

			{/* ── Candidate Availability Filters ── */}
			{(sr.filterOpenToWork || sr.availabilityStatuses?.length > 0) && (
				<CVCard>
					<CVSectionHeader Icon={FilterListOutlinedIcon} title={t('jobContent.candidateFilters')} />
					{sr.filterOpenToWork && (
						<Chip label={t('jobContent.filterOpenToWork')} size="small" sx={{
							fontSize: '0.72rem', height: 22, fontWeight: 600, borderRadius: 0.75,
							backgroundColor: 'rgba(98,156,68,0.10)', color: '#3a6827',
							mb: sr.availabilityStatuses?.length > 0 ? 1.5 : 0,
						}} />
					)}
					{sr.availabilityStatuses?.length > 0 && (
						<Box>
							<Typography sx={{ ...statLabelSx, mb: 0.75 }}>{t('jobContent.availabilityStatuses')}</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
								{sr.availabilityStatuses.map(status => (
									<Chip key={status} label={t(`jobContent.availabilityStatus.${status}`)} size="small"
										sx={{ fontSize: '0.72rem', height: 22, backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 0.75 }} />
								))}
							</Box>
						</Box>
					)}
				</CVCard>
			)}

		</Box>
	);
};

JobScoringView.propTypes = { scoringRules: PropTypes.object, t: PropTypes.func.isRequired };

export default JobScoringView;
