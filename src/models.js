const CVSchema = {
	id: "",
	companyId: "", // Should be an ObjectId
	personalInformation: {
		name: "", // Full name
		contact: {
			phone: "", // Phone number
			email: "", // Email address
			socialLinks: {
				linkedin: "", // LinkedIn profile
				github: "", // GitHub profile
				website: "" // Personal website or portfolio
			}
		},
		role: "", // Role or position
		availability: {
			interviews: "", // Availability for interviews
			startDate: "" // Availability to start
		},
		summary: "" // Brief professional summary or objective statement
	},
	keySkills: [
		{
			category: "", // Skill category
			skills: [""] // Array of skills
		}
	],
	profiles: {
		areasOfExpertise: [""], // Array of areas of expertise
		keyResponsibilities: [""], // Array of key responsibilities
	},
	workExperience: [
		{
			company: "", // Company name
			website: "", // Company website
			location: "", // Company location
			from: "", // Start date
			to: "", // End date
			position: "", // Job title or position
			activities: [
				{
					project: "", // Project or initiative name
					tasks: [""] // Array of tasks
				}
			],
			achievements: [""], // Array of achievements
			toolsAndTechnologies: [""] // Array of tools and technologies
		}
	],
	education: [
		{
			year: "", // Graduation year
			institution: "", // Institution name
			degree: "", // Degree or certification
			fieldOfStudy: "", // Field of study
			achievements: [""] // Array of achievements
		}
	],
	certifications: [
		{
			title: "", // Certification title
			institution: "", // Issuing institution
			year: "", // Year of certification
			description: "" // Brief description of the certification
		}
	],
	skillsAndQualifications: {
		technicalSkills: [""], // Array of technical skills
		softSkills: [""], // Array of soft skills
		languages: [
			{
				language: "", // Language name
				proficiency: {
					read: "", // Proficiency level in reading
					written: "", // Proficiency level in writing
					spoken: "" // Proficiency level in speaking
				}
			}
		]
	},
	projectsAndAchievements: [
		{
			title: "", // Project title
			description: "", // Brief description of the project or achievement
			date: "", // Completion date
			impact: "" // Outcome or measurable impact
		}
	],
	interestsAndHobbies: [""], // Array of interests or hobbies
	references: [
		{
			name: "", // Reference name
			position: "", // Reference position
			company: "", // Reference company
			contact: {
				phone: "", // Reference phone
				email: "" // Reference email
			}
		}
	],
	attachment: null,
	tags: [""], // Tags added to the CV to create CV groups
	createdAt: "", // Creation date
	lastUpdatedAt: "" // Last updated date
};

export default CVSchema;
