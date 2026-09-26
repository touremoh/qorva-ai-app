import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { GREEN, labelSx } from '../../model/filterRail.js';
import * as tokens from '../../../../theme/tokens.js';

const GroupLabel = ({ text, count, onReset }) => (
	<Typography component="div" sx={labelSx}>
		<span>{text}{count > 0 ? ` · ${count}` : ''}</span>
		{count > 0 && onReset && (
			<Box component="button" type="button" onClick={onReset} sx={{
				border: 0, background: 'none', p: 0, cursor: 'pointer',
				fontSize: tokens.fontSize.caption, fontWeight: 600, color: GREEN, textTransform: 'none', letterSpacing: 0,
				'&:hover': { textDecoration: 'underline' },
			}}>
				×
			</Box>
		)}
	</Typography>
);

GroupLabel.propTypes = { text: PropTypes.string.isRequired, count: PropTypes.number, onReset: PropTypes.func };

export default GroupLabel;
