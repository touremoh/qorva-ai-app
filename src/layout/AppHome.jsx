// src/pages/AppHome.jsx
// eslint-disable-next-line no-unused-vars
import React, {useEffect, useState} from 'react';
import { Box } from '@mui/material';
import AppHeader from '../components/headers/AppHeader.jsx';

import AppContent from '../components/contents/AppContent.jsx';
import AppSidebar from "../components/menu/AppSidebar.jsx";
import UpgradeDialog from "../components/demo/UpgradeDialog.jsx";
import { BulkImportProvider } from "../contexts/BulkImportContext.jsx";
import { CandidateOutreachProvider } from "../contexts/CandidateOutreachContext.jsx";
import { AgentRunProvider } from "../contexts/AgentRunContext.jsx";
import CandidateOutreachDock from "../features/outreach/components/CandidateOutreachDock.jsx";
import {logPageView} from "../utils/analytics.js";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {
	COMP_ID_COPILOT,
	COMP_ID_CVLIB,
	COMP_ID_CONFIGURATION,
	COMP_ID_DASHBOARD,
	COMP_ID_JOBS,
	COMP_ID_LIBRARY_QUALITY,
	COMP_ID_REPORTS,
	COMP_ID_PIPELINE,
	COMP_ID_SETTINGS,
	COMP_ID_USAGE_MONITORING,
} from "../constants.js";

// The active panel lives in the URL (/app/<tab>) so a refresh keeps the user where
// they were and panels are deep-linkable. "/" still works and shows the dashboard.
const TAB_TO_COMP = {
	'dashboard': COMP_ID_DASHBOARD,
	'cvs': COMP_ID_CVLIB,
	'library-quality': COMP_ID_LIBRARY_QUALITY,
	'configuration': COMP_ID_CONFIGURATION,
	'jobs': COMP_ID_JOBS,
	'copilot': COMP_ID_COPILOT,
	'reports': COMP_ID_REPORTS,
	'pipeline': COMP_ID_PIPELINE,
	'usage': COMP_ID_USAGE_MONITORING,
	'settings': COMP_ID_SETTINGS,
};
const COMP_TO_TAB = Object.fromEntries(Object.entries(TAB_TO_COMP).map(([tab, comp]) => [comp, tab]));

// Tabs that moved: old slug → where it lives now, so bookmarks keep working.
const MOVED_TABS = {
	'email-templates': { comp: COMP_ID_CONFIGURATION, to: '/app/configuration?section=email-templates' },
	// AI Resume Chat and Talent Intelligence are Copilot now (2026-10-05).
	'chat': { comp: COMP_ID_COPILOT, to: '/app/copilot' },
	'intelligence': { comp: COMP_ID_COPILOT, to: '/app/copilot' },
};

const AppHome = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { tab } = useParams();
	const content = TAB_TO_COMP[tab] ?? MOVED_TABS[tab]?.comp ?? COMP_ID_DASHBOARD;

	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

	const handleSidebarToggle = () => setIsSidebarOpen(prev => !prev);
	const handleSidebarCollapse = () => setIsSidebarCollapsed(prev => !prev);
	const handleContentChange = (newContent) =>
		navigate(`/app/${COMP_TO_TAB[newContent] ?? 'dashboard'}`);

	useEffect(() => {
		if (MOVED_TABS[tab]) navigate(MOVED_TABS[tab].to, { replace: true });
	}, [tab, navigate]);

	useEffect(() => {
		logPageView();
	}, [location]);

	return (
		<BulkImportProvider>
		<CandidateOutreachProvider>
		<AgentRunProvider>
		<Box sx={{ display: 'flex', height: '100vh', bottom: 0 }}>

			{/* Sidebar */}
			<AppSidebar
				isSidebarOpen={isSidebarOpen}
				isSidebarCollapsed={isSidebarCollapsed}
				handleSidebarToggle={handleSidebarToggle}
				handleSidebarCollapse={handleSidebarCollapse}
				handleContentChange={handleContentChange}
				activeContent={content}
			/>

			{/* Main Content Wrapper */}
			<Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
				{/* Header */}
				<AppHeader
					handleContentChange={handleContentChange}
					contentTitle={content}
					isSidebarCollapsed={isSidebarCollapsed}
				/>

				{/* Content */}
				<AppContent content={content} isSidebarCollapsed={isSidebarCollapsed} />
			</Box>

			{/* Global demo → paid upgrade flow (opened via window event) */}
			<UpgradeDialog />

			{/* Candidate email composer — docked bottom-right, survives panel switches */}
			<CandidateOutreachDock />
		</Box>
		</AgentRunProvider>
		</CandidateOutreachProvider>
		</BulkImportProvider>
	);
};

export default AppHome;
