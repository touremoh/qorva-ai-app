import React from 'react';
import { Box, Typography, Divider, Button } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const AppCVDetails = ({ cv }) => {
	const { t } = useTranslation();

	if (!cv) {
		return (
			<Typography variant="body1">
				{t('appCVContent.selectCVToSeeDetails')}
			</Typography>
		);
	}

	return (
		<Box sx={{ display: 'flex', gap: 2, padding: 2, height: '100%' }}>
			{/* Section 1: Personal Details */}
			<Box
				sx={{
					flex: 1,
					overflowY: 'auto',
					padding: 2,
					borderRight: '1px solid lightgray',
					textAlign: 'left'
				}}
			>
				<Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
					{t('appCVContent.personalInformation')}
				</Typography>

				{/* Personal Information */}
				{cv.personalInformation && (
					<>
						<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
							{t('appCVContent.name')}
						</Typography>
						<Typography variant="body2">{cv.personalInformation.name}</Typography>
						<Divider sx={{ my: 1 }} />

						<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
							{t('appCVContent.title')}
						</Typography>
						<Typography variant="body2">{cv.personalInformation.role}</Typography>
						<Divider sx={{ my: 1 }} />

						{/* Contact Information */}
						{cv.personalInformation.contact && (
							<>
								<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
									{t('appCVContent.contactInfo.title')}
								</Typography>
								{cv.personalInformation.contact.phone && (
									<>
										<Typography variant="body2">{`${t('appCVContent.contactInfo.phone')}: ${cv.personalInformation.contact.phone}`}</Typography>
									</>
								)}
								{cv.personalInformation.contact.email && (
									<>
										<Typography variant="body2">{`${t('appCVContent.contactInfo.email')}: ${cv.personalInformation.contact.email}`}</Typography>
									</>
								)}
								{cv.personalInformation.contact.socialLinks && (
									<>
										{cv.personalInformation.contact.socialLinks.linkedin && (
											<Typography variant="body2">{`${t('appCVContent.contactInfo.linkedin')}: ${cv.personalInformation.contact.socialLinks.linkedin}`}</Typography>
										)}
										{cv.personalInformation.contact.socialLinks.github && (
											<Typography variant="body2">{`${t('appCVContent.contactInfo.github')}: ${cv.personalInformation.contact.socialLinks.github}`}</Typography>
										)}
										{cv.personalInformation.contact.socialLinks.website && (
											<Typography variant="body2">{`${t('appCVContent.contactInfo.website')}: ${cv.personalInformation.contact.socialLinks.website}`}</Typography>
										)}
									</>
								)}
								<Divider sx={{ my: 1 }} />
							</>
						)}

						{/* Availability */}
						{cv.personalInformation.availability && (
							<>
								<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
									{t('appCVContent.availability.title')}
								</Typography>
								{cv.personalInformation.availability.interviews && (
									<Typography variant="body2">{`${t('appCVContent.availability.interviews')}: ${cv.personalInformation.availability.interviews}`}</Typography>
								)}
								{cv.personalInformation.availability.startDate && (
									<Typography variant="body2">{`${t('appCVContent.availability.startDate')}: ${cv.personalInformation.availability.startDate}`}</Typography>
								)}
								<Divider sx={{ my: 1 }} />
							</>
						)}

						{/* Summary */}
						{cv.personalInformation.summary && (
							<>
								<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
									{t('appCVContent.summary')}
								</Typography>
								<Typography variant="body2">{cv.personalInformation.summary}</Typography>
								<Divider sx={{ my: 1 }} />
							</>
						)}
					</>
				)}

				{/* Key Skills */}
				{cv.keySkills && cv.keySkills.length > 0 && (
					<>
						<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
							{t('appCVContent.keySkills')}
						</Typography>
						{cv.keySkills.map((skill, index) => (
							<Box key={index} sx={{ marginBottom: 1 }}>
								<Typography variant="body2" sx={{ fontWeight: 'bold' }}>
									{skill.category}:
								</Typography>
								<Typography variant="body2">{skill.skills.join(', ')}</Typography>
							</Box>
						))}
						<Divider sx={{ my: 1 }} />
					</>
				)}

				{/* Profiles */}
				{cv.profiles && (
					<>
						<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
							{t('appCVContent.profiles')}
						</Typography>
						{cv.profiles.areasOfExpertise && (
							<>
								<Typography variant="body2" sx={{ fontWeight: 'bold' }}>
									{t('appCVContent.areasOfExpertise')}
								</Typography>
								<Typography variant="body2">{cv.profiles.areasOfExpertise.join(', ')}</Typography>
							</>
						)}
						{cv.profiles.keyResponsibilities && (
							<>
								<Typography variant="body2" sx={{ fontWeight: 'bold' }}>
									{t('appCVContent.keyResponsibilities')}
								</Typography>
								<Typography variant="body2">{cv.profiles.keyResponsibilities.join(', ')}</Typography>
							</>
						)}
						<Divider sx={{ my: 1 }} />
					</>
				)}
			</Box>

			{/* Section 2: Rest of the CV Details */}
			<Box
				sx={{
					flex: 2,
					overflowY: 'auto',
					padding: 2
				}}
			>
				<Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
					{t('appCVContent.details')}
				</Typography>

				{/* Work Experience */}
				{cv.workExperience && cv.workExperience.length > 0 && (
					<Box sx={{ marginBottom: 3 }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 'bold', backgroundColor: '#f1f1f1', padding: 1, borderRadius: '8px' }}>
							{t('appCVContent.workExperience')}
						</Typography>
						{cv.workExperience.map((work, index) => (
							<Box key={index} sx={{ marginBottom: 2 }}>
								<Typography variant="body2">{`${work.company} (${work.from} - ${work.to})`}</Typography>
								<Typography variant="body2">{work.position}</Typography>
								<Typography variant="body2">{work.location}</Typography>
								{work.activities && (
									<>
										<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t('appCVContent.activities')}</Typography>
										{work.activities.map((activity, activityIndex) => (
											<Box key={activityIndex}>
												<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{activity.project}</Typography>
												{activity.tasks.map((task, taskIndex) => (
													<Typography variant="body2" key={taskIndex}>{`- ${task}`}</Typography>
												))}
											</Box>
										))}
									</>
								)}
								{work.achievements && (
									<>
										<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t('appCVContent.achievements')}</Typography>
										{work.achievements.map((achievement, achievementIndex) => (
											<Typography variant="body2" key={achievementIndex}>{`- ${achievement}`}</Typography>
										))}
									</>
								)}
								{work.toolsAndTechnologies && (
									<>
										<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t('appCVContent.toolsAndTechnologies')}</Typography>
										<Typography variant="body2">{work.toolsAndTechnologies.join(', ')}</Typography>
									</>
								)}
							</Box>
						))}
					</Box>
				)}

				{/* Education */}
				{cv.education && cv.education.length > 0 && (
					<Box sx={{ marginBottom: 3 }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 'bold', backgroundColor: '#f1f1f1', padding: 1, borderRadius: '8px' }}>
							{t('appCVContent.education')}
						</Typography>
						{cv.education.map((edu, index) => (
							<Box key={index}>
								<Typography variant="body2">{`${edu.institution} - ${edu.degree}`}</Typography>
								<Typography variant="body2">{`${t('appCVContent.fieldOfStudy')}: ${edu.fieldOfStudy}`}</Typography>
								<Typography variant="body2">{`${t('appCVContent.graduationYear')}: ${edu.year}`}</Typography>
								{edu.achievements && (
									<>
										<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t('appCVContent.achievements')}</Typography>
										{edu.achievements.map((achievement, achievementIndex) => (
											<Typography variant="body2" key={achievementIndex}>{`- ${achievement}`}</Typography>
										))}
									</>
								)}
							</Box>
						))}
					</Box>
				)}

				{/* Certifications */}
				{cv.certifications && cv.certifications.length > 0 && (
					<Box sx={{ marginBottom: 3 }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 'bold', backgroundColor: '#f1f1f1', padding: 1, borderRadius: '8px' }}>
							{t('appCVContent.certifications')}
						</Typography>
						{cv.certifications.map((cert, index) => (
							<Box key={index}>
								<Typography variant="body2">{`${cert.title} - ${cert.institution}`}</Typography>
								<Typography variant="body2">{`${t('appCVContent.yearOfCertification')}: ${cert.year}`}</Typography>
								{cert.description && <Typography variant="body2">{cert.description}</Typography>}
							</Box>
						))}
					</Box>
				)}

				{/* Skills and Qualifications */}
				{cv.skillsAndQualifications && (
					<Box sx={{ marginBottom: 3 }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 'bold', backgroundColor: '#f1f1f1', padding: 1, borderRadius: '8px' }}>
							{t('appCVContent.skillsAndQualifications')}
						</Typography>
						{cv.skillsAndQualifications.technicalSkills && (
							<>
								<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t('appCVContent.technicalSkills')}</Typography>
								<Typography variant="body2">{cv.skillsAndQualifications.technicalSkills.join(', ')}</Typography>
							</>
						)}
						{cv.skillsAndQualifications.softSkills && (
							<>
								<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t('appCVContent.softSkills')}</Typography>
								<Typography variant="body2">{cv.skillsAndQualifications.softSkills.join(', ')}</Typography>
							</>
						)}
						{cv.skillsAndQualifications.languages && (
							<>
								<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t('appCVContent.languages')}</Typography>
								{cv.skillsAndQualifications.languages.map((lang, index) => (
									<Box key={index}>
										<Typography variant="body2">{`${lang.language}`}</Typography>
										{Object.entries(lang.proficiency).map(([key, value]) => (
											<Typography key={key} variant="body2">{`${t(`appCVContent.proficiency.${key}`)}: ${value}`}</Typography>
										))}
									</Box>
								))}
							</>
						)}
					</Box>
				)}

				{/* Projects and Achievements */}
				{cv.projectsAndAchievements && cv.projectsAndAchievements.length > 0 && (
					<Box sx={{ marginBottom: 3 }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 'bold', backgroundColor: '#f1f1f1', padding: 1, borderRadius: '8px' }}>
							{t('appCVContent.projectsAndAchievements')}
						</Typography>
						{cv.projectsAndAchievements.map((project, index) => (
							<Box key={index}>
								<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{project.title}</Typography>
								<Typography variant="body2">{project.description}</Typography>
								<Typography variant="body2">{`${t('appCVContent.completionDate')}: ${project.date}`}</Typography>
								<Typography variant="body2">{`${t('appCVContent.impact')}: ${project.impact}`}</Typography>
							</Box>
						))}
					</Box>
				)}

				{/* Interests and Hobbies */}
				{cv.interestsAndHobbies && (
					<Box sx={{ marginBottom: 3 }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 'bold', backgroundColor: '#f1f1f1', padding: 1, borderRadius: '8px' }}>
							{t('appCVContent.interestsAndHobbies')}
						</Typography>
						<Typography variant="body2">{cv.interestsAndHobbies.join(', ')}</Typography>
					</Box>
				)}

				{/* References */}
				{cv.references && cv.references.length > 0 && (
					<Box sx={{ marginBottom: 3 }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 'bold', backgroundColor: '#f1f1f1', padding: 1, borderRadius: '8px' }}>
							{t('appCVContent.references')}
						</Typography>
						{cv.references.map((ref, index) => (
							<Box key={index}>
								<Typography variant="body2">{`${ref.name}, ${ref.position} at ${ref.company}`}</Typography>
								<Typography variant="body2">{`${t('appCVContent.contactInfo.phone')}: ${ref.contact.phone}`}</Typography>
								<Typography variant="body2">{`${t('appCVContent.contactInfo.email')}: ${ref.contact.email}`}</Typography>
							</Box>
						))}
					</Box>
				)}

				{/* Tags */}
				{cv.tags && (
					<Box sx={{ marginBottom: 3 }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 'bold', backgroundColor: '#f1f1f1', padding: 1, borderRadius: '8px' }}>
							{t('appCVContent.tags')}
						</Typography>
						<Typography variant="body2">{cv.tags.join(', ')}</Typography>
					</Box>
				)}

				{/* Download CV Attachment */}
				{cv.attachment && (
					<Box sx={{ marginTop: 3, display: 'flex', justifyContent: 'flex-end' }}>
						<Button
							variant="contained"
							color="primary"
							startIcon={<GetAppIcon />}
							onClick={() => window.open(cv.attachment, '_blank')}
						>
							{t('appCVContent.downloadCV')}
						</Button>
					</Box>
				)}

				{/* Last Updated */}
				{cv.lastUpdatedAt && (
					<Typography variant="body2" sx={{ marginTop: 3 }}>
						{`${t('appCVContent.lastUpdatedAt')}: ${new Date(cv.lastUpdatedAt).toLocaleString()}`}
					</Typography>
				)}
			</Box>
		</Box>
	);
};

AppCVDetails.propTypes = {
	cv: PropTypes.shape({
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
				interviews: PropTypes.string,
				startDate: PropTypes.string,
			}),
			summary: PropTypes.string,
		}),
		keySkills: PropTypes.arrayOf(
			PropTypes.shape({
				category: PropTypes.string,
				skills: PropTypes.arrayOf(PropTypes.string),
			})
		),
		profiles: PropTypes.shape({
			areasOfExpertise: PropTypes.arrayOf(PropTypes.string),
			keyResponsibilities: PropTypes.arrayOf(PropTypes.string),
		}),
		workExperience: PropTypes.arrayOf(
			PropTypes.shape({
				company: PropTypes.string,
				from: PropTypes.string,
				to: PropTypes.string,
				position: PropTypes.string,
				location: PropTypes.string,
				activities: PropTypes.arrayOf(
					PropTypes.shape({
						project: PropTypes.string,
						tasks: PropTypes.arrayOf(PropTypes.string),
					})
				),
				achievements: PropTypes.arrayOf(PropTypes.string),
				toolsAndTechnologies: PropTypes.arrayOf(PropTypes.string),
			})
		),
		education: PropTypes.arrayOf(
			PropTypes.shape({
				institution: PropTypes.string,
				degree: PropTypes.string,
				fieldOfStudy: PropTypes.string,
				year: PropTypes.string,
				achievements: PropTypes.arrayOf(PropTypes.string),
			})
		),
		certifications: PropTypes.arrayOf(
			PropTypes.shape({
				title: PropTypes.string,
				institution: PropTypes.string,
				year: PropTypes.string,
				description: PropTypes.string,
			})
		),
		skillsAndQualifications: PropTypes.shape({
			technicalSkills: PropTypes.arrayOf(PropTypes.string),
			softSkills: PropTypes.arrayOf(PropTypes.string),
			languages: PropTypes.arrayOf(
				PropTypes.shape({
					language: PropTypes.string,
					proficiency: PropTypes.objectOf(PropTypes.string),
				})
			),
		}),
		projectsAndAchievements: PropTypes.arrayOf(
			PropTypes.shape({
				title: PropTypes.string,
				description: PropTypes.string,
				date: PropTypes.string,
				impact: PropTypes.string,
			})
		),
		interestsAndHobbies: PropTypes.arrayOf(PropTypes.string),
		references: PropTypes.arrayOf(
			PropTypes.shape({
				name: PropTypes.string,
				position: PropTypes.string,
				company: PropTypes.string,
				contact: PropTypes.shape({
					phone: PropTypes.string,
					email: PropTypes.string,
				}),
			})
		),
		attachment: PropTypes.string,
		tags: PropTypes.arrayOf(PropTypes.string),
		lastUpdatedAt: PropTypes.string,
	}),
};

export default AppCVDetails;
