import PropTypes from 'prop-types';
import { TextField, InputAdornment } from '@mui/material';
import { fieldSpacingSx } from '../../model/styles.js';
import * as tokens from '../../../../theme/tokens.js';

/** One registration field: an outlined input with a leading icon and its live validation message. */
const RegisterField = ({ name, label, Icon, form, type, select = false, sx = fieldSpacingSx, children }) => {
	const { values, touched, errors, onChange, onBlur } = form;
	const shownError = touched[name] && errors[name];
	return (
		<TextField
			select={select}
			label={label}
			name={name}
			type={type}
			variant="outlined"
			fullWidth
			required
			size="small"
			value={values[name]}
			onChange={onChange}
			onBlur={onBlur(name)}
			error={Boolean(shownError)}
			helperText={shownError || ' '}
			sx={sx}
			slotProps={{
				input: {
					startAdornment: (
						<InputAdornment position="start">
							<Icon sx={{ fontSize: tokens.iconSize.lg, color: tokens.ink.subtle }} />
						</InputAdornment>
					),
				},
			}}
		>
			{children}
		</TextField>
	);
};

RegisterField.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.node,
	Icon: PropTypes.elementType.isRequired,
	/** { values, touched, errors, onChange, onBlur(name) } shared by every field of the form. */
	form: PropTypes.shape({
		values: PropTypes.object.isRequired,
		touched: PropTypes.object.isRequired,
		errors: PropTypes.object.isRequired,
		onChange: PropTypes.func.isRequired,
		onBlur: PropTypes.func.isRequired,
	}).isRequired,
	type: PropTypes.string,
	select: PropTypes.bool,
	sx: PropTypes.object,
	children: PropTypes.node,
};

export default RegisterField;
