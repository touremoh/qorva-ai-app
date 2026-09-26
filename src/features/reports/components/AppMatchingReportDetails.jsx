import { useCallback, useRef } from 'react';
import { getInitials } from '../../../shared/lib/text.js';
import {
	Box,
	Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useReactToPrint } from 'react-to-print';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import { isActionAllowed } from '../../../utils/demoMode.js';
import { useCandidateOutreach } from '../../../contexts/CandidateOutreachContext.jsx';
import { RECOMMENDATION_CONFIG, CONFIDENCE_CONFIG, getColor } from '../model/reportDetails.js';
import useTenantBranding from '../../settings/hooks/useTenantBranding.js';
import TenantBrandHeader from '../../settings/components/branding/TenantBrandHeader.jsx';
import ReportSidebar from './details/ReportSidebar.jsx';
import ReportMainColumn from './details/ReportMainColumn.jsx';
import ReportCandidateHeader from './details/ReportCandidateHeader.jsx';
import ReportActionBar from './details/ReportActionBar.jsx';
import * as tokens from '../../../theme/tokens.js';

const AppMatchingReportDetails = ({ reportData }) => {
	const { t } = useTranslation();

	const componentRef = useRef(null);
	const printReport  = useReactToPrint({ contentRef: componentRef });
	const handleDownload = useCallback(() => printReport(), [printReport]);

	const { tenant, tenantLogoUrl } = useTenantBranding();

	const candidate = reportData?.candidateInfo;
	const details   = reportData?.matchingReportDetails;
	const decision  = details?.decisionSummary;
	const outreach  = useCandidateOutreach();
	// The report carries no contact data; the composer resolves the email from the CV on open.
	const canContact = isActionAllowed('CONTACT_CANDIDATE') && Boolean(candidate?.candidateId);

	if (!reportData || !candidate || !details) {
		return (
			<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: tokens.surface.subtle, gap: 1.5 }}>
				<AssessmentOutlinedIcon sx={{ fontSize: 40, color: tokens.ink.faint }} />
				<Typography sx={{ fontSize: '0.85rem', color: tokens.ink.subtle, fontWeight: 500 }}>
					{t('appCVMatching.noAnalysisResult')}
				</Typography>
			</Box>
		);
	}

	const finalScore   = Math.ceil(Number(decision?.finalScore ?? 0));
	const finalColor   = getColor(finalScore);
	const jobTitle     = reportData?.jobPostTitle || '—';
	const nameInitials = getInitials(candidate.candidateName);
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
			<ReportActionBar
				canContact={canContact}
				candidate={candidate}
				finalScore={finalScore}
				handleDownload={handleDownload}
				jobTitle={jobTitle}
				outreach={outreach}
				reportData={reportData}
			/>

			{/* ── Printable content ── */}
			<Box ref={componentRef} sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

				{/* Company branding */}
				{tenant && <TenantBrandHeader tenant={tenant} logoUrl={tenantLogoUrl} sx={{ px: 3, flexShrink: 0, borderBottom: '1px solid', borderColor: 'line.main' }} />}

				{/* Candidate header — sticky on screen, prints with content */}
				<ReportCandidateHeader candidate={candidate} jobTitle={jobTitle} nameInitials={nameInitials} />

				{/* Report body */}
				<Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2.5, alignItems: 'flex-start' }}>

					{/* ── Left main column ── */}
					<ReportMainColumn
						finalColor={finalColor}
						confConfig={confConfig}
						confKey={confKey}
						decision={decision}
						detailScores={detailScores}
						details={details}
						finalScore={finalScore}
						recConfig={recConfig}
						recKey={recKey}
						reportData={reportData}
					/>

					{/* ── Right sidebar: Candidate Profile + Clustering ── */}
					<ReportSidebar candidate={candidate} />

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
