import PropTypes from 'prop-types';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import MfaCodeField, { MFA_CODE_LENGTH } from '../../../auth/components/MfaCodeField.jsx';
import { useTranslation } from 'react-i18next';
import { brandButtonSx, outlinedButtonSx } from '../../../../shared/ui/buttonSx.js';
import * as tokens from '../../../../theme/tokens.js';

const primaryButtonSx = brandButtonSx('0.8rem');
const neutralButtonSx = outlinedButtonSx('0.8rem');

/** Asks for the emailed code before switching two-step verification on or off. */
const MfaCodeDialog = ({ closeDialog, code, confirming, error, handleCodeChange, pending, resend, resending, secondsLeft }) => {
	const { t } = useTranslation();
	return (
		<>
		<Dialog open={Boolean(pending)} onClose={confirming ? undefined : closeDialog} maxWidth="xs" fullWidth>
			<DialogTitle sx={{ fontSize: tokens.fontSize.body, fontWeight: 700 }}>
				{pending?.action === 'enable'
					? t('accountSettings.mfa.dialogTitleEnable', 'Turn on two-step verification')
					: t('accountSettings.mfa.dialogTitleDisable', 'Turn off two-step verification')}
			</DialogTitle>
			<DialogContent>
				<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.soft, mb: 2 }}>
					{t('accountSettings.mfa.dialogBody', {
						email: pending?.challenge?.maskedEmail ?? '',
						defaultValue: 'Enter the 6-digit code we sent to {{email}}.',
					})}
				</Typography>
				{error && (
					<Alert severity="error" sx={{ mb: 2, fontSize: tokens.fontSize.body2 }}>{error}</Alert>
				)}
				<Box component="form" noValidate onSubmit={(e) => { e.preventDefault(); confirm(code); }}>
					<MfaCodeField
						label={t('login.mfa.codeLabel', 'Verification code')}
						value={code}
						onChange={handleCodeChange}
						disabled={confirming}
						autoFocus
					/>
				</Box>
				<Button
					variant="text"
					size="small"
					onClick={resend}
					disabled={secondsLeft > 0 || resending || confirming}
					sx={{ textTransform: 'none', color: 'brand.main', fontWeight: 600, px: 0, minWidth: 0 }}
				>
					{secondsLeft > 0
						? t('login.mfa.resendIn', { seconds: secondsLeft, defaultValue: 'Resend code in {{seconds}}s' })
						: t('login.mfa.resend', 'Resend code')}
				</Button>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button onClick={closeDialog} disabled={confirming} sx={{ ...neutralButtonSx, border: 'none' }}>
					{t('accountSettings.mfa.cancel', 'Cancel')}
				</Button>
				<Button
					variant="contained"
					onClick={() => confirm(code)}
					disabled={confirming || code.length !== MFA_CODE_LENGTH}
					startIcon={confirming ? <CircularProgress size={12} color="inherit" /> : null}
					sx={primaryButtonSx}
				>
					{t('accountSettings.mfa.confirm', 'Confirm')}
				</Button>
			</DialogActions>
		</Dialog>
		</>
	);
};

MfaCodeDialog.propTypes = {
	closeDialog: PropTypes.func,
	code: PropTypes.any,
	confirming: PropTypes.any,
	error: PropTypes.any,
	handleCodeChange: PropTypes.func,
	pending: PropTypes.any,
	resend: PropTypes.any,
	resending: PropTypes.any,
	secondsLeft: PropTypes.any,
};

export default MfaCodeDialog;
