// src/pages/AppHome.jsx
import React, {useEffect, useState} from 'react';
import { Box } from '@mui/material';
import AppHeader from '../components/headers/AppHeader.jsx';
import AppFooter from '../components/footer/AppFooter.jsx';
import AppContent from '../components/contents/AppContent.jsx';
import AppSidebar from "../components/menu/AppSidebar.jsx";
import {logPageView} from "../utils/analytics.js";
import {useLocation} from "react-router-dom";

const AppHome = () => {
	const [content, setContent] = useState('dashboard');
	const location = useLocation();

	// Handlers for sidebar open/close for smaller screens
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	// Handler for sidebar toggle
	const handleSidebarToggle = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	// Handler for updating content
	const handleContentChange = (newContent) => {
		setContent(newContent);
	};

	useEffect(() => {
		logPageView();
	}, [location]);

	return (
		<Box sx={{ display: 'flex', height: '100vh' }}>

			{/* Sidebar */}
			<AppSidebar
				isSidebarOpen={isSidebarOpen}
				handleSidebarToggle={handleSidebarToggle}
				handleContentChange={handleContentChange}
			/>

			{/* Main Content Wrapper */}
			<Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
				{/* Header */}
				<AppHeader
					handleSidebarToggle={handleSidebarToggle}
					handleContentChange={handleContentChange}
					contentTitle={content}
				/>

				{/* Content */}
				<AppContent content={content} />

				{/* Footer */}
				<AppFooter />
			</Box>
		</Box>
	);
};

export default AppHome;
