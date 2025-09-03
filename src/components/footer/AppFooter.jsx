// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const AppFooter = () => {
	const { t } = useTranslation();

	const currentYear = () => {
		return new Date().getFullYear();
	};

	return (
		<Box
			component="footer"
			sx={{ height: '3vh', bottom: 0, left: '15%', position: 'fixed', width: '100%', marginLeft: 0, color: 'black', backgroundColor: '#f8f8f8', padding: '16px', textAlign: 'center' }}
		>
			<Typography variant="body2">
				© {currentYear()} {t('footer.rightsReserved')}
			</Typography>
		</Box>
	);
};

export default AppFooter;
