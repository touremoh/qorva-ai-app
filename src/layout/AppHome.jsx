// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { Box } from '@mui/material';
import AppHeader from '../components/headers/AppHeader.jsx';
import AppFooter from '../components/footer/AppFooter.jsx';
import AppContent from '../components/contents/AppContent.jsx';

const AppHome = () => {
	const [content, setContent] = useState(null);

	const handleMenuItemClick = (menuItem) => {
		console.log(menuItem);
		setContent(menuItem);
	};

	return (
		<Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
			{/* Section 1: Header */}
			<AppHeader onMenuItemClick={handleMenuItemClick} />

			{/* Section 2: Content */}
			<AppContent content={content} />

			{/* Section 3: Footer */}
			<AppFooter />
		</Box>
	);
};

export default AppHome;
