import { Box } from '@mui/material';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';

const TypingDots = () => (
	<Box sx={{
		display: 'inline-flex', alignItems: 'center', gap: 1,
		px: 2, py: 1, borderRadius: '16px 16px 16px 4px',
		backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
		'@keyframes blink': {
			'0%, 100%': { opacity: 0.2 }, '50%': { opacity: 1 },
		},
	}}>
		<SmartToyOutlinedIcon sx={{ fontSize: 14, color: '#629C44' }} />
		<Box sx={{ display: 'flex', gap: 0.4, alignItems: 'center' }}>
			{[0, 0.2, 0.4].map((delay, i) => (
				<Box key={i} sx={{
					width: 5, height: 5, borderRadius: '50%',
					backgroundColor: '#629C44',
					animation: `blink 1.2s ease-in-out infinite ${delay}s`,
				}} />
			))}
		</Box>
	</Box>
);

export default TypingDots;
