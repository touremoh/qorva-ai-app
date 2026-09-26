import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Divider } from '@mui/material';
import { emptySkill } from '../../model/jobForm.js';
import ScoringFormActions from './ScoringFormActions.jsx';
import AvailabilityFilterSection from './AvailabilityFilterSection.jsx';
import ScoringWeightsSection from './ScoringWeightsSection.jsx';
import IndustrySection from './IndustrySection.jsx';
import LocationSection from './LocationSection.jsx';
import ExperienceSection from './ExperienceSection.jsx';
import SkillsSection from './SkillsSection.jsx';

const JobScoringForm = ({ scoringConfig, onScoringChange, onBack, onSkip, onSave, loading, saveLabel }) => {
	const [locationInput, setLocationInput] = useState('');
	const [industryInput, setIndustryInput] = useState('');

	const sc = scoringConfig;
	const set = (patch) => onScoringChange(prev => ({ ...prev, ...patch }));
	const setExp = (patch) => set({ experienceRequirements: { ...sc.experienceRequirements, ...patch } });
	const setLoc = (patch) => set({ locationPreferences: { ...sc.locationPreferences, ...patch } });
	const setInd = (patch) => set({ industryPreferences: { ...sc.industryPreferences, ...patch } });
	const setWeights = (patch) => set({ scoringWeight: { ...sc.scoringWeight, ...patch } });

	const addSkill = () => set({ skills: [...sc.skills, emptySkill()] });
	const removeSkill = (i) => set({ skills: sc.skills.filter((_, idx) => idx !== i) });
	const updateSkill = (i, patch) => set({ skills: sc.skills.map((s, idx) => idx === i ? { ...s, ...patch } : s) });

	const addLocation = () => {
		const val = locationInput.trim();
		if (val && !sc.locationPreferences.allowedLocations.includes(val))
			setLoc({ allowedLocations: [...sc.locationPreferences.allowedLocations, val] });
		setLocationInput('');
	};
	const removeLocation = (loc) => setLoc({ allowedLocations: sc.locationPreferences.allowedLocations.filter(l => l !== loc) });

	const addIndustry = () => {
		const val = industryInput.trim();
		if (val && !sc.industryPreferences.preferredIndustries.includes(val))
			setInd({ preferredIndustries: [...sc.industryPreferences.preferredIndustries, val] });
		setIndustryInput('');
	};
	const removeIndustry = (ind) => setInd({ preferredIndustries: sc.industryPreferences.preferredIndustries.filter(i => i !== ind) });

	const weightTotal = ['skills', 'experience', 'location', 'industry'].reduce((s, k) => s + (sc.scoringWeight[k] || 0), 0);
	const weightOk = weightTotal === 100;
	const skillWeightTotal = sc.skills.reduce((s, sk) => s + (sk.weight || 0), 0);
	const skillWeightOk = skillWeightTotal <= 100;

	return (
		<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
			{/* Scrollable body */}
			<Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>

				{/* ── Skills ── */}
				<SkillsSection
					addSkill={addSkill}
					removeSkill={removeSkill}
					sc={sc}
					skillWeightOk={skillWeightOk}
					skillWeightTotal={skillWeightTotal}
					updateSkill={updateSkill}
				/>
				<Divider sx={{ my: 2 }} />

				{/* ── Experience Requirements ── */}
				<ExperienceSection sc={sc} setExp={setExp} />
				<Divider sx={{ my: 2 }} />

				{/* ── Location Preferences ── */}
				<LocationSection
					addLocation={addLocation}
					locationInput={locationInput}
					removeLocation={removeLocation}
					sc={sc}
					setLoc={setLoc}
					setLocationInput={setLocationInput}
				/>
				<Divider sx={{ my: 2 }} />

				{/* ── Industry Preferences ── */}
				<IndustrySection
					addIndustry={addIndustry}
					industryInput={industryInput}
					removeIndustry={removeIndustry}
					sc={sc}
					setInd={setInd}
					setIndustryInput={setIndustryInput}
				/>
				<Divider sx={{ my: 2 }} />

				{/* ── Scoring Weights ── */}
				<ScoringWeightsSection
					sc={sc}
					setWeights={setWeights}
					weightOk={weightOk}
					weightTotal={weightTotal}
				/>
				<Divider sx={{ my: 2 }} />

				{/* ── Candidate Availability Filters ── */}
				<AvailabilityFilterSection sc={sc} set={set} />

			</Box>

			{/* Fixed action bar — always visible */}
			<ScoringFormActions
				loading={loading}
				onBack={onBack}
				onSave={onSave}
				onSkip={onSkip}
				saveLabel={saveLabel}
			/>
		</Box>
	);
};

JobScoringForm.propTypes = {
	scoringConfig: PropTypes.shape({
		skills: PropTypes.arrayOf(PropTypes.shape({
			name: PropTypes.string,
			importance: PropTypes.string,
			weight: PropTypes.number,
			minYearsOfExperience: PropTypes.number,
			exactSkillOnly: PropTypes.bool,
		})).isRequired,
		experienceRequirements: PropTypes.shape({
			minYearsOfExperience: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
			minRelevantYears: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
			seniorityLevel: PropTypes.string,
		}).isRequired,
		locationPreferences: PropTypes.shape({
			allowedLocations: PropTypes.arrayOf(PropTypes.string),
			remoteAllowed: PropTypes.bool,
			strictness: PropTypes.string,
		}).isRequired,
		industryPreferences: PropTypes.shape({
			preferredIndustries: PropTypes.arrayOf(PropTypes.string),
			strictness: PropTypes.string,
		}).isRequired,
		scoringWeight: PropTypes.shape({
			skills: PropTypes.number,
			experience: PropTypes.number,
			location: PropTypes.number,
			industry: PropTypes.number,
		}).isRequired,
		filterOpenToWork: PropTypes.bool,
		availabilityStatuses: PropTypes.arrayOf(PropTypes.string),
	}).isRequired,
	onScoringChange: PropTypes.func.isRequired,
	onBack: PropTypes.func,
	onSkip: PropTypes.func,
	onSave: PropTypes.func,
	loading: PropTypes.bool,
	saveLabel: PropTypes.node,
};

// ─── Main component ───────────────────────────────────────────────────────────

export default JobScoringForm;
