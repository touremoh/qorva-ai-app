import { Box } from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import * as tokens from '../../../theme/tokens.js';

const TypingDots = () => (
	<Box sx={{
		display: 'inline-flex', alignItems: 'center', gap: 1,
		px: 2, py: 1, borderRadius: '16px 16px 16px 4px',
		backgroundColor: tokens.surface.paper, border: `1px solid ${tokens.line.main}`,
		'@keyframes blink': {
			'0%, 100%': { opacity: 0.2 }, '50%': { opacity: 1 },
		},
	}}>
		<SmartToyOutlinedIcon sx={{ fontSize: 14, color: tokens.brand.text }} />
		<Box sx={{ display: 'flex', gap: 0.4, alignItems: 'center' }}>
			{[0, 0.2, 0.4].map((delay, i) => (
				<Box key={i} sx={{
					width: 5, height: 5, borderRadius: '50%',
					backgroundColor: tokens.brand.main,
					animation: `blink 1.2s ease-in-out infinite ${delay}s`,
				}} />
			))}
		</Box>
	</Box>
);

export default TypingDots;
