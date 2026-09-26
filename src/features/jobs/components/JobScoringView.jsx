import PropTypes from 'prop-types';
import SectionHeader from '../../../shared/ui/SectionHeader.jsx';
import { Box, Chip, Paper, Typography } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

const THEME_GREEN = tokens.brand.main;

// ─── Read-only scoring rules view (mirrors AppCVDetails widgets) ──────────────

const CVCard = ({ children, sx }) => (
	<Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${tokens.line.main}`, ...sx }}>
		{children}
	</Paper>
);

CVCard.propTypes = { children: PropTypes.node, sx: PropTypes.object };


const importanceChipSx = (importance) => {
	if (importance === 'mandatory') return { fontSize: '0.72rem', backgroundColor: alpha(tokens.brand.main, 0.10), color: tokens.brand.dark, borderRadius: 0.75, height: 22, fontWeight: 600 };
	if (importance === 'important') return { fontSize: '0.72rem', backgroundColor: 'rgba(245,158,11,0.12)', color: tokens.status.warning.main, borderRadius: 0.75, height: 22, fontWeight: 600 };
	return { fontSize: '0.72rem', backgroundColor: tokens.surface.muted, color: tokens.ink.soft, borderRadius: 0.75, height: 22, fontWeight: 500 };
};

// Maps stored enum values to existing i18n keys
const importanceI18nKey = { mandatory: 'mandatory', important: 'important', nice_to_have: 'niceToHave' };

const statLabelSx = { fontSize: '0.70rem', color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.05em' };

const JobScoringView = ({ scoringRules, t }) => {
	if (!scoringRules) return (
		<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
			<Typography sx={{ fontSize: '0.88rem', color: tokens.ink.subtle }}>{t('jobContent.noMatchingRules')}</Typography>
		</Box>
	);

	const sr = scoringRules;
	const weightPct = (v) => `${Math.round((v || 0) * 100)}%`;

	return (
		<Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>

			{/* ── Skills ── */}
			{sr.skills?.length > 0 && (
				<CVCard>
					<SectionHeader tone="document" icon={ConstructionIcon} label={t('jobContent.skills')} />
					<Box sx={{ display: 'flex', flexDirection: 'column' }}>
						{sr.skills.map((s, i) => (
							<Box key={i} sx={i > 0 ? { pt: 1.5, mt: 1.5, borderTop: `1px solid ${tokens.surface.muted}` } : {}}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mb: 0.75 }}>
									<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: tokens.ink.strong }}>{s.name}</Typography>
									<Chip label={t(`jobContent.${importanceI18nKey[s.importance] || s.importance}`)} size="small" sx={importanceChipSx(s.importance)} />
								</Box>
								<Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
									<Chip label={`${weightPct(s.weight)} ${t('jobContent.weightLabel')}`} size="small"
										sx={{ fontSize: '0.72rem', height: 22, backgroundColor: alpha(tokens.brand.main, 0.10), color: tokens.brand.dark, borderRadius: 0.75 }} />
									<Chip label={`${s.minYearsOfExperience} ${t('jobContent.yearsAbbr')} min.`} size="small"
										sx={{ fontSize: '0.72rem', height: 22, backgroundColor: tokens.surface.muted, color: tokens.ink.muted, borderRadius: 0.75 }} />
									{s.exactSkillOnly && (
										<Chip label={t('jobContent.exactSkillOnly')} size="small"
											sx={{ fontSize: '0.72rem', height: 22, backgroundColor: tokens.status.info.paleAlt, color: tokens.status.info.blue, borderRadius: 0.75 }} />
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
					<SectionHeader tone="document" icon={WorkOutlineOutlinedIcon} label={t('jobContent.experienceRequirements')} />
					<Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
						{sr.experienceRequirements.minYearsOfExperience != null && (
							<Box>
								<Typography sx={statLabelSx}>{t('jobContent.minYearsOfExperience')}</Typography>
								<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: tokens.ink.strong }}>{sr.experienceRequirements.minYearsOfExperience} {t('jobContent.yearsAbbr')}</Typography>
							</Box>
						)}
						{sr.experienceRequirements.minRelevantYears != null && (
							<Box>
								<Typography sx={statLabelSx}>{t('jobContent.minRelevantYears')}</Typography>
								<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: tokens.ink.strong }}>{sr.experienceRequirements.minRelevantYears} {t('jobContent.yearsAbbr')}</Typography>
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
					<SectionHeader tone="document" icon={LocationOnOutlinedIcon} label={t('jobContent.locationPreferences')} />
					{sr.locationPreferences.allowedLocations?.length > 0 && (
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.5 }}>
							{sr.locationPreferences.allowedLocations.map(loc => (
								<Chip key={loc} label={loc} size="small"
									sx={{ fontSize: '0.75rem', backgroundColor: alpha(tokens.brand.main, 0.10), color: tokens.brand.dark, borderRadius: 1, height: 24, fontWeight: 500 }} />
							))}
						</Box>
					)}
					<Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
						<Box>
							<Typography sx={statLabelSx}>{t('jobContent.remoteAllowed')}</Typography>
							<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: sr.locationPreferences.remoteAllowed ? THEME_GREEN : `${tokens.ink.strong}` }}>
								{sr.locationPreferences.remoteAllowed ? t('jobContent.yes') : t('jobContent.no')}
							</Typography>
						</Box>
						{sr.locationPreferences.strictness && (
							<Box>
								<Typography sx={statLabelSx}>{t('jobContent.strictness')}</Typography>
								<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: tokens.ink.strong }}>{t(`jobContent.${sr.locationPreferences.strictness}`)}</Typography>
							</Box>
						)}
					</Box>
				</CVCard>
			)}

			{/* ── Industry Preferences ── */}
			{sr.industryPreferences && (
				<CVCard>
					<SectionHeader tone="document" icon={BusinessCenterOutlinedIcon} label={t('jobContent.industryPreferences')} />
					{sr.industryPreferences.preferredIndustries?.length > 0 && (
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.5 }}>
							{sr.industryPreferences.preferredIndustries.map(ind => (
								<Chip key={ind} label={ind} size="small"
									sx={{ fontSize: '0.75rem', backgroundColor: tokens.surface.muted, color: tokens.ink.soft, borderRadius: 1, height: 24 }} />
							))}
						</Box>
					)}
					{sr.industryPreferences.strictness && (
						<Box>
							<Typography sx={statLabelSx}>{t('jobContent.strictness')}</Typography>
							<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: tokens.ink.strong }}>{t(`jobContent.${sr.industryPreferences.strictness}`)}</Typography>
						</Box>
					)}
				</CVCard>
			)}

			{/* ── Scoring Weights ── */}
			{sr.scoringWeight && (
				<CVCard>
					<SectionHeader tone="document" icon={TuneIcon} label={t('jobContent.scoringWeights')} />
					<Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
						{[
							{ key: 'skills', label: t('jobContent.weightSkills') },
							{ key: 'experience', label: t('jobContent.weightExperience') },
							{ key: 'location', label: t('jobContent.weightLocation') },
							{ key: 'industry', label: t('jobContent.weightIndustry') },
						].map(({ key, label }) => (
							<Box key={key} sx={{ flex: '1 1 80px', p: 1.5, backgroundColor: tokens.surface.subtle, borderRadius: 1.5, border: `1px solid ${tokens.surface.muted}`, textAlign: 'center' }}>
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
					<SectionHeader tone="document" icon={FilterListOutlinedIcon} label={t('jobContent.candidateFilters')} />
					{sr.filterOpenToWork && (
						<Chip label={t('jobContent.filterOpenToWork')} size="small" sx={{
							fontSize: '0.72rem', height: 22, fontWeight: 600, borderRadius: 0.75,
							backgroundColor: alpha(tokens.brand.main, 0.10), color: tokens.brand.dark,
							mb: sr.availabilityStatuses?.length > 0 ? 1.5 : 0,
						}} />
					)}
					{sr.availabilityStatuses?.length > 0 && (
						<Box>
							<Typography sx={{ ...statLabelSx, mb: 0.75 }}>{t('jobContent.availabilityStatuses')}</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
								{sr.availabilityStatuses.map(status => (
									<Chip key={status} label={t(`jobContent.availabilityStatus.${status}`)} size="small"
										sx={{ fontSize: '0.72rem', height: 22, backgroundColor: tokens.status.error.tint, color: tokens.status.error.text, borderRadius: 0.75 }} />
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
