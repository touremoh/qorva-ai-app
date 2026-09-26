import { describe, expect, it } from 'vitest';
import { buildScoringPayload, emptyScoringConfig, loadScoringConfig } from './scoringConfig.js';

const storedRules = {
	skills: [
		{ name: 'Java', importance: 'mandatory', weight: 0.6, minYearsOfExperience: 3, exactSkillOnly: true },
		{ name: 'Kubernetes', importance: 'nice_to_have', weight: 0.4, minYearsOfExperience: 1, exactSkillOnly: false },
	],
	experienceRequirements: { minYearsOfExperience: 5, minRelevantYears: 3, seniorityLevel: 'senior' },
	locationPreferences: { allowedLocations: ['London'], remoteAllowed: true, strictness: 'high' },
	industryPreferences: { preferredIndustries: ['Fintech'], strictness: 'low' },
	scoringWeight: { skills: 0.5, experience: 0.3, location: 0.1, industry: 0.1 },
	filterOpenToWork: true,
	availabilityStatuses: ['AVAILABLE'],
};

describe('job scoring config', () => {
	it('loads stored decimals as whole percentages for the sliders', () => {
		const form = loadScoringConfig({ scoringRules: storedRules });

		expect(form.skills[0]).toEqual({ name: 'Java', importance: 'mandatory', weight: 60, minYearsOfExperience: 3, exactSkillOnly: true });
		expect(form.scoringWeight).toEqual({ skills: 50, experience: 30, location: 10, industry: 10 });
	});

	it('round-trips stored rules unchanged', () => {
		expect(buildScoringPayload(loadScoringConfig({ scoringRules: storedRules }))).toEqual(storedRules);
	});

	it('falls back to the empty form and fills defaults when saving it', () => {
		expect(loadScoringConfig({})).toEqual(emptyScoringConfig());
		expect(buildScoringPayload(emptyScoringConfig())).toEqual({
			skills: [],
			experienceRequirements: { minYearsOfExperience: 0, minRelevantYears: 0, seniorityLevel: 'mid' },
			locationPreferences: { allowedLocations: [], remoteAllowed: false, strictness: 'medium' },
			industryPreferences: { preferredIndustries: [], strictness: 'medium' },
			scoringWeight: { skills: 0.5, experience: 0.35, location: 0.1, industry: 0.05 },
		});
	});
});
