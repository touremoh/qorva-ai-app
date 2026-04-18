import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const AppFooter = () => {
	const { t } = useTranslation();

	return (
		<Box
			component="footer"
			sx={{
				height: 40,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: '#f8fafc',
				borderTop: '1px solid #e2e8f0',
				flexShrink: 0,
			}}
		>
			<Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>
				© {new Date().getFullYear()} {t('footer.rightsReserved')}
			</Typography>
		</Box>
	);
};

export default AppFooter;
