import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const AppScreeningJobPostDetails = ({ selectedJobDetails }) => {
	const { t } = useTranslation();

	return (
		<Box sx={{ width: '24%', height: '75vh', backgroundColor: 'white', padding: 2, boxShadow: 1, overflowY: 'scroll' }}>
			{selectedJobDetails ? (
				<>
					<Typography variant="h6" gutterBottom>
						{selectedJobDetails.title}
					</Typography>
					<Divider sx={{ marginBottom: 2 }} />
					<Typography
						component="div"
						dangerouslySetInnerHTML={{ __html: selectedJobDetails?.description }}
						sx={{
							textAlign: 'justify', // Justify text
							lineHeight: 1.5, // Adjust line height for better readability
							marginTop: 2, // Add spacing from the title
							color: '#333', // Optional: Set a readable color
						}}
					/>
				</>
			) : (
				<Typography variant="body1">
					{t('appCVScreening.noJobPostSelected')}
				</Typography>
			)}
		</Box>
	);
};

AppScreeningJobPostDetails.propTypes = {
	selectedJobDetails: PropTypes.shape({
		title: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired
	})
};

export default AppScreeningJobPostDetails;
