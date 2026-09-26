import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../theme/tokens.js';

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
				backgroundColor: tokens.surface.subtle,
				borderTop: `1px solid ${tokens.line.main}`,
				flexShrink: 0,
			}}
		>
			<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle }}>
				© {new Date().getFullYear()} {t('footer.rightsReserved')}
			</Typography>
		</Box>
	);
};

export default AppFooter;
