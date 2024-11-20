// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { Box } from '@mui/material';
import AppHeader from '../components/headers/AppHeader.jsx';
import AppFooter from '../components/footer/AppFooter.jsx';
import AppContent from '../components/contents/AppContent.jsx';

const DefaultLayout = () => {
	const [content, setContent] = useState(null);
	const [language, setLanguage] = useState('en');

	const handleMenuItemClick = (menuItem) => {
		console.log(menuItem);
		setContent(menuItem);
	};

	const handleLanguageChange = (languageCode) => {
		console.log(languageCode);
		setLanguage(languageCode);
	};

	return (
		<Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
			{/* Section 1: Header */}
			<AppHeader onMenuItemClick={handleMenuItemClick} onLanguageChange={handleLanguageChange} />

			{/* Section 2: Content */}
			<AppContent content={content} language={language} />

			{/* Section 3: Footer */}
			<AppFooter language={language} />
		</Box>
	);
};

export default DefaultLayout;
