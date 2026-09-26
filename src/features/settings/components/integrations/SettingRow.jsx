import PropTypes from 'prop-types';
import { Box, Switch, Typography } from '@mui/material';
import { GREEN } from '../../model/integrations.js';
import * as tokens from '../../../../theme/tokens.js';

const SettingRow = ({ label, hint, checked, onChange, disabled }) => (
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
		<Box sx={{ flex: 1, minWidth: 0 }}>
			<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.strong, fontWeight: 500 }}>{label}</Typography>
			<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle }}>{hint}</Typography>
		</Box>
		<Switch size="small" checked={!!checked} onChange={onChange} disabled={disabled}
			sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: GREEN }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: GREEN } }} />
	</Box>
);
SettingRow.propTypes = {
	label: PropTypes.node,
	hint: PropTypes.node,
	checked: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
};

export default SettingRow;
