// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Box } from '@mui/material';

const AppContent = ({ content, language }) => {
	return (
		<Box sx={{height: '100vh', display: 'flex', flexDirection: 'column' }}>
			{content} + {language}
		</Box>
	);
};

export default AppContent;
