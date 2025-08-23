// eslint-disable-next-line no-unused-vars
import React from 'react';
import {Box, Typography} from '@mui/material';
import JobContent from "./jobs/JobsContent.jsx";
import AppCVContent from "./cv/AppCVContent.jsx";
import {
	COMP_ID_CVLIB,
	COMP_ID_REPORTS,
	COMP_ID_SETTINGS,
	COMP_ID_JOBS,
	COMP_ID_DASHBOARD,
	COMP_ID_CHAT
} from "../../constants.js";
import AppScreeningReports from "./reports/AppScreeningReports.jsx";
import QorvaDashboard from "./dashboard/QorvaDashboard.jsx";
import AccountSettings from "./account-settings/AccountSettings.jsx";
import AppAIResumeChat from "./chats/AppAIResumeChat.jsx";

const AppContent = ({ content }) => {
	const renderContent = () => {
		switch (content) {
			case COMP_ID_DASHBOARD:
				return <QorvaDashboard />;
			case COMP_ID_CVLIB:
				return <AppCVContent />;
			case COMP_ID_JOBS:
				return <JobContent />;
			case COMP_ID_REPORTS:
				return <AppScreeningReports />;
			case COMP_ID_CHAT:
				return <AppAIResumeChat />;
			case COMP_ID_SETTINGS:
				return <AccountSettings />
			default:
				return <QorvaDashboard />;
		}
	};

	return (
		<Box component="main" sx={{ position: 'absolute', left: '15%', right: 0, flexGrow: 1, margin: '0', backgroundColor: 'lightgrey', padding: '2rem', overflowY: 'scroll' }}>
			{renderContent()}
		</Box>
	);
};

export default AppContent;
