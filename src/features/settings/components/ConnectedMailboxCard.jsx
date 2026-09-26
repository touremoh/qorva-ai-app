// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useState } from 'react';
import ConfirmDialog from '../../../shared/ui/ConfirmDialog.jsx';
import SectionHeader from '../../../shared/ui/SectionHeader.jsx';
import dayjs from '../../../shared/lib/dayjs.js';
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Collapse,
	Link,
	Paper,
	Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import ForwardToInboxOutlinedIcon from '@mui/icons-material/ForwardToInboxOutlined';
import LinkOffOutlinedIcon from '@mui/icons-material/LinkOffOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { toastError } from '../../../utils/errorHandler.js';
import {
	disconnectMailbox,
	getMailboxAvailability,
	getMyMailbox,
	startMailboxOauth,
} from '../api/mailboxService.js';
import { brandButtonSx, outlinedButtonSx } from '../../../shared/ui/buttonSx.js';
import * as tokens from '../../../theme/tokens.js';

const THEME_GREEN = tokens.brand.main;

const primaryButtonSx = brandButtonSx('0.8rem');
const neutralButtonSx = outlinedButtonSx('0.8rem');

/**
 * "Connected mailbox" card on Account settings › Profile. Personal to the signed-in user: a
 * connected Microsoft 365 mailbox lets the candidate composer send as them (into their own Sent
 * folder). Gmail and other clients need nothing here — the composer hands the message to them.
 */
const ConnectedMailboxCard = () => {
	const { t, i18n } = useTranslation();
	const [availability, setAvailability] = useState(null);
	const [connection, setConnection] = useState(null);
	const [loading, setLoading] = useState(true);
	const [busy, setBusy] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [adminHelpOpen, setAdminHelpOpen] = useState(false);

	const reload = useCallback(async () => {
		setLoading(true);
		try {
			const [avail, mine] = await Promise.all([getMailboxAvailability(), getMyMailbox()]);
			setAvailability(avail.data ?? { microsoft: false });
			setConnection(mine.status === 204 ? null : (mine.data ?? null));
		} catch (e) {
			toastError(e);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { reload(); }, [reload]);

	// Surface the OAuth round-trip result once, then clean the URL (same idiom as the ATS tab).
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const result = params.get('mailboxOauth');
		if (!result) return;
		if (result === 'connected') toast.success(t('mailbox.oauthConnected'));
		else if (result === 'denied') toast.error(t('mailbox.oauthDenied'));
		else toast.error(t('mailbox.oauthFailed'));
		params.delete('mailboxOauth');
		const next = params.toString();
		window.history.replaceState({}, '', window.location.pathname + (next ? `?${next}` : ''));
	}, [t]);

	const connect = async () => {
		try {
			setBusy(true);
			const res = await startMailboxOauth('MICROSOFT');
			if (res.data?.consentUrl) window.location.href = res.data.consentUrl;
		} catch (e) {
			toastError(e);
			setBusy(false);
		}
	};

	const disconnect = async () => {
		setConfirmOpen(false);
		try {
			setBusy(true);
			await disconnectMailbox();
			setConnection(null);
			toast.success(t('mailbox.disconnected'));
		} catch (e) {
			toastError(e);
		} finally {
			setBusy(false);
		}
	};

	const locale = (i18n.language || 'en').slice(0, 2);
	const reauth = connection?.status === 'REAUTH_REQUIRED';

	return (
		<Paper elevation={0} sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, p: 2.5 }}>
			<SectionHeader icon={ForwardToInboxOutlinedIcon} label={t('mailbox.title')} />

			{loading ? (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: tokens.ink.subtle }}>
					<CircularProgress size={14} sx={{ color: THEME_GREEN }} />
					<Typography sx={{ fontSize: tokens.fontSize.body2 }}>{t('mailbox.loading')}</Typography>
				</Box>
			) : connection ? (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
						<Box sx={{ flex: 1, minWidth: 200 }}>
							<Typography sx={{ fontSize: tokens.fontSize.body, fontWeight: 600, color: tokens.ink.strong }}>
								{t(`mailbox.provider.${connection.provider}`)} · {connection.emailAddress}
							</Typography>
							<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.muted, mt: 0.25 }}>
								{t('mailbox.connectedSince', { when: dayjs(connection.connectedAt).locale(locale).format('LL') })}
								{connection.lastUsedAt && ` · ${t('mailbox.lastUsed', { when: dayjs(connection.lastUsedAt).locale(locale).fromNow() })}`}
							</Typography>
						</Box>
						<Chip
							size="small"
							label={reauth ? t('mailbox.status.REAUTH_REQUIRED') : t('mailbox.status.ACTIVE')}
							sx={{
								height: 22, fontSize: tokens.fontSize.caption, fontWeight: 600, borderRadius: 1,
								backgroundColor: reauth ? `${tokens.status.warning.pale}` : `${tokens.status.success.paleAlt}`, color: reauth ? `${tokens.status.warning.strong}` : `${tokens.status.success.strong}`,
							}}
						/>
					</Box>
					{reauth && (
						<Alert severity="warning" sx={{ fontSize: tokens.fontSize.body2, borderRadius: 1.5 }}>{t('mailbox.reauthHint')}</Alert>
					)}
					<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
						{reauth && (
							<Button variant="contained" onClick={connect} disabled={busy} sx={primaryButtonSx}>
								{t('mailbox.reconnect')}
							</Button>
						)}
						<Button variant="outlined" onClick={() => setConfirmOpen(true)} disabled={busy}
							startIcon={<LinkOffOutlinedIcon sx={{ fontSize: tokens.iconSize.sm }} />} sx={neutralButtonSx}>
							{t('mailbox.disconnect')}
						</Button>
					</Box>
					<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.subtle }}>{t('mailbox.scopeNote')}</Typography>
				</Box>
			) : (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.soft, lineHeight: 1.6 }}>
						{t('mailbox.intro')}
					</Typography>
					{availability?.microsoft ? (
						<Box>
							<Button variant="contained" onClick={connect} disabled={busy}
								startIcon={busy ? <CircularProgress size={12} sx={{ color: tokens.ink.inverse }} /> : <ForwardToInboxOutlinedIcon sx={{ fontSize: tokens.iconSize.sm }} />}
								sx={primaryButtonSx}>
								{t('mailbox.connectMicrosoft')}
							</Button>
						</Box>
					) : (
						<Alert severity="info" sx={{ fontSize: tokens.fontSize.body2, borderRadius: 1.5 }}>{t('mailbox.notAvailable')}</Alert>
					)}
					<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.muted }}>{t('mailbox.otherClients')}</Typography>
					<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.subtle }}>{t('mailbox.scopeNote')}</Typography>
					{availability?.microsoft && (
						<Box>
							<Link component="button" type="button" onClick={() => setAdminHelpOpen(o => !o)}
								sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.muted, display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
								{t('mailbox.adminHelp.toggle')}
								{adminHelpOpen ? <ExpandLessIcon sx={{ fontSize: tokens.iconSize.sm }} /> : <ExpandMoreIcon sx={{ fontSize: tokens.iconSize.sm }} />}
							</Link>
							<Collapse in={adminHelpOpen}>
								<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.muted, mt: 0.75, lineHeight: 1.6 }}>
									{t('mailbox.adminHelp.body')}
								</Typography>
							</Collapse>
						</Box>
					)}
				</Box>
			)}

			<ConfirmDialog
				open={confirmOpen}
				title={t('mailbox.disconnectTitle')}
				cancelLabel={t('mailbox.cancel')}
				confirmLabel={t('mailbox.disconnect')}
				onCancel={() => setConfirmOpen(false)}
				onConfirm={disconnect}
				tone="danger"
			>
				{t('mailbox.disconnectBody')}
			</ConfirmDialog>
		</Paper>
	);
};

export default ConnectedMailboxCard;
