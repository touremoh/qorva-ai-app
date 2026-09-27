import PropTypes from 'prop-types';

/** Shape of a resume as the details pane reads it. */
export const cvPropType = PropTypes.shape({
	id: PropTypes.string,
	applicantNumber: PropTypes.string,
	profiles: PropTypes.shape({
		areasOfExpertise: PropTypes.arrayOf(PropTypes.string),
		keyResponsibilities: PropTypes.arrayOf(PropTypes.string),
	}),
	keySkills: PropTypes.arrayOf(PropTypes.shape({
		category: PropTypes.string,
		skills: PropTypes.arrayOf(PropTypes.string),
	})),
	candidateProfileSummary: PropTypes.string,
	candidateClustering: PropTypes.shape({
		primaryCluster: PropTypes.string,
		secondaryClusters: PropTypes.arrayOf(PropTypes.string),
		functionalExpertise: PropTypes.arrayOf(PropTypes.string),
		skillDepth: PropTypes.string,
		seniorityLevel: PropTypes.string,
		leadershipAndInfluence: PropTypes.string,
		learningVelocity: PropTypes.string,
		industryDomains: PropTypes.arrayOf(PropTypes.string),
		environmentFit: PropTypes.arrayOf(PropTypes.string),
		businessImpact: PropTypes.arrayOf(PropTypes.string),
		clusterConfidenceScore: PropTypes.number,
		clusterReasoning: PropTypes.string,
	}),
	personalInformation: PropTypes.shape({
		name: PropTypes.string,
		role: PropTypes.string,
		contact: PropTypes.shape({
			phone: PropTypes.string,
			email: PropTypes.string,
			socialLinks: PropTypes.shape({
				linkedin: PropTypes.string,
				github: PropTypes.string,
				website: PropTypes.string,
			}),
		}),
		availability: PropTypes.shape({
			openToWork: PropTypes.bool,
			status: PropTypes.oneOf(['activelyLooking', 'openButNotSearching', 'notAvailable', 'freelanceOnly']),
			availableFrom: PropTypes.string,
			noticePeriodDays: PropTypes.number,
			interviewAvailability: PropTypes.arrayOf(PropTypes.string),
			preferredWorkTypes: PropTypes.arrayOf(PropTypes.string),
			preferredContractTypes: PropTypes.arrayOf(PropTypes.string),
			willingToRelocate: PropTypes.bool,
			remoteOnly: PropTypes.bool,
		}),
	}),
	workExperience: PropTypes.arrayOf(PropTypes.shape({
		company: PropTypes.string,
		from: PropTypes.string,
		to: PropTypes.string,
		position: PropTypes.string,
		location: PropTypes.string,
		activities: PropTypes.arrayOf(PropTypes.shape({
			project: PropTypes.string,
			tasks: PropTypes.arrayOf(PropTypes.string),
		})),
	})),
	education: PropTypes.arrayOf(PropTypes.shape({
		institution: PropTypes.string,
		degree: PropTypes.string,
		fieldOfStudy: PropTypes.string,
		year: PropTypes.string,
	})),
	certifications: PropTypes.arrayOf(PropTypes.shape({
		title: PropTypes.string,
		institution: PropTypes.string,
		year: PropTypes.string,
		description: PropTypes.string,
	})),
	skillsAndQualifications: PropTypes.shape({
		technicalSkills: PropTypes.arrayOf(PropTypes.string),
		softSkills: PropTypes.arrayOf(PropTypes.string),
		languages: PropTypes.arrayOf(PropTypes.shape({
			language: PropTypes.string,
			proficiency: PropTypes.objectOf(PropTypes.string),
		})),
	}),
	projectsAndAchievements: PropTypes.arrayOf(PropTypes.shape({
		title: PropTypes.string,
		description: PropTypes.string,
		date: PropTypes.string,
		impact: PropTypes.string,
	})),
	interestsAndHobbies: PropTypes.arrayOf(PropTypes.string),
	references: PropTypes.arrayOf(PropTypes.shape({
		name: PropTypes.string,
		position: PropTypes.string,
		company: PropTypes.string,
		contact: PropTypes.shape({ phone: PropTypes.string, email: PropTypes.string }),
	})),
	tags: PropTypes.arrayOf(PropTypes.string),
	lastUpdatedAt: PropTypes.string,
});
