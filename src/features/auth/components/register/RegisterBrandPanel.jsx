import PropTypes from 'prop-types';
import { Grid2, Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

/** Plan summary and product pitch beside the registration form. */
const RegisterBrandPanel = ({ trustItems }) => {
	const { t } = useTranslation();
	return (
		<>
		<Grid2
			size={{ xs: 12, md: 5 }}
			sx={{
				background: 'linear-gradient(160deg, #1a2940 0%, #232F3E 55%, #2d3f54 100%)',
				padding: { xs: '40px 28px', sm: '52px 44px' },
				display: { xs: 'none', md: 'flex' },
				flexDirection: 'column',
				justifyContent: 'space-between',
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			<Box sx={{
				position: 'absolute', top: -60, right: -60,
				width: 220, height: 220, borderRadius: '50%',
				background: 'rgba(98,156,68,0.12)', pointerEvents: 'none',
			}} />
			<Box sx={{
				position: 'absolute', bottom: -80, left: -40,
				width: 280, height: 280, borderRadius: '50%',
				background: 'rgba(37,99,235,0.1)', pointerEvents: 'none',
			}} />

			<Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
				<Box sx={{
					display: 'inline-flex', alignItems: 'center', gap: 1,
					backgroundColor: 'rgba(98,156,68,0.18)',
					border: '1px solid rgba(98,156,68,0.35)',
					borderRadius: 5, px: 2, py: 0.6, mb: 3,
				}}>
					<Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#629C44' }} />
					<Typography sx={{ fontSize: '0.75rem', color: '#a3c988', fontWeight: 500 }}>
						{t('login.panel.badge')}
					</Typography>
				</Box>

				<Typography sx={{
					fontSize: '1.65rem', fontWeight: 700, color: '#ffffff',
					lineHeight: 1.3, letterSpacing: '-0.03em', mb: 3,
				}}>
					{t('registration.panel.headline')}
				</Typography>

				{trustItems.map((item) => (
					<Box key={item.title} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
						<Box sx={{
							width: 20, height: 20, mt: '2px', borderRadius: '50%', flexShrink: 0,
							backgroundColor: 'rgba(98,156,68,0.2)',
							border: '1px solid rgba(98,156,68,0.5)',
							display: 'flex', alignItems: 'center', justifyContent: 'center',
						}}>
							<Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#629C44' }} />
						</Box>
						<Box>
							<Typography sx={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 600, lineHeight: 1.3 }}>
								{item.title}
							</Typography>
							<Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
								{item.desc}
							</Typography>
						</Box>
					</Box>
				))}
			</Box>
		</Grid2>
		</>
	);
};

RegisterBrandPanel.propTypes = {
	trustItems: PropTypes.any,
};

export default RegisterBrandPanel;
