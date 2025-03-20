import React from 'react';
import {Box, Typography, Divider, Button, Grid2, Paper, TextField, Grid} from '@mui/material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import TimelineItem from "@mui/lab/TimelineItem";
import QorvaCVTimeline, {QorvaTimelineSeparator} from "../../timeline/Timeline.jsx";
import TimelineContent from "@mui/lab/TimelineContent";
import WorkIcon from "@mui/icons-material/Work";
import PersonIcon from "@mui/icons-material/Person";
import ContactsIcon from '@mui/icons-material/Contacts';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import SchoolIcon from "@mui/icons-material/School";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import "../../timeline/Timeline.css"
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ConstructionIcon from '@mui/icons-material/Construction';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import DownhillSkiingIcon from '@mui/icons-material/DownhillSkiing';
import LinkIcon from '@mui/icons-material/Link';
import LabelIcon from '@mui/icons-material/Label';

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
		// <Box sx={{ display: 'flex', gap: 2, padding: 2, height: '100%' }}>
		// 	{/* Section 1: Personal Details */}
		// 	<Box
		// 		sx={{
		// 			flex: 1,
		// 			overflowY: 'auto',
		// 			padding: 2,
		// 			borderRight: '1px solid lightgray',
		// 			textAlign: 'left'
		// 		}}
		// 	>
		// 		<Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
		// 			{t('appCVContent.personalInformation')}
		// 		</Typography>
		//
		// 		{/* Personal Information */}
		// 		{cv.personalInformation && (
		// 			<>
		// 				<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
		// 					{t('appCVContent.name')}
		// 				</Typography>
		// 				<Typography variant="body2">{cv.personalInformation.name}</Typography>
		// 				<Divider sx={{ my: 1 }} />
		//
		// 				<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
		// 					{t('appCVContent.title')}
		// 				</Typography>
		// 				<Typography variant="body2">{cv.personalInformation.role}</Typography>
		// 				<Divider sx={{ my: 1 }} />
		//
		// 				{/* Contact Information */}
		// 				{cv.personalInformation.contact && (
		// 					<>
		// 						<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
		// 							{t('appCVContent.contactInfo.title')}
		// 						</Typography>
		// 						{cv.personalInformation.contact.phone && (
		// 							<>
		// 								<Typography variant="body2">{`${t('appCVContent.contactInfo.phone')}: ${cv.personalInformation.contact.phone}`}</Typography>
		// 							</>
		// 						)}
		// 						{cv.personalInformation.contact.email && (
		// 							<>
		// 								<Typography variant="body2">{`${t('appCVContent.contactInfo.email')}: ${cv.personalInformation.contact.email}`}</Typography>
		// 							</>
		// 						)}
		// 						{cv.personalInformation.contact.socialLinks && (
		// 							<>
		// 								{cv.personalInformation.contact.socialLinks.linkedin && (
		// 									<Typography variant="body2">{`${t('appCVContent.contactInfo.linkedin')}: ${cv.personalInformation.contact.socialLinks.linkedin}`}</Typography>
		// 								)}
		// 								{cv.personalInformation.contact.socialLinks.github && (
		// 									<Typography variant="body2">{`${t('appCVContent.contactInfo.github')}: ${cv.personalInformation.contact.socialLinks.github}`}</Typography>
		// 								)}
		// 								{cv.personalInformation.contact.socialLinks.website && (
		// 									<Typography variant="body2">{`${t('appCVContent.contactInfo.website')}: ${cv.personalInformation.contact.socialLinks.website}`}</Typography>
		// 								)}
		// 							</>
		// 						)}
		// 						<Divider sx={{ my: 1 }} />
		// 					</>
		// 				)}
		//
		// 				{/* Availability */}
		// 				{cv.personalInformation.availability && (
		// 					<>
		// 						<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
		// 							{t('appCVContent.availability.title')}
		// 						</Typography>
		// 						{cv.personalInformation.availability.interviews && (
		// 							<Typography variant="body2">{`${t('appCVContent.availability.interviews')}: ${cv.personalInformation.availability.interviews}`}</Typography>
		// 						)}
		// 						{cv.personalInformation.availability.startDate && (
		// 							<Typography variant="body2">{`${t('appCVContent.availability.startDate')}: ${cv.personalInformation.availability.startDate}`}</Typography>
		// 						)}
		// 						<Divider sx={{ my: 1 }} />
		// 					</>
		// 				)}
		//
		// 				{/* Summary */}
		// 				{cv.personalInformation.summary && (
		// 					<>
		// 						<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
		// 							{t('appCVContent.summary')}
		// 						</Typography>
		// 						<Typography variant="body2">{cv.personalInformation.summary}</Typography>
		// 						<Divider sx={{ my: 1 }} />
		// 					</>
		// 				)}
		// 			</>
		// 		)}
		//
		// 		{/* Key Skills */}
		// 		{cv.keySkills && cv.keySkills.length > 0 && (
		// 			<>
		// 				<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
		// 					{t('appCVContent.keySkills')}
		// 				</Typography>
		// 				{cv.keySkills.map((skill, index) => (
		// 					<Box key={index} sx={{ marginBottom: 1 }}>
		// 						<Typography variant="body2" sx={{ fontWeight: 'bold' }}>
		// 							{skill.category}:
		// 						</Typography>
		// 						<Typography variant="body2">{skill.skills.join(', ')}</Typography>
		// 					</Box>
		// 				))}
		// 				<Divider sx={{ my: 1 }} />
		// 			</>
		// 		)}
		//
		// 		{/* Profiles */}
		// 		{cv.profiles && (
		// 			<>
		// 				<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
		// 					{t('appCVContent.profiles')}
		// 				</Typography>
		// 				{cv.profiles.areasOfExpertise && (
		// 					<>
		// 						<Typography variant="body2" sx={{ fontWeight: 'bold' }}>
		// 							{t('appCVContent.areasOfExpertise')}
		// 						</Typography>
		// 						<Typography variant="body2">{cv.profiles.areasOfExpertise.join(', ')}</Typography>
		// 					</>
		// 				)}
		// 				{cv.profiles.keyResponsibilities && (
		// 					<>
		// 						<Typography variant="body2" sx={{ fontWeight: 'bold' }}>
		// 							{t('appCVContent.keyResponsibilities')}
		// 						</Typography>
		// 						<Typography variant="body2">{cv.profiles.keyResponsibilities.join(', ')}</Typography>
		// 					</>
		// 				)}
		// 				<Divider sx={{ my: 1 }} />
		// 			</>
		// 		)}
		// 	</Box>
		//
		// 	{/* Section 2: Rest of the CV Details */}
		// 	<Box
		// 		sx={{
		// 			flex: 2,
		// 			overflowY: 'auto',
		// 			padding: 2
		// 		}}
		// 	>
		// 		<Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
		// 			{t('appCVContent.details')}
		// 		</Typography>
		//
		// 		{/* Work Experience */}
		// 		{cv.workExperience && cv.workExperience.length > 0 && (
		// 			<Box sx={{ marginBottom: 3 }}>
		// 				<Typography variant="subtitle1" sx={{ fontWeight: 'bold', backgroundColor: '#f1f1f1', padding: 1, borderRadius: '8px' }}>
		// 					{t('appCVContent.workExperience')}
		// 				</Typography>
		// 				{cv.workExperience.map((work, index) => (
		// 					<Box key={index} sx={{ marginBottom: 2 }}>
		// 						<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{`${work.company} (${work.from} - ${work.to})`}</Typography>
		// 						<Typography variant="body2">{work.position}</Typography>
		// 						<Typography variant="body2">{work.location}</Typography>
		// 						{work.activities && (
		// 							<>
		// 								<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t('appCVContent.activities')}</Typography>
		// 								{work.activities.map((activity, activityIndex) => (
		// 									<Box key={activityIndex}>
		// 										<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{activity.project}</Typography>
		// 										{activity.tasks.map((task, taskIndex) => (
		// 											<Typography variant="body2" key={taskIndex}>{`- ${task}`}</Typography>
		// 										))}
		// 									</Box>
		// 								))}
		// 							</>
		// 						)}
		// 						{work.achievements && (
		// 							<>
		// 								<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t('appCVContent.achievements')}</Typography>
		// 								{work.achievements.map((achievement, achievementIndex) => (
		// 									<Typography variant="body2" key={achievementIndex}>{`- ${achievement}`}</Typography>
		// 								))}
		// 							</>
		// 						)}
		// 						{work.toolsAndTechnologies && (
		// 							<>
		// 								<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t('appCVContent.toolsAndTechnologies')}</Typography>
		// 								<Typography variant="body2">{work.toolsAndTechnologies.join(', ')}</Typography>
		// 							</>
		// 						)}
		// 					</Box>
		// 				))}
		// 			</Box>
		// 		)}
		//
		// 		{/* Education */}
		// 		{cv.education && cv.education.length > 0 && (
		// 			<Box sx={{ marginBottom: 3 }}>
		// 				<Typography variant="subtitle1" sx={{ fontWeight: 'bold', backgroundColor: '#f1f1f1', padding: 1, borderRadius: '8px' }}>
		// 					{t('appCVContent.education')}
		// 				</Typography>
		// 				{cv.education.map((edu, index) => (
		// 					<Box key={index}>
		// 						<Typography variant="body2">{`${edu.institution} - ${edu.degree}`}</Typography>
		// 						<Typography variant="body2">{`${t('appCVContent.fieldOfStudy')}: ${edu.fieldOfStudy}`}</Typography>
		// 						<Typography variant="body2">{`${t('appCVContent.graduationYear')}: ${edu.year}`}</Typography>
		// 						{edu.achievements && (
		// 							<>
		// 								<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t('appCVContent.achievements')}</Typography>
		// 								{edu.achievements.map((achievement, achievementIndex) => (
		// 									<Typography variant="body2" key={achievementIndex}>{`- ${achievement}`}</Typography>
		// 								))}
		// 							</>
		// 						)}
		// 					</Box>
		// 				))}
		// 			</Box>
		// 		)}
		//
		// 		{/* Certifications */}
		// 		{cv.certifications && cv.certifications.length > 0 && (
		// 			<Box sx={{ marginBottom: 3 }}>
		// 				<Typography variant="subtitle1" sx={{ fontWeight: 'bold', backgroundColor: '#f1f1f1', padding: 1, borderRadius: '8px' }}>
		// 					{t('appCVContent.certifications')}
		// 				</Typography>
		// 				{cv.certifications.map((cert, index) => (
		// 					<Box key={index}>
		// 						<Typography variant="body2">{`${cert.title} - ${cert.institution}`}</Typography>
		// 						<Typography variant="body2">{`${t('appCVContent.yearOfCertification')}: ${cert.year}`}</Typography>
		// 						{cert.description && <Typography variant="body2">{cert.description}</Typography>}
		// 					</Box>
		// 				))}
		// 			</Box>
		// 		)}
		//
		// 		{/* Skills and Qualifications */}
		// 		{cv.skillsAndQualifications && (
		// 			<Box sx={{ marginBottom: 3 }}>
		// 				<Typography variant="subtitle1" sx={{ fontWeight: 'bold', backgroundColor: '#f1f1f1', padding: 1, borderRadius: '8px' }}>
		// 					{t('appCVContent.skillsAndQualifications')}
		// 				</Typography>
		// 				{cv.skillsAndQualifications.technicalSkills && (
		// 					<>
		// 						<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t('appCVContent.technicalSkills')}</Typography>
		// 						<Typography variant="body2">{cv.skillsAndQualifications.technicalSkills.join(', ')}</Typography>
		// 					</>
		// 				)}
		// 				{cv.skillsAndQualifications.softSkills && (
		// 					<>
		// 						<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t('appCVContent.softSkills')}</Typography>
		// 						<Typography variant="body2">{cv.skillsAndQualifications.softSkills.join(', ')}</Typography>
		// 					</>
		// 				)}
		// 				{cv.skillsAndQualifications.languages && (
		// 					<>
		// 						<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t('appCVContent.languages')}</Typography>
		// 						{cv.skillsAndQualifications.languages.map((lang, index) => (
		// 							<Box key={index}>
		// 								<Typography variant="body2">{`${lang.language}`}</Typography>
		// 								{Object.entries(lang.proficiency).map(([key, value]) => (
		// 									<Typography key={key} variant="body2">{`${t(`appCVContent.proficiency.${key}`)}: ${value}`}</Typography>
		// 								))}
		// 							</Box>
		// 						))}
		// 					</>
		// 				)}
		// 			</Box>
		// 		)}
		//
		// 		{/* Projects and Achievements */}
		// 		{cv.projectsAndAchievements && cv.projectsAndAchievements.length > 0 && (
		// 			<Box sx={{ marginBottom: 3 }}>
		// 				<Typography variant="subtitle1" sx={{ fontWeight: 'bold', backgroundColor: '#f1f1f1', padding: 1, borderRadius: '8px' }}>
		// 					{t('appCVContent.projectsAndAchievements')}
		// 				</Typography>
		// 				{cv.projectsAndAchievements.map((project, index) => (
		// 					<Box key={index}>
		// 						<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{project.title}</Typography>
		// 						<Typography variant="body2">{project.description}</Typography>
		// 						<Typography variant="body2">{`${t('appCVContent.completionDate')}: ${project.date}`}</Typography>
		// 						<Typography variant="body2">{`${t('appCVContent.impact')}: ${project.impact}`}</Typography>
		// 					</Box>
		// 				))}
		// 			</Box>
		// 		)}
		//
		// 		{/* Interests and Hobbies */}
		// 		{cv.interestsAndHobbies && (
		// 			<Box sx={{ marginBottom: 3 }}>
		// 				<Typography variant="subtitle1" sx={{ fontWeight: 'bold', backgroundColor: '#f1f1f1', padding: 1, borderRadius: '8px' }}>
		// 					{t('appCVContent.interestsAndHobbies')}
		// 				</Typography>
		// 				<Typography variant="body2">{cv.interestsAndHobbies.join(', ')}</Typography>
		// 			</Box>
		// 		)}
		//
		// 		{/* References */}
		// 		{cv.references && cv.references.length > 0 && (
		// 			<Box sx={{ marginBottom: 3 }}>
		// 				<Typography variant="subtitle1" sx={{ fontWeight: 'bold', backgroundColor: '#f1f1f1', padding: 1, borderRadius: '8px' }}>
		// 					{t('appCVContent.references')}
		// 				</Typography>
		// 				{cv.references.map((ref, index) => (
		// 					<Box key={index}>
		// 						<Typography variant="body2">{`${ref.name}, ${ref.position} at ${ref.company}`}</Typography>
		// 						<Typography variant="body2">{`${t('appCVContent.contactInfo.phone')}: ${ref.contact.phone}`}</Typography>
		// 						<Typography variant="body2">{`${t('appCVContent.contactInfo.email')}: ${ref.contact.email}`}</Typography>
		// 					</Box>
		// 				))}
		// 			</Box>
		// 		)}
		//
		// 		{/* Tags */}
		// 		{cv.tags && (
		// 			<Box sx={{ marginBottom: 3 }}>
		// 				<Typography variant="subtitle1" sx={{ fontWeight: 'bold', backgroundColor: '#f1f1f1', padding: 1, borderRadius: '8px' }}>
		// 					{t('appCVContent.tags')}
		// 				</Typography>
		// 				<Typography variant="body2">{cv.tags.join(', ')}</Typography>
		// 			</Box>
		// 		)}
		//
		// 		{/* Download CV Attachment */}
		// 		{cv.attachment && (
		// 			<Box sx={{ marginTop: 3, display: 'flex', justifyContent: 'flex-end' }}>
		// 				<Button
		// 					variant="contained"
		// 					color="primary"
		// 					startIcon={<GetAppIcon />}
		// 					onClick={() => window.open(cv.attachment, '_blank')}
		// 				>
		// 					{t('appCVContent.downloadCV')}
		// 				</Button>
		// 			</Box>
		// 		)}
		//
		// 		{/* Last Updated */}
		// 		{cv.lastUpdatedAt && (
		// 			<Typography variant="body2" sx={{ marginTop: 3 }}>
		// 				{`${t('appCVContent.lastUpdatedAt')}: ${new Date(cv.lastUpdatedAt).toLocaleString()}`}
		// 			</Typography>
		// 		)}
		// 	</Box>
		// </Box>

		<Box sx={{ padding: 2, height: '100%' }}>
			{/* Personal Information & Contact */}
			<Box sx={{display: 'flex', flexDirection: 'row'}}>
				{/* Personal Information */}
				<Grid2 item xs={12} md={6} lg={6}>
					<Grid2 container>
						<Grid2 item sm={12} md={6}>
							{cv.personalInformation && (
								<QorvaCVTimeline title={t('appCVContent.personalInformation')} icon={<PersonIcon />}>
									<TimelineItem>
										<QorvaTimelineSeparator />
										<TimelineContent>
											<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{t('appCVContent.name')}</Typography>
											<Typography variant="body2">{cv.personalInformation.name}</Typography>
										</TimelineContent>
									</TimelineItem>
									<TimelineItem>
										<QorvaTimelineSeparator />
										<TimelineContent>
											<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{t('appCVContent.title')}</Typography>
											<Typography variant="body2">{cv.personalInformation.role}</Typography>
										</TimelineContent>
									</TimelineItem>
									{cv.personalInformation.summary && (
										<TimelineItem>
											<QorvaTimelineSeparator />
											<TimelineContent>
												<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{t('appCVContent.summary')}</Typography>
												<Typography variant="body2">{cv.personalInformation.summary}</Typography>
											</TimelineContent>
										</TimelineItem>
									)}
								</QorvaCVTimeline>
							)}
						</Grid2>
					</Grid2>
				</Grid2>

				{/* Contact */}
				<Grid2 item xs={12} md={6} lg={6}>
					<Grid2 container>
						<Grid2 item sm={12} md={6}>
							{cv.personalInformation.contact && (
								<QorvaCVTimeline title={t('appCVContent.contactInfo.title')} icon={<ContactsIcon />}>
									<TimelineItem>
										<QorvaTimelineSeparator />
										<TimelineContent>
											<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{t('appCVContent.contactInfo.phone')}</Typography>
											<Typography variant="body2">{cv.personalInformation.contact.phone}</Typography>
										</TimelineContent>
									</TimelineItem>
									<TimelineItem>
										<QorvaTimelineSeparator />
										<TimelineContent>
											<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{t('appCVContent.contactInfo.email')}</Typography>
											<Typography variant="body2">{cv.personalInformation.contact.email}</Typography>
										</TimelineContent>
									</TimelineItem>
									{cv.personalInformation.contact.socialLinks && cv.personalInformation.contact.socialLinks.linkedin && (
										<TimelineItem>
											<QorvaTimelineSeparator />
											<TimelineContent>
												<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{t('appCVContent.contactInfo.linkedin')}</Typography>
												<Typography variant="body2">{cv.personalInformation.contact.socialLinks.linkedin}</Typography>
											</TimelineContent>
										</TimelineItem>
									)}
									{cv.personalInformation.contact.socialLinks && cv.personalInformation.contact.socialLinks.github && (
										<TimelineItem>
											<QorvaTimelineSeparator />
											<TimelineContent>
												<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{t('appCVContent.contactInfo.github')}</Typography>
												<Typography variant="body2">{cv.personalInformation.contact.socialLinks.github}</Typography>
											</TimelineContent>
										</TimelineItem>
									)}
									{cv.personalInformation.contact.socialLinks && cv.personalInformation.contact.socialLinks.website && (
										<TimelineItem>
											<QorvaTimelineSeparator />
											<TimelineContent>
												<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{t('appCVContent.contactInfo.website')}</Typography>
												<Typography variant="body2">{cv.personalInformation.contact.socialLinks.website}</Typography>
											</TimelineContent>
										</TimelineItem>
									)}
								</QorvaCVTimeline>
							)}
						</Grid2>
					</Grid2>
				</Grid2>
			</Box>

			{/* Educational And Experiences*/}
			<Grid2 container className="section pb_45">
				<Grid2 item xs={12} md={6} lg={6} xl={6}>
					<Grid2 container item xs={12} className={"resume_timeline"}>
						{/*Working Experiences  */}
						<Grid2 item sm={12} md={6} lg={6} xl={6}>
							<QorvaCVTimeline
								title={t('appCVContent.workExperience')}
								icon={<WorkIcon />}
							>
								{cv.workExperience.map((work, index)  => (
									<TimelineItem key={index}>
										<QorvaTimelineSeparator />
										<TimelineContent className={"timeline_content"}>
											<Typography className={"timeline_title"}>{`${work.company} (${work.from} - ${work.to})`}</Typography>
											<Typography variant="body2" className={"timeline_description"}>{work.position}</Typography>
											<Typography variant="body2" className={"timeline_description"}>{work.location}</Typography>

											{work.activities && work.activities.length > 0 && (
												<>
													<QorvaCVTimeline title={t('appCVContent.activities')} icon={<WorkHistoryIcon />}>
														{work.activities.map((activity, activityIndex) => (
															<TimelineItem key={activityIndex}>
																<QorvaTimelineSeparator />
																<TimelineContent>
																	<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{activity.project}</Typography>
																	{activity.tasks.map((task, taskIndex) => (
																		<Typography variant="body2" key={taskIndex}>{`- ${task}`}</Typography>
																	))}
																</TimelineContent>
															</TimelineItem>
														))}
													</QorvaCVTimeline>
												</>
											)}

										</TimelineContent>
									</TimelineItem>
								))}
							</QorvaCVTimeline>
						</Grid2>

						{/* Education  */}
						<Grid2 item sm={12} md={6} lg={6} xl={6}>
							<QorvaCVTimeline title={t('appCVContent.education')} icon={<SchoolIcon />}>
								{cv.education && cv.education.length > 0 && cv.education.map((edu, index)  => (
									<TimelineItem key={index}>
										<QorvaTimelineSeparator />
										<TimelineContent>
											<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{`${edu.degree} - ${edu.institution}`}</Typography>
											{edu.fieldOfStudy && (
												<Typography variant="body2">{`${t('appCVContent.fieldOfStudy')}: ${edu.fieldOfStudy}`}</Typography>
											)}
											{edu.year && (
												<Typography variant="body2">{`${t('appCVContent.graduationYear')}: ${edu.year}`}</Typography>
											)}
											{edu.achievements && edu.achievements.length > 0 && (
												<>
													<QorvaCVTimeline title={t('appCVContent.achievements')} icon={<EmojiEventsIcon />}>
														{edu.achievements.map((achievement, achievementIndex) => (
															<TimelineItem key={achievementIndex}>
																<QorvaTimelineSeparator />
																<TimelineContent>
																	{edu.achievements.map((achievement, achievementIndex) => (
																		<Typography variant="body2" key={achievementIndex}>{`- ${achievement}`}</Typography>
																	))}
																</TimelineContent>
															</TimelineItem>
														))}
													</QorvaCVTimeline>
												</>
											)}
										</TimelineContent>
									</TimelineItem>
								))}
							</QorvaCVTimeline>
						</Grid2>
					</Grid2>
				</Grid2>
			</Grid2>

			{/* Certifications */}
			{cv.certifications && cv.certifications.length > 0 && (
				<Grid2 container>
					<Grid2 item sm={12} md={6} lg={6} xl={6}>
						<QorvaCVTimeline title={t('appCVContent.certifications')} icon={<WorkspacePremiumIcon />}>
							{cv.certifications.map((cert, index) => (
								<TimelineItem key={index}>
									<QorvaTimelineSeparator />
									<TimelineContent>
										<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{`${cert.title} - ${cert.institution}`}</Typography>
										<Typography variant="body2">{`${t('appCVContent.yearOfCertification')}: ${cert.year}`}</Typography>
										{cert.description && <Typography variant="body2">{cert.description}</Typography>}
									</TimelineContent>
								</TimelineItem>
							))}
						</QorvaCVTimeline>
					</Grid2>
				</Grid2>
			)}

			{/* Skills and Qualifications */}
			{cv.skillsAndQualifications && cv.skillsAndQualifications.technicalSkills.length > 0 && cv.skillsAndQualifications.softSkills.length > 0 && cv.skillsAndQualifications.languages.length > 0 && (
				<Grid2 container>
					<Grid2 item sm={12} md={6} lg={6} xl={6}>
						<QorvaCVTimeline title={t('appCVContent.skillsAndQualifications')} icon={<ConstructionIcon />}>

							{cv.skillsAndQualifications.technicalSkills && (
								<TimelineItem>
									<QorvaTimelineSeparator />
									<TimelineContent>
										<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t('appCVContent.technicalSkills')}</Typography>
										<Typography variant="body2">{cv.skillsAndQualifications.technicalSkills.join(', ')}</Typography>
									</TimelineContent>
								</TimelineItem>
							)}
							{cv.skillsAndQualifications.softSkills && (
								<TimelineItem>
									<QorvaTimelineSeparator />
									<TimelineContent>
										<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t('appCVContent.softSkills')}</Typography>
										<Typography variant="body2">{cv.skillsAndQualifications.softSkills.join(', ')}</Typography>
									</TimelineContent>
								</TimelineItem>
							)}
							{cv.skillsAndQualifications.languages && (
								<TimelineItem>
									<QorvaTimelineSeparator />
									<TimelineContent>
										<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t('appCVContent.languages')}</Typography>
										<TableContainer component={Paper} sx={{ marginTop: 1 }}>
											<Table size="small">
												<TableHead>
													<TableRow sx={{ fontWeight: 'bold', backgroundColor: '#f1f1f1' }}>
														<TableCell align="left">{t('appCVContent.proficiency.langProfTitle')} </TableCell>
														<TableCell align="center">{t('appCVContent.proficiency.read')} </TableCell>
														<TableCell align="center">{t('appCVContent.proficiency.written')} </TableCell>
														<TableCell align="center">{t('appCVContent.proficiency.spoken')} </TableCell>
													</TableRow>
												</TableHead>
												<TableBody>
													{cv.skillsAndQualifications.languages.map((lang, index) => (
														<TableRow>
															<TableCell align="left">{`${lang.language}`}</TableCell>
															<TableCell align="center">{lang.proficiency['read'] ? lang.proficiency['read'] : 'N/A' }</TableCell>
															<TableCell align="center">{lang.proficiency['written'] ? lang.proficiency['written'] : 'N/A'} </TableCell>
															<TableCell align="center">{lang.proficiency['spoken'] ? lang.proficiency['spoken'] : 'NA/'} </TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</TableContainer>
									</TimelineContent>
								</TimelineItem>
							)}
						</QorvaCVTimeline>
					</Grid2>
				</Grid2>
			)}

			{/* Projects and Achievements */}
			{cv.projectsAndAchievements && cv.projectsAndAchievements.length > 0 && (
				<Grid2 container>
					<Grid2 item sm={12} md={6} lg={6} xl={6}>
						<QorvaCVTimeline title={t('appCVContent.projectsAndAchievements')} icon={<EmojiEventsIcon />}>
							{cv.projectsAndAchievements.map((project, index) => (
								<TimelineItem key={index}>
									<QorvaTimelineSeparator />
									<TimelineContent>
										<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{project.title}</Typography>
										{project.description && (<Typography variant="body2">{project.description}</Typography>)}
										{project.date && (<Typography variant="body2">{`${t('appCVContent.completionDate')}: ${project.date}`}</Typography>)}
										{project.impact && (<Typography variant="body2">{`${t('appCVContent.impact')}: ${project.impact}`}</Typography>)}
									</TimelineContent>
								</TimelineItem>
							))}
						</QorvaCVTimeline>
					</Grid2>
				</Grid2>
			)}

			{/* Interests and Hobbies */}
			{cv.interestsAndHobbies && cv.interestsAndHobbies.length > 0 && (
				<Grid2 container>
					<Grid2 item sm={12} md={6} lg={6} xl={6}>
						<QorvaCVTimeline title={t('appCVContent.interestsAndHobbies')} icon={<DownhillSkiingIcon/>}>
							<TimelineItem>
								<QorvaTimelineSeparator />
								<TimelineContent>
									<Typography variant="body2">{cv.interestsAndHobbies.join(', ')}</Typography>
								</TimelineContent>
							</TimelineItem>
						</QorvaCVTimeline>
					</Grid2>
				</Grid2>
			)}

			{/* References */}
			{cv.references && cv.references.length > 0 && (
				<Grid2 container>
					<Grid2 item sm={12} md={6} lg={6} xl={6}>
						<QorvaCVTimeline title={t('appCVContent.references')} icon={<LinkIcon />}>
							{cv.references.map((ref, index) => (
								<TimelineItem key={index}>
									<QorvaTimelineSeparator />
									<TimelineContent>
										<Typography variant="body2">{`${ref.name}, ${ref.position} at ${ref.company}`}</Typography>
										<Typography variant="body2">{`${t('appCVContent.contactInfo.phone')}: ${ref.contact.phone}`}</Typography>
										<Typography variant="body2">{`${t('appCVContent.contactInfo.email')}: ${ref.contact.email}`}</Typography>
									</TimelineContent>
								</TimelineItem>
							))}
						</QorvaCVTimeline>
					</Grid2>
				</Grid2>
			)}

			{/* Tags */}
			{cv.tags && cv.tags.length > 0 && (
				<Grid2 container>
					<Grid2 item sm={12} md={6} lg={6} xl={6}>
						<QorvaCVTimeline title={t('appCVContent.tags')} icon={<LabelIcon />}>
							<TimelineItem>
								<QorvaTimelineSeparator />
								<TimelineContent>
									<Typography variant="body2">{cv.tags.join(', ')}</Typography>
								</TimelineContent>
							</TimelineItem>
						</QorvaCVTimeline>
					</Grid2>
				</Grid2>
			)}

			{/* Update Info and Download button*/}
			{cv.lastUpdatedAt && (
				<Box sx={{ textAlign: 'center', paddingBottom: 2 }}>
					<Typography variant="body2" sx={{ marginTop: 3, fontStyle: 'italic' }}>
						{`${t('appCVContent.lastUpdatedAt')}: ${new Date(cv.lastUpdatedAt).toLocaleString()}`}
					</Typography>
				</Box>
			)}

			{/* Download CV Attachment */}

			{/* Last Updated */}
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
