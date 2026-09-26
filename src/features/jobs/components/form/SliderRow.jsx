import PropTypes from 'prop-types';
import { Box, Typography, Slider } from '@mui/material';
import { THEME_GREEN, sliderSx } from '../../model/jobForm.js';
import * as tokens from '../../../../theme/tokens.js';

const SliderRow = ({ label, value, onChange, min, max, step, format }) => (
	<Box sx={{ mb: 0.5 }}>
		<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
			<Typography sx={{ fontSize: '0.75rem', color: tokens.ink.muted }}>{label}</Typography>
			<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: THEME_GREEN }}>{format(value)}</Typography>
		</Box>
		<Slider value={value} onChange={(_, v) => onChange(v)} min={min} max={max} step={step} size="small" sx={sliderSx} />
	</Box>
);

SliderRow.propTypes = {
	label: PropTypes.node,
	value: PropTypes.number,
	onChange: PropTypes.func.isRequired,
	min: PropTypes.number,
	max: PropTypes.number,
	step: PropTypes.number,
	format: PropTypes.func.isRequired,
};

// ─── Step 2: Scoring/Matching rules form ──────────────────────────────────────

export default SliderRow;
