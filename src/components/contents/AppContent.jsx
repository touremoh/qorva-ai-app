// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Box, Typography } from '@mui/material';
import JobContent from "./JobsContent.jsx";
import AppCVContent from "./cv/AppCVContent.jsx";

const AppContent = ({ content }) => {
	const renderContent = () => {
		switch (content) {
			case 'jobs':
				return <JobContent />;
			case 'cvs':
				return <AppCVContent />;
			case 'screening':
				return <Typography variant="h4">Screening Section Content</Typography>;
			case 'analytics':
				return <Typography variant="h4">Analytics Section Content</Typography>;
			case 'accountSettings':
				return <Typography variant="h4">Account Settings Content</Typography>;
			case 'logout':
				return <Typography variant="h4">You have been logged out</Typography>;
			default:
				return <JobContent />;
		}
	};

	return (
		<Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
			{renderContent()}
		</Box>
	);
};

export default AppContent;
