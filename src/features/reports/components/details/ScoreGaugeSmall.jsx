import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { getColor } from '../../model/reportDetails.js';
import * as tokens from '../../../../theme/tokens.js';

const ScoreGaugeSmall = ({ value }) => {
	const [animated, setAnimated] = useState(false);
	const r = 28, sw = 6, size = 72;
	const circ = 2 * Math.PI * r;
	const color = getColor(value);
	useEffect(() => { const id = setTimeout(() => setAnimated(true), 80); return () => clearTimeout(id); }, []);
	const offset = animated ? circ * (1 - value / 100) : circ;
	return (
		<Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
				<circle cx={size/2} cy={size/2} r={r} fill="none" stroke={tokens.line.main} strokeWidth={sw} />
				<circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
					strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
					transform={`rotate(-90 ${size/2} ${size/2})`}
					style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.25,1,0.5,1)', filter: `drop-shadow(0 0 5px ${color}70)` }}
				/>
			</svg>
			<Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
			</Box>
		</Box>
	);
};
ScoreGaugeSmall.propTypes = {
	value: PropTypes.number.isRequired,
};

export default ScoreGaugeSmall;
