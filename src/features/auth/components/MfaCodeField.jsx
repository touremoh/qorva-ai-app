import { TextField } from '@mui/material';
import PropTypes from 'prop-types';

export const MFA_CODE_LENGTH = 6;

/**
 * Six-digit one-time code input shared by the login code step and the MFA settings dialog.
 * Keeps digits only (so a pasted "123 456" works), and lets the OS offer the code from the
 * email via autocomplete="one-time-code".
 */
const MfaCodeField = ({ value, onChange, label, error, helperText, disabled, autoFocus, sx }) => (
	<TextField
		label={label}
		value={value}
		onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, MFA_CODE_LENGTH))}
		error={error}
		helperText={helperText || ' '}
		disabled={disabled}
		autoFocus={autoFocus}
		fullWidth
		size="small"
		autoComplete="one-time-code"
		slotProps={{
			htmlInput: {
				inputMode: 'numeric',
				pattern: '[0-9]*',
				maxLength: MFA_CODE_LENGTH,
				style: { letterSpacing: '0.5em', fontSize: '1.15rem', fontWeight: 600, textAlign: 'center' },
			},
		}}
		sx={sx}
	/>
);

MfaCodeField.propTypes = {
	value: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	label: PropTypes.string,
	error: PropTypes.bool,
	helperText: PropTypes.string,
	disabled: PropTypes.bool,
	autoFocus: PropTypes.bool,
	sx: PropTypes.object,
};

export default MfaCodeField;
