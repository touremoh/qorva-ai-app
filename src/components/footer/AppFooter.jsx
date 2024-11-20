// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const AppFooter = ({ language }) => {
	const { t } = useTranslation();

	const currentYear = () => {
		return new Date().getFullYear();
	};

	return (
		<Box
			component="footer"
			sx={{ height: '3vh', width: '100%', marginLeft: 0, backgroundColor: '#232F3E', padding: '16px', textAlign: 'center', color: 'white', position: 'fixed', bottom: 0, left: 0 }}
		>
			<Typography variant="body2">
				© {currentYear()} {t('footer.rightsReserved')}
			</Typography>
		</Box>
	);
};

export default AppFooter;
