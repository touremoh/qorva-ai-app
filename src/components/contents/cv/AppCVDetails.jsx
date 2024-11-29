import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
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
				}}
			>
				<Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
					{t('appCVContent.personalInformation')}
				</Typography>

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

				<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
					{t('appCVContent.contactInfo.phone')}
				</Typography>
				<Typography variant="body2">{cv.personalInformation.contact.phone}</Typography>
				<Divider sx={{ my: 1 }} />

				<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
					{t('appCVContent.contactInfo.email')}
				</Typography>
				<Typography variant="body2">{cv.personalInformation.contact.email}</Typography>
				<Divider sx={{ my: 1 }} />

				<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
					{t('appCVContent.contactInfo.linkedin')}
				</Typography>
				<Typography variant="body2">{cv.personalInformation.contact.socialLinks.linkedin}</Typography>
				<Divider sx={{ my: 1 }} />

				<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
					{t('appCVContent.contactInfo.github')}
				</Typography>
				<Typography variant="body2">{cv.personalInformation.contact.socialLinks.github}</Typography>
				<Divider sx={{ my: 1 }} />

				<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
					{t('appCVContent.contactInfo.website')}
				</Typography>
				<Typography variant="body2">{cv.personalInformation.contact.socialLinks.website}</Typography>
				<Divider sx={{ my: 1 }} />

				<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
					{t('appCVContent.availability.interviews')}
				</Typography>
				<Typography variant="body2">{cv.personalInformation.availability.interviews}</Typography>
				<Divider sx={{ my: 1 }} />

				<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
					{t('appCVContent.availability.startDate')}
				</Typography>
				<Typography variant="body2">{cv.personalInformation.availability.startDate}</Typography>
				<Divider sx={{ my: 1 }} />

				<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
					{t('appCVContent.summary')}
				</Typography>
				<Typography variant="body2">{cv.personalInformation.summary}</Typography>
				<Divider sx={{ my: 1 }} />
			</Box>

			{/* Section 2: Rest of the CV */}
			<Box
				sx={{
					flex: 2,
					overflowY: 'auto',
					padding: 2,
				}}
			>
				<Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
					{t('appCVContent.details')}
				</Typography>

				{/* Work Experience */}
				<Box sx={{ marginBottom: 3 }}>
					<Typography
						variant="subtitle1"
						sx={{
							border: '1px solid lightgray',
							borderRadius: '8px',
							padding: 1,
							marginBottom: 1,
							fontWeight: 'bold',
							backgroundColor: '#f1f1f1'
						}}
					>
						{t('appCVContent.workExperience')}
					</Typography>
					{cv.workExperience.map((work, index) => (
						<Box key={index} sx={{ marginBottom: 2 }}>
							<Typography variant="body2">{`${work.company} (${work.from} - ${work.to})`}</Typography>
							<Typography variant="body2">{work.position}</Typography>
							<Typography variant="body2">{work.location}</Typography>
						</Box>
					))}
				</Box>

				{/* Education */}
				<Box sx={{ marginBottom: 3 }}>
					<Typography
						variant="subtitle1"
						sx={{
							border: '1px solid lightgray',
							borderRadius: '8px',
							padding: 1,
							marginBottom: 1,
							fontWeight: 'bold',
							backgroundColor: '#f1f1f1'
						}}
					>
						{t('appCVContent.education')}
					</Typography>
					{cv.education.map((edu, index) => (
						<Box key={index}>
							<Typography variant="body2">{`${edu.institution} - ${edu.degree}`}</Typography>
							<Typography variant="body2">{`${t('appCVContent.fieldOfStudy')}: ${edu.fieldOfStudy}`}</Typography>
							<Typography variant="body2">{`${t('appCVContent.graduationYear')}: ${edu.year}`}</Typography>
						</Box>
					))}
				</Box>

				{/* Certifications */}
				<Box sx={{ marginBottom: 3 }}>
					<Typography
						variant="subtitle1"
						sx={{
							border: '1px solid lightgray',
							borderRadius: '8px',
							padding: 1,
							marginBottom: 1,
							fontWeight: 'bold',
							backgroundColor: '#f1f1f1'
						}}
					>
						{t('appCVContent.certifications')}
					</Typography>
					{cv.certifications.map((cert, index) => (
						<Box key={index}>
							<Typography variant="body2">{`${cert.title} - ${cert.institution}`}</Typography>
							<Typography variant="body2">{`${t('appCVContent.year')}: ${cert.year}`}</Typography>
							<Typography variant="body2">{cert.description}</Typography>
						</Box>
					))}
				</Box>

				{/* References */}
				<Box>
					<Typography
						variant="subtitle1"
						sx={{
							border: '1px solid lightgray',
							borderRadius: '8px',
							padding: 1,
							marginBottom: 1,
							fontWeight: 'bold',
							backgroundColor: '#f1f1f1'
						}}
					>
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
			</Box>
		</Box>
	);
};

AppCVDetails.propTypes = {
	cv: PropTypes.shape({
		personalInformation: PropTypes.shape({
			name: PropTypes.string.isRequired,
			contact: PropTypes.shape({
				phone: PropTypes.string.isRequired,
				email: PropTypes.string.isRequired,
				socialLinks: PropTypes.shape({
					linkedin: PropTypes.string,
					github: PropTypes.string,
					website: PropTypes.string,
				}),
			}).isRequired,
			role: PropTypes.string.isRequired,
			availability: PropTypes.shape({
				interviews: PropTypes.string.isRequired,
				startDate: PropTypes.string.isRequired,
			}).isRequired,
			summary: PropTypes.string.isRequired,
		}).isRequired,
		workExperience: PropTypes.arrayOf(
			PropTypes.shape({
				company: PropTypes.string.isRequired,
				from: PropTypes.string.isRequired,
				to: PropTypes.string.isRequired,
				position: PropTypes.string.isRequired,
				location: PropTypes.string,
			})
		),
		education: PropTypes.arrayOf(
			PropTypes.shape({
				institution: PropTypes.string.isRequired,
				degree: PropTypes.string.isRequired,
				fieldOfStudy: PropTypes.string,
				year: PropTypes.string.isRequired,
			})
		),
		certifications: PropTypes.arrayOf(
			PropTypes.shape({
				title: PropTypes.string.isRequired,
				institution: PropTypes.string.isRequired,
				year: PropTypes.string.isRequired,
				description: PropTypes.string,
			})
		),
		references: PropTypes.arrayOf(
			PropTypes.shape({
				name: PropTypes.string.isRequired,
				position: PropTypes.string.isRequired,
				company: PropTypes.string.isRequired,
				contact: PropTypes.shape({
					phone: PropTypes.string.isRequired,
					email: PropTypes.string.isRequired,
				}),
			})
		),
	}).isRequired,
};

export default AppCVDetails;
