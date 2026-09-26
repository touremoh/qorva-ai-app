import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';

/** Why the set/reset-password link failed, with the way out: a new link, or login. */
const SetPasswordLinkError = ({ kind, requestNewLinkTo }) => {
	const { t } = useTranslation();
	if (!kind) return null;
	const config = {
		invalid: {
			message: t('setPassword.errorInvalid', 'This link is invalid or has expired.'),
			action: (
				<Button color="inherit" size="small" component={RouterLink} to={requestNewLinkTo}>
					{t('setPassword.requestNewLink', 'Request a new link')}
				</Button>
			),
		},
		used: {
			message: t('setPassword.errorUsed', 'This link has already been used.'),
			action: (
				<Button color="inherit" size="small" component={RouterLink} to="/login">
					{t('setPassword.goToLogin', 'Log in')}
				</Button>
			),
		},
		generic: {
			message: t('setPassword.errorGeneric', 'Something went wrong. Please try again.'),
			action: null,
		},
	}[kind];

	return (
		<Alert severity="error" sx={{ mb: 2, borderRadius: 1.5, fontSize: tokens.fontSize.body2 }} action={config.action}>
			{config.message}
		</Alert>
	);
};

SetPasswordLinkError.propTypes = {
	/** 'invalid' (401) | 'used' (409) | 'generic'; empty renders nothing. */
	kind: PropTypes.oneOf(['', 'invalid', 'used', 'generic']),
	requestNewLinkTo: PropTypes.string.isRequired,
};

export default SetPasswordLinkError;
