import { useCallback, useEffect, useState } from 'react';
import SectionHeader from '../../../shared/ui/SectionHeader.jsx';
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Paper,
	Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { toastError } from '../../../utils/errorHandler.js';
import {
	confirmMfaChange,
	getMfaStatus,
	resendMfaChange,
	startMfaChange,
} from '../api/mfaService.js';
import { MFA_CODE_LENGTH } from '../../auth/components/MfaCodeField.jsx';
import useResendCountdown from '../../../components/mfa/useResendCountdown.js';
import { brandButtonSx, outlinedButtonSx } from '../../../shared/ui/buttonSx.js';
import MfaCodeDialog from './profile/MfaCodeDialog.jsx';
import * as tokens from '../../../theme/tokens.js';

const THEME_GREEN = tokens.brand.main;

// The challenge is dead: close the dialog, the user starts over from the card.
const RESTART_CODES = new Set(['error.auth.mfa_challenge_invalid', 'error.auth.mfa_too_many_attempts']);

const primaryButtonSx = brandButtonSx('0.8rem');
const neutralButtonSx = outlinedButtonSx('0.8rem');

const errorMessage = (e, t) => e?.response?.data?.message || t('errors.unexpected', 'Something went wrong. Please try again.');

/**
 * "Two-step verification" card on Account settings › Profile. Turning email MFA on or off both
 * go through a code emailed to the account, so the backend knows the mailbox works before it
 * starts gating sign-in on it, and a hijacked session cannot quietly switch it off.
 */
const MfaCard = () => {
	const { t } = useTranslation();
	const [status, setStatus] = useState(null); // { enabled, email }
	const [loading, setLoading] = useState(true);
	const [starting, setStarting] = useState(false);
	// Open dialog: { action: 'enable' | 'disable', challenge }
	const [pending, setPending] = useState(null);
	const [code, setCode] = useState('');
	const [error, setError] = useState('');
	const [confirming, setConfirming] = useState(false);
	const [resending, setResending] = useState(false);
	const secondsLeft = useResendCountdown(pending?.challenge?.resendAvailableAt);

	const reload = useCallback(async () => {
		setLoading(true);
		try {
			const res = await getMfaStatus();
			setStatus(res.data);
		} catch (e) {
			toastError(e);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { reload(); }, [reload]);

	const closeDialog = () => {
		setPending(null);
		setCode('');
		setError('');
	};

	const start = async (action) => {
		setStarting(true);
		try {
			const res = await startMfaChange(action);
			setCode('');
			setError('');
			setPending({ action, challenge: res.data });
		} catch (e) {
			toast.error(errorMessage(e, t));
			// 409: the state changed elsewhere (another tab); show the real one.
			if (e?.response?.status === 409) reload();
		} finally {
			setStarting(false);
		}
	};

	const confirm = async (value) => {
		if (!pending || confirming) return;
		if (value.length !== MFA_CODE_LENGTH) {
			setError(t('login.mfa.codeRequired', 'Enter the 6-digit code'));
			return;
		}
		setConfirming(true);
		setError('');
		try {
			const res = await confirmMfaChange(pending.action, pending.challenge.challengeId, value);
			setStatus((prev) => ({ ...prev, enabled: res.data.enabled }));
			toast.success(res.data.enabled
				? t('accountSettings.mfa.enabled', 'Two-step verification is on.')
				: t('accountSettings.mfa.disabled', 'Two-step verification is off.'));
			closeDialog();
		} catch (e) {
			if (RESTART_CODES.has(e?.response?.data?.errorCode)) {
				toast.error(errorMessage(e, t));
				closeDialog();
			} else {
				setCode('');
				setError(errorMessage(e, t));
			}
		} finally {
			setConfirming(false);
		}
	};

	const handleCodeChange = (value) => {
		setCode(value);
		if (error) setError('');
		if (value.length === MFA_CODE_LENGTH) confirm(value);
	};

	const resend = async () => {
		setResending(true);
		setError('');
		try {
			const res = await resendMfaChange(pending.challenge.challengeId);
			setPending((prev) => prev && { ...prev, challenge: res.data });
			setCode('');
			toast.success(t('login.mfa.resent', 'A new code is on its way.'));
		} catch (e) {
			if (RESTART_CODES.has(e?.response?.data?.errorCode)) {
				toast.error(errorMessage(e, t));
				closeDialog();
			} else {
				setError(errorMessage(e, t));
			}
		} finally {
			setResending(false);
		}
	};

	const enabled = Boolean(status?.enabled);
	const action = enabled ? 'disable' : 'enable';

	return (
		<Paper elevation={0} sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, p: 2.5 }}>
			<SectionHeader icon={VerifiedUserOutlinedIcon} label={t('accountSettings.mfa.title', 'Two-step verification')} />

			{loading ? (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: tokens.ink.subtle }}>
					<CircularProgress size={14} sx={{ color: THEME_GREEN }} />
					<Typography sx={{ fontSize: '0.8rem' }}>{t('accountSettings.mfa.loading', 'Loading…')}</Typography>
				</Box>
			) : status && (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
					<Box sx={{ flex: 1, minWidth: 220 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
							<Chip
								size="small"
								label={enabled ? t('accountSettings.mfa.on', 'On') : t('accountSettings.mfa.off', 'Off')}
								sx={enabled
									? { backgroundColor: tokens.status.success.tint, color: tokens.status.success.text, fontWeight: 600, fontSize: '0.7rem', height: 22 }
									: { backgroundColor: tokens.surface.muted, color: tokens.ink.soft, fontWeight: 600, fontSize: '0.7rem', height: 22 }}
							/>
						</Box>
						<Typography sx={{ fontSize: '0.8rem', color: tokens.ink.muted }}>
							{t('accountSettings.mfa.description', 'Ask for a code sent to your email each time you sign in, on top of your password.')}
						</Typography>
					</Box>
					<Button
						variant={enabled ? 'outlined' : 'contained'}
						size="small"
						onClick={() => start(action)}
						disabled={starting}
						startIcon={starting ? <CircularProgress size={12} color="inherit" /> : null}
						sx={enabled ? neutralButtonSx : primaryButtonSx}
					>
						{starting
							? t('accountSettings.mfa.sending', 'Sending code…')
							: enabled
								? t('accountSettings.mfa.disable', 'Turn off')
								: t('accountSettings.mfa.enable', 'Turn on')}
					</Button>
				</Box>
			)}

			<MfaCodeDialog
				closeDialog={closeDialog}
				code={code}
				confirming={confirming}
				error={error}
				handleCodeChange={handleCodeChange}
				pending={pending}
				resend={resend}
				resending={resending}
				secondsLeft={secondsLeft}
			/>
		</Paper>
	);
};

export default MfaCard;
