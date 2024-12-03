// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Box, Typography } from '@mui/material';
import JobContent from "./JobsContent.jsx";
import AppCVContent from "./cv/AppCVContent.jsx";
import {COMP_ID_SCREENING, COMP_ID_CVLIB, COMP_ID_INSIGHTS, COMP_ID_SETTINGS, COMP_ID_JOBS, COMP_ID_LOGOUT} from "../../constants.js";
import AppCVScreening from "./screening/AppCVScreening.jsx";

const AppContent = ({ content }) => {
	const renderContent = () => {
		switch (content) {
			case COMP_ID_SCREENING:
				return <AppCVScreening />;
			case COMP_ID_JOBS:
				return <JobContent />;
			case COMP_ID_CVLIB:
				return <AppCVContent />;
			case COMP_ID_INSIGHTS:
				return <Typography variant="h4">Analytics Section Content</Typography>;
			case COMP_ID_SETTINGS:
				return <Typography variant="h4">Account Settings Content</Typography>;
			case COMP_ID_LOGOUT:
				return <Typography variant="h4">You have been logged out</Typography>;
			default:
				return <AppCVScreening />;
		}
	};

	return (
		<Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
			{renderContent()}
		</Box>
	);
};

export default AppContent;
