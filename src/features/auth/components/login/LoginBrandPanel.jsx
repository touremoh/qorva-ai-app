import PropTypes from 'prop-types';
import { Grid2, Typography, Button, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** Product pitch beside the sign-in form (wide screens). */
const LoginBrandPanel = ({ navigate }) => {
	const { t } = useTranslation();
	return (
		<>
		<Grid2
			size={{ xs: 12, md: 5 }}
			sx={{
				background: `linear-gradient(160deg, ${tokens.ink.navyDeep} 0%, ${tokens.ink.navy} 55%, ${tokens.ink.slateDeep} 100%)`,
				padding: { xs: '40px 28px', sm: '52px 44px' },
				display: { xs: 'none', md: 'flex' },
				flexDirection: 'column',
				justifyContent: 'space-between',
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			{/* Decorative circles */}
			<Box sx={{
				position: 'absolute', top: -60, right: -60,
				width: 220, height: 220, borderRadius: '50%',
				background: alpha(tokens.brand.main, 0.12),
				pointerEvents: 'none',
			}} />
			<Box sx={{
				position: 'absolute', bottom: -80, left: -40,
				width: 280, height: 280, borderRadius: '50%',
				background: 'rgba(37,99,235,0.1)',
				pointerEvents: 'none',
			}} />

			{/* Top content */}
			<Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
				<Box
					sx={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 1,
						backgroundColor: alpha(tokens.brand.main, 0.18),
						border: `1px solid ${alpha(tokens.brand.main, 0.35)}`,
						borderRadius: 5,
						px: 2,
						py: 0.6,
						mb: 3,
					}}
				>
					<Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: tokens.brand.main }} />
					<Typography sx={{ fontSize: '0.75rem', color: tokens.brand.pale, fontWeight: 500 }}>
						{t('login.panel.badge')}
					</Typography>
				</Box>

				<Typography
					sx={{
						fontSize: '1.65rem',
						fontWeight: 700,
						color: tokens.ink.inverse,
						lineHeight: 1.3,
						letterSpacing: '-0.03em',
						mb: 2,
					}}
				>
					{t('login.panel.headline')}
				</Typography>

				<Typography
					sx={{
						fontSize: '0.875rem',
						color: tokens.ink.subtle,
						lineHeight: 1.65,
						maxWidth: 280,
						mb: 3.5,
					}}
				>
					{t('login.panel.subtext')}
				</Typography>

				{/* Feature bullets */}
				{[
					t('login.panel.bullet1'),
					t('login.panel.bullet2'),
					t('login.panel.bullet3'),
				].map((label) => (
					<Box key={label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
						<Box
							sx={{
								width: 20, height: 20, mt: '2px', borderRadius: '50%', flexShrink: 0,
								backgroundColor: alpha(tokens.brand.main, 0.2),
								border: `1px solid ${alpha(tokens.brand.main, 0.5)}`,
								display: 'flex', alignItems: 'center', justifyContent: 'center',
							}}
						>
							<Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: tokens.brand.main }} />
						</Box>
						<Typography sx={{ fontSize: '0.82rem', color: tokens.ink.faint, lineHeight: 1.4 }}>
							{label}
						</Typography>
					</Box>
				))}
			</Box>

			{/* Bottom CTA */}
			<Box sx={{ position: 'relative', zIndex: 1 }}>
				<Typography sx={{ color: tokens.ink.subtle, fontSize: '0.82rem', mb: 0.5 }}>
					{t('login.noAccount')}
				</Typography>
				<Typography sx={{ color: tokens.ink.muted, fontSize: '0.75rem', mb: 1.5 }}>
					{t('login.panel.freeToStart')}
				</Typography>
				<Button
					variant="outlined"
					onClick={() => navigate('/register')}
					sx={{
						color: tokens.ink.inverse,
						borderColor: 'rgba(255,255,255,0.25)',
						borderRadius: 1.5,
						textTransform: 'none',
						fontWeight: 500,
						fontSize: '0.85rem',
						px: 2.5,
						py: 0.9,
						backdropFilter: 'blur(4px)',
						backgroundColor: 'rgba(255,255,255,0.04)',
						transition: 'border-color 0.2s, background-color 0.2s',
						'&:hover': {
							borderColor: 'rgba(255,255,255,0.55)',
							backgroundColor: 'rgba(255,255,255,0.09)',
						},
					}}
				>
					{t('login.signUpButton')}
				</Button>
			</Box>
		</Grid2>
		</>
	);
};

LoginBrandPanel.propTypes = {
	navigate: PropTypes.any,
};

export default LoginBrandPanel;
