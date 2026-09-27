import { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { verifyMfa, resendMfa } from '../api/authService.js';
import MfaCodeField, { MFA_CODE_LENGTH } from './MfaCodeField.jsx';
import useResendCountdown from '../../../components/mfa/useResendCountdown.js';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';
import { fieldSpacingSx } from '../model/styles.js';

// Codes after which this challenge is dead: the user has to go back and enter the password again.
const RESTART_CODES = new Set(['error.auth.mfa_challenge_invalid', 'error.auth.mfa_too_many_attempts']);

/**
 * Second sign-in step for accounts with email MFA on. Login.jsx swaps its password form for
 * this once /auth/login answers with a challenge instead of a token; a valid code yields the
 * same { jwt, user } payload, which goes back to Login's usual post-login routing.
 */
const MfaCodeStep = ({ challenge: initialChallenge, onVerified, onRestart }) => {
	const { t } = useTranslation();
	const [challenge, setChallenge] = useState(initialChallenge);
	const [code, setCode] = useState('');
	const [error, setError] = useState('');
	const [status, setStatus] = useState('idle'); // idle → loading → success
	const [resending, setResending] = useState(false);
	const secondsLeft = useResendCountdown(challenge.resendAvailableAt);

	const submit = async (value) => {
		if (status !== 'idle') return;
		if (value.length !== MFA_CODE_LENGTH) {
			setError(t('login.mfa.codeRequired', 'Enter the 6-digit code'));
			return;
		}
		setError('');
		setStatus('loading');
		try {
			const response = await verifyMfa(challenge.challengeId, value);
			setStatus('success');
			await onVerified(response.data.data);
		} catch (e) {
			setStatus('idle');
			const backend = e?.response?.data;
			if (RESTART_CODES.has(backend?.errorCode)) {
				onRestart(backend.message);
				return;
			}
			setCode('');
			setError(backend?.message || t('errors.unexpected', 'Something went wrong. Please try again.'));
		}
	};

	const handleChange = (value) => {
		setCode(value);
		if (error) setError('');
		// Submit as soon as the last digit lands (typing or pasting).
		if (value.length === MFA_CODE_LENGTH) submit(value);
	};

	const resend = async () => {
		setResending(true);
		setError('');
		try {
			const response = await resendMfa(challenge.challengeId);
			setChallenge(response.data.data);
			setCode('');
			toast.success(t('login.mfa.resent', 'A new code is on its way.'));
		} catch (e) {
			const backend = e?.response?.data;
			if (RESTART_CODES.has(backend?.errorCode)) {
				onRestart(backend.message);
				return;
			}
			setError(backend?.message || t('errors.unexpected', 'Something went wrong. Please try again.'));
		} finally {
			setResending(false);
		}
	};

	return (
		<Box>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.75 }}>
				<MarkEmailReadOutlinedIcon sx={{ color: tokens.brand.text, fontSize: tokens.iconSize.xl }} />
				<Typography variant="h5" sx={{ fontWeight: 700, color: tokens.ink.strong, letterSpacing: '-0.03em' }}>
					{t('login.mfa.title', 'Check your email')}
				</Typography>
			</Box>
			<Typography variant="body2" sx={{ color: tokens.ink.muted, mb: 3 }}>
				{t('login.mfa.subtitle', { email: challenge.maskedEmail, defaultValue: 'We sent a 6-digit code to {{email}}.' })}
			</Typography>

			{error && (
				<Alert severity="error" variant="filled" sx={{ mb: 2.5, borderRadius: 1.5, fontSize: tokens.fontSize.body2 }}>
					{error}
				</Alert>
			)}

			<Box component="form" noValidate onSubmit={(e) => { e.preventDefault(); submit(code); }}>
				<MfaCodeField
					label={t('login.mfa.codeLabel', 'Verification code')}
					value={code}
					onChange={handleChange}
					disabled={status !== 'idle'}
					autoFocus
					sx={fieldSpacingSx}
				/>

				<Button
					type="submit"
					fullWidth
					variant="contained"
					disabled={status !== 'idle'}
					sx={{
						mt: 0.5,
						py: 1.3,
						borderRadius: 1.5,
						fontWeight: 600,
						fontSize: tokens.fontSize.body,
						textTransform: 'none',
						backgroundColor: tokens.brand.main,
						boxShadow: `0 2px 8px ${alpha(tokens.brand.main, 0.35)}`,
						'&:hover': { backgroundColor: tokens.brand.hoverAlt },
						'&.Mui-disabled': status === 'success'
							? { backgroundColor: tokens.status.success.tint, color: tokens.status.success.text, boxShadow: 'none' }
							: { backgroundColor: tokens.brand.soft, color: 'rgba(255,255,255,0.9)', boxShadow: 'none' },
					}}
				>
					{status === 'loading' && (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<CircularProgress size={16} sx={{ color: 'rgba(255,255,255,0.9)' }} />
							{t('login.mfa.verifying', 'Verifying…')}
						</Box>
					)}
					{status === 'success' && (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
							<CheckCircleRoundedIcon sx={{ fontSize: tokens.iconSize.lg, color: tokens.status.success.main }} />
							{t('login.signedIn', 'Signed in!')}
						</Box>
					)}
					{status === 'idle' && t('login.mfa.verifyButton', 'Verify')}
				</Button>
			</Box>

			<Typography sx={{ color: tokens.ink.muted, fontSize: tokens.fontSize.small, mt: 2 }}>
				{t('login.mfa.help', "Didn't get it? Check your spam folder, or resend the code.")}
			</Typography>

			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
				<Button
					variant="text"
					size="small"
					onClick={() => onRestart('')}
					disabled={status !== 'idle'}
					sx={{ textTransform: 'none', color: tokens.ink.muted, px: 0, minWidth: 0 }}
				>
					{t('login.mfa.back', 'Back to sign in')}
				</Button>
				<Button
					variant="text"
					size="small"
					onClick={resend}
					disabled={secondsLeft > 0 || resending || status !== 'idle'}
					sx={{ textTransform: 'none', color: tokens.brand.text, fontWeight: 600, px: 0, minWidth: 0 }}
				>
					{secondsLeft > 0
						? t('login.mfa.resendIn', { seconds: secondsLeft, defaultValue: 'Resend code in {{seconds}}s' })
						: t('login.mfa.resend', 'Resend code')}
				</Button>
			</Box>
		</Box>
	);
};

MfaCodeStep.propTypes = {
	challenge: PropTypes.shape({
		challengeId: PropTypes.string.isRequired,
		maskedEmail: PropTypes.string,
		expiresAt: PropTypes.string,
		resendAvailableAt: PropTypes.string,
	}).isRequired,
	/** Receives the { jwt, user } payload; Login runs its normal post-login routing. */
	onVerified: PropTypes.func.isRequired,
	/** Back to the password form, optionally with a message to show there. */
	onRestart: PropTypes.func.isRequired,
};

export default MfaCodeStep;
