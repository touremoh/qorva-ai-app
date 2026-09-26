import { Typography, Box } from '@mui/material';
import LanguageSwitcher from '../../../../components/languages/LanguageSwitcher.jsx';
import * as tokens from '../../../../theme/tokens.js';

/** Logo and language switch above the registration page. */
const RegisterTopBar = () => {
	return (
		<>
		<Box
			sx={{
				width: '100%',
				borderBottom: '1px solid rgba(226,232,240,0.8)',
				backgroundColor: 'rgba(255,255,255,0.75)',
				backdropFilter: 'blur(8px)',
				flexShrink: 0,
				position: 'sticky',
				top: 0,
				zIndex: 10,
			}}
		>
			<Box
				sx={{
					width: '100%',
					maxWidth: { xs: '100%', sm: '95%', md: '860px', lg: '920px' },
					mx: 'auto',
					px: { xs: 3, md: 0 },
					py: 1.75,
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
					<Box component="img" src="/logo.svg" alt="Qorva" sx={{ width: 30, height: 30 }} />
					<Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: tokens.ink.strong, letterSpacing: '-0.02em' }}>
						Qorva
					</Typography>
				</Box>
				<Box sx={{ ml: 'auto' }}>
					<LanguageSwitcher />
				</Box>
			</Box>
		</Box>
		</>
	);
};

export default RegisterTopBar;
