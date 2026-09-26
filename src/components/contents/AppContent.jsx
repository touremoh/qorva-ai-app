import { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress } from '@mui/material';
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_COLLAPSED } from '../menu/AppSidebar.jsx';
import {
	COMP_ID_CVLIB,
	COMP_ID_EMAIL_TEMPLATES,
	COMP_ID_LIBRARY_QUALITY,
	COMP_ID_REPORTS,
	COMP_ID_SETTINGS,
	COMP_ID_JOBS,
	COMP_ID_DASHBOARD,
	COMP_ID_CHAT,
	COMP_ID_INTELLIGENCE,
	COMP_ID_USAGE_MONITORING,
} from "../../constants.js";
import DemoBanner from "../demo/DemoBanner.jsx";
import { isDemoUser } from "../../utils/demoMode.js";
import * as tokens from '../../theme/tokens.js';

// Each tab's screen is its own chunk: the first load only fetches the tab being opened.
const JobContent = lazy(() => import('../../features/jobs/components/JobsContent.jsx'));
const AppCVContent = lazy(() => import('../../features/cv/components/AppCVContent.jsx'));
const AppLibraryQuality = lazy(() => import('../../features/library-quality/components/AppLibraryQuality.jsx'));
const AppEmailTemplates = lazy(() => import('../../features/email-templates/components/AppEmailTemplates.jsx'));
const AppMatchingReports = lazy(() => import('../../features/reports/components/AppMatchingReports.jsx'));
const QorvaDashboard = lazy(() => import('../../features/dashboard/components/QorvaDashboard.jsx'));
const AccountSettings = lazy(() => import('../../features/settings/components/AccountSettings.jsx'));
const AppAIResumeChat = lazy(() => import('../../features/chat/components/AppAIResumeChat.jsx'));
const AppLibraryInsights = lazy(() => import('../../features/intelligence/components/AppLibraryInsights.jsx'));
const UsageMonitoringContent = lazy(() => import('../../features/usage/components/UsageMonitoringContent.jsx'));

const TabLoading = () => (
	<Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
		<CircularProgress size={28} sx={{ color: tokens.brand.main }} />
	</Box>
);

const AppContent = ({ content, isSidebarCollapsed }) => {
	const demo = isDemoUser();
	const renderContent = () => {
		switch (content) {
			case COMP_ID_DASHBOARD:
				return <QorvaDashboard />;
			case COMP_ID_CVLIB:
				return <AppCVContent />;
			case COMP_ID_LIBRARY_QUALITY:
				return <AppLibraryQuality />;
			case COMP_ID_EMAIL_TEMPLATES:
				return <AppEmailTemplates />;
			case COMP_ID_JOBS:
				return <JobContent />;
			case COMP_ID_INTELLIGENCE:
				return <AppLibraryInsights />;
			case COMP_ID_REPORTS:
				return <AppMatchingReports />;
			case COMP_ID_CHAT:
				return <AppAIResumeChat />;
			case COMP_ID_USAGE_MONITORING:
				return <UsageMonitoringContent />;
			case COMP_ID_SETTINGS:
				return <AccountSettings />
			default:
				return <QorvaDashboard />;
		}
	};

	return (
		<Box component="main" sx={{
			position: 'fixed',
			left: { xs: 0, md: isSidebarCollapsed ? `${SIDEBAR_WIDTH_COLLAPSED}px` : `${SIDEBAR_WIDTH}px` },
			right: 0,
			top: '64px',
			bottom: 0,
			margin: 0,
			backgroundColor: tokens.surface.subtle,
			p: 0,
			display: 'flex',
			flexDirection: 'column',
			overflow: 'hidden',
			transition: 'left 0.2s ease',
		}}>
			{demo && <DemoBanner />}
			<Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
				<Suspense fallback={<TabLoading />}>
					{renderContent()}
				</Suspense>
			</Box>
		</Box>
	);
};

AppContent.propTypes = {
	content: PropTypes.string,
	isSidebarCollapsed: PropTypes.bool,
};

export default AppContent;
