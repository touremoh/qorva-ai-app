// src/pages/AppHome.jsx
import React, {useEffect, useState} from 'react';
import { Box } from '@mui/material';
import AppHeader from '../components/headers/AppHeader.jsx';

import AppContent from '../components/contents/AppContent.jsx';
import AppSidebar from "../components/menu/AppSidebar.jsx";
import UpgradeDialog from "../components/demo/UpgradeDialog.jsx";
import {logPageView} from "../utils/analytics.js";
import {useLocation} from "react-router-dom";

const AppHome = () => {
	const [content, setContent] = useState('dashboard');
	const location = useLocation();

	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

	const handleSidebarToggle = () => setIsSidebarOpen(prev => !prev);
	const handleSidebarCollapse = () => setIsSidebarCollapsed(prev => !prev);
	const handleContentChange = (newContent) => setContent(newContent);

	useEffect(() => {
		logPageView();
	}, [location]);

	return (
		<Box sx={{ display: 'flex', height: '100vh', bottom: 0 }}>

			{/* Sidebar */}
			<AppSidebar
				isSidebarOpen={isSidebarOpen}
				isSidebarCollapsed={isSidebarCollapsed}
				handleSidebarToggle={handleSidebarToggle}
				handleSidebarCollapse={handleSidebarCollapse}
				handleContentChange={handleContentChange}
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
		</Box>
	);
};

export default AppHome;
