import { useCallback, useRef, useState } from 'react';
import {
	Box,
	Typography,
	Grid2,
	Tab,
	Tabs,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useReactToPrint } from 'react-to-print';
import { isActionAllowed } from '../../../utils/demoMode.js';
import { useCandidateOutreach } from '../../../contexts/CandidateOutreachContext.jsx';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import NotesPanel from '../../notes/components/NotesPanel.jsx';
import useTenantBranding from '../../settings/hooks/useTenantBranding.js';
import TenantBrandHeader from '../../settings/components/branding/TenantBrandHeader.jsx';
import ClusteringTabContent from './details/ClusteringTabContent.jsx';
import ReferencesSection from './details/ReferencesSection.jsx';
import TagsSection from './details/TagsSection.jsx';
import InterestsSection from './details/InterestsSection.jsx';
import ProjectsSection from './details/ProjectsSection.jsx';
import SkillsColumn from './details/SkillsColumn.jsx';
import ExperienceColumn from './details/ExperienceColumn.jsx';
import AvailabilitySection from './details/AvailabilitySection.jsx';
import ProfileSection from './details/ProfileSection.jsx';
import SummarySection from './details/SummarySection.jsx';
import CandidateHeaderCard from './details/CandidateHeaderCard.jsx';
import CvActionBar from './details/CvActionBar.jsx';
import useCvSectionEdit from '../hooks/useCvSectionEdit.js';
import * as tokens from '../../../theme/tokens.js';
import { cvPropType } from '../model/cvPropType.js';

/** Resume details pane: action bar, Resume and Talent Intelligence tabs (both printable). */
const AppCVDetails = ({ cv, onClose, onUpdate }) => {
	const { t } = useTranslation();

	const [activeTab, setActiveTab] = useState(0);
	const resumeRef     = useRef(null);
	const clusteringRef = useRef(null);
	const printResume     = useReactToPrint({ contentRef: resumeRef });
	const printClustering = useReactToPrint({ contentRef: clusteringRef });
	const handleDownload  = useCallback(
		() => activeTab === 0 ? printResume() : printClustering(),
		[activeTab, printResume, printClustering],
	);

	const [anonymized, setAnonymized] = useState(false);
	const outreach = useCandidateOutreach();
	const candidateEmail = cv?.personalInformation?.contact?.email;
	const canContact = isActionAllowed('CONTACT_CANDIDATE') && Boolean(candidateEmail);
	const openEmailComposer = useCallback(
		() => outreach?.openComposer({ cvId: cv?.id, candidateName: cv?.personalInformation?.name }),
		[outreach, cv?.id, cv?.personalInformation?.name],
	);
	const [refCopied, setRefCopied] = useState(false);
	const {
		editingSection, draft, setDraft, tagInput, setTagInput, isSaving,
		handleEdit, handleCancelEdit, handleSave, handleAddTag, handleRemoveTag,
	} = useCvSectionEdit(cv, onUpdate);

	const handleCopyRef = useCallback(() => {
		const ref = cv?.applicantNumber;
		if (!ref) return;
		navigator.clipboard.writeText(ref).then(() => {
			setRefCopied(true);
			setTimeout(() => setRefCopied(false), 2000);
		});
	}, [cv?.applicantNumber]);
	const { tenant, tenantLogoUrl } = useTenantBranding();

	if (!cv) {
		return (
			<Box sx={{ p: 3 }}>
				<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.subtle }}>
					{t('appCVContent.selectCVToSeeDetails')}
				</Typography>
			</Box>
		);
	}

	// Missing fields arrive as explicit null (not undefined), so destructuring defaults
	// don't apply — coalesce every nullable field before rendering.
	const {
		applicantNumber,
		candidateClustering,
		candidateProfileSummary,
		profiles,
		lastUpdatedAt,
	} = cv;
	const pi = cv.personalInformation ?? {};
	const workExperience = cv.workExperience ?? [];
	const education = cv.education ?? [];
	const certifications = cv.certifications ?? [];
	const keySkills = cv.keySkills ?? [];
	const projectsAndAchievements = cv.projectsAndAchievements ?? [];
	const interestsAndHobbies = cv.interestsAndHobbies ?? [];
	const references = cv.references ?? [];
	const tags = cv.tags ?? [];

	const contact = pi.contact || {};
	const skills = cv.skillsAndQualifications || {};

	return (
		<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: tokens.surface.subtle }}>

			{/* Sticky action bar — not printed */}
			<CvActionBar
				anonymized={anonymized}
				canContact={canContact}
				handleDownload={handleDownload}
				onClose={onClose}
				openEmailComposer={openEmailComposer}
				setAnonymized={setAnonymized}
			/>

			{/* Tab bar */}
			<Tabs
				value={activeTab}
				onChange={(_, v) => setActiveTab(v)}
				sx={{
					px: 2.5,
					borderBottom: `1px solid ${tokens.line.main}`,
					minHeight: 40,
					backgroundColor: tokens.surface.paper,
					flexShrink: 0,
					'& .MuiTab-root': { minHeight: 40, fontSize: tokens.fontSize.small, textTransform: 'none', fontWeight: 600 },
				}}
			>
				<Tab label={t('appCVContent.tabResume', 'Resume')} icon={<InfoOutlinedIcon sx={{ fontSize: tokens.iconSize.sm }} />} iconPosition="start" />
				<Tab label={t('appCVContent.tabTalentIntelligence', 'Talent Intelligence')} icon={<HubOutlinedIcon sx={{ fontSize: tokens.iconSize.sm }} />} iconPosition="start" />
			</Tabs>

			{/* Resume tab — always in DOM for print ref */}
			<Box ref={resumeRef} sx={{ display: activeTab === 0 ? 'block' : 'none', flex: 1, overflowY: 'auto', p: 2.5, textAlign: 'left' }}>

				{/* Company branding header */}
				{tenant && <TenantBrandHeader tenant={tenant} logoUrl={tenantLogoUrl} sx={{ px: 2, mb: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'line.main' }} />}

				{/* Candidate header card */}
				<CandidateHeaderCard
					anonymized={anonymized}
					applicantNumber={applicantNumber}
					canContact={canContact}
					contact={contact}
					handleCopyRef={handleCopyRef}
					openEmailComposer={openEmailComposer}
					pi={pi}
					refCopied={refCopied}
				/>

				{/* Summary */}
				<SummarySection candidateProfileSummary={candidateProfileSummary} />

				{/* Profile — areas of expertise & key responsibilities */}
				<ProfileSection profiles={profiles} />

				{/* Availability */}
				<AvailabilitySection
					draft={draft}
					editingSection={editingSection}
					handleCancelEdit={handleCancelEdit}
					handleEdit={handleEdit}
					handleSave={handleSave}
					isSaving={isSaving}
					pi={pi}
					setDraft={setDraft}
				/>

				{/* Two-column grid */}
				<Grid2 container spacing={2} sx={{ mb: 2 }}>
					{/* Left: Work experience + Education */}
					<ExperienceColumn education={education} workExperience={workExperience} />

					{/* Right: Key Skills + Skills + Languages + Certs */}
					<SkillsColumn certifications={certifications} keySkills={keySkills} skills={skills} />
				</Grid2>

				{/* Projects */}
				<ProjectsSection projectsAndAchievements={projectsAndAchievements} />

				{/* Interests */}
				<InterestsSection interestsAndHobbies={interestsAndHobbies} />

				{/* Tags */}
				<TagsSection
					draft={draft}
					editingSection={editingSection}
					handleAddTag={handleAddTag}
					handleCancelEdit={handleCancelEdit}
					handleEdit={handleEdit}
					handleRemoveTag={handleRemoveTag}
					handleSave={handleSave}
					isSaving={isSaving}
					setTagInput={setTagInput}
					tagInput={tagInput}
					tags={tags}
				/>

				{/* Team notes — internal, never printed (NotesPanel hides itself under @media print) */}
				<NotesPanel targetType="CV" targetId={cv.id} />

				{/* References — hide contact details when anonymized */}
				<ReferencesSection anonymized={anonymized} references={references} />

				{lastUpdatedAt && (
					<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle, textAlign: 'right', fontStyle: 'italic', pb: 1 }}>
						{t('appCVContent.lastUpdatedAt')}: {new Date(lastUpdatedAt).toLocaleString()}
					</Typography>
				)}
			</Box>

			{/* Talent Intelligence tab — always in DOM for print ref */}
			<Box ref={clusteringRef} sx={{ display: activeTab === 1 ? 'block' : 'none', flex: 1, overflowY: 'auto', p: 2.5, textAlign: 'left' }}>
				<ClusteringTabContent clustering={candidateClustering} t={t} />
			</Box>
		</Box>
	);
};

AppCVDetails.propTypes = {
	cv: cvPropType,
	onClose: PropTypes.func,
	onUpdate: PropTypes.func,
};

export default AppCVDetails;
