// Job scoring rules: the backend stores weights as decimals (0-1), the scoring form edits whole
// percentages. These convert between the two; pure functions, shared by the create and edit flows.

export const emptyScoringConfig = () => ({
	skills: [],
	experienceRequirements: { minYearsOfExperience: '', minRelevantYears: '', seniorityLevel: '' },
	locationPreferences: { allowedLocations: [], remoteAllowed: false, strictness: '' },
	industryPreferences: { preferredIndustries: [], strictness: '' },
	scoringWeight: { skills: 50, experience: 35, location: 10, industry: 5 },
	filterOpenToWork: false,
	availabilityStatuses: [],
});

// Convert backend scoringRules (decimals 0-1) to slider-compatible form state
export const loadScoringConfig = (job) => {
	const sc = job?.scoringRules;
	if (!sc) return emptyScoringConfig();
	return {
		skills: (sc.skills || []).map(s => ({
			name: s.name || '',
			importance: s.importance || 'mandatory',
			weight: Math.round((s.weight || 0) * 100),
			minYearsOfExperience: s.minYearsOfExperience || 1,
			exactSkillOnly: s.exactSkillOnly || false,
		})),
		experienceRequirements: {
			minYearsOfExperience: sc.experienceRequirements?.minYearsOfExperience ?? '',
			minRelevantYears: sc.experienceRequirements?.minRelevantYears ?? '',
			seniorityLevel: sc.experienceRequirements?.seniorityLevel || '',
		},
		locationPreferences: {
			allowedLocations: sc.locationPreferences?.allowedLocations || [],
			remoteAllowed: sc.locationPreferences?.remoteAllowed || false,
			strictness: sc.locationPreferences?.strictness || '',
		},
		industryPreferences: {
			preferredIndustries: sc.industryPreferences?.preferredIndustries || [],
			strictness: sc.industryPreferences?.strictness || '',
		},
		scoringWeight: {
			skills: Math.round((sc.scoringWeight?.skills ?? 0) * 100),
			experience: Math.round((sc.scoringWeight?.experience ?? 0) * 100),
			location: Math.round((sc.scoringWeight?.location ?? 0) * 100),
			industry: Math.round((sc.scoringWeight?.industry ?? 0) * 100),
		},
		filterOpenToWork: sc.filterOpenToWork || false,
		availabilityStatuses: sc.availabilityStatuses || [],
	};
};

// Convert form state to backend scoringRules shape (decimals 0-1, enums as stored)
export const buildScoringPayload = (scoringConfig) => ({
	skills: scoringConfig.skills.map(s => ({
		name: s.name,
		importance: s.importance,
		weight: s.weight / 100,
		minYearsOfExperience: parseInt(s.minYearsOfExperience, 10) || 0,
		exactSkillOnly: s.exactSkillOnly,
	})),
	experienceRequirements: {
		minYearsOfExperience: parseInt(scoringConfig.experienceRequirements.minYearsOfExperience, 10) || 0,
		minRelevantYears: parseInt(scoringConfig.experienceRequirements.minRelevantYears, 10) || 0,
		seniorityLevel: scoringConfig.experienceRequirements.seniorityLevel || 'mid',
	},
	locationPreferences: {
		allowedLocations: scoringConfig.locationPreferences.allowedLocations,
		remoteAllowed: scoringConfig.locationPreferences.remoteAllowed,
		strictness: scoringConfig.locationPreferences.strictness || 'medium',
	},
	industryPreferences: {
		preferredIndustries: scoringConfig.industryPreferences.preferredIndustries,
		strictness: scoringConfig.industryPreferences.strictness || 'medium',
	},
	scoringWeight: {
		skills: scoringConfig.scoringWeight.skills / 100,
		experience: scoringConfig.scoringWeight.experience / 100,
		location: scoringConfig.scoringWeight.location / 100,
		industry: scoringConfig.scoringWeight.industry / 100,
	},
	...(scoringConfig.filterOpenToWork ? { filterOpenToWork: true } : {}),
	...(scoringConfig.availabilityStatuses?.length > 0
		? { availabilityStatuses: scoringConfig.availabilityStatuses }
		: {}),
});
