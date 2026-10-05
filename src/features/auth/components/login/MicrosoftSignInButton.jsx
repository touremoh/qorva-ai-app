import PropTypes from 'prop-types';
import { Box, Button, Divider, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** "Sign in with Microsoft", under the password form; rendered only when the environment offers it. */
const MicrosoftSignInButton = ({ onClick, disabled }) => {
	const { t } = useTranslation();
	return (
		<>
			<Divider sx={{ my: 2.5, borderColor: tokens.line.main }}>
				<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle }}>{t('login.sso.or')}</Typography>
			</Divider>
			<Button fullWidth variant="outlined" onClick={onClick} disabled={disabled} data-testid="sso-microsoft"
				startIcon={<Box component="img" src="/microsoft-logo.svg" alt="" sx={{ width: 18, height: 18 }} />}
				sx={{
					py: 1.2, borderRadius: 1.5, textTransform: 'none', fontWeight: 600, fontSize: tokens.fontSize.body2,
					color: tokens.ink.strong, borderColor: tokens.line.main,
					'&:hover': { borderColor: tokens.ink.subtle, backgroundColor: tokens.surface.subtle },
				}}>
				{t('login.sso.microsoft')}
			</Button>
		</>
	);
};

MicrosoftSignInButton.propTypes = { onClick: PropTypes.func.isRequired, disabled: PropTypes.bool };

export default MicrosoftSignInButton;
