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
					<Typography variant="body1">{selectedJobDetails.description}</Typography>
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
