// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useState } from 'react';
import dayjs from '../../../shared/lib/dayjs.js';
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Collapse,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Link,
	Paper,
	Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
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
} from '../../../services/mailboxService.js';

const THEME_GREEN = '#629C44';

const SectionHeader = ({ label }) => (
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1, borderBottom: `2px solid ${THEME_GREEN}` }}>
		<ForwardToInboxOutlinedIcon sx={{ fontSize: 15, color: THEME_GREEN }} />
		<Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: THEME_GREEN, textTransform: 'uppercase', letterSpacing: '0.07em', flex: 1 }}>
			{label}
		</Typography>
	</Box>
);

SectionHeader.propTypes = { label: PropTypes.string.isRequired };

const primaryButtonSx = {
	textTransform: 'none', fontSize: '0.8rem', fontWeight: 600, borderRadius: 1.5, boxShadow: 'none',
	backgroundColor: THEME_GREEN, '&:hover': { backgroundColor: '#528035' },
};
const outlinedButtonSx = {
	textTransform: 'none', fontSize: '0.8rem', fontWeight: 600, borderRadius: 1.5,
	color: '#334155', borderColor: '#e2e8f0', '&:hover': { borderColor: '#cbd5e1', backgroundColor: '#f8fafc' },
};

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
		<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2.5 }}>
			<SectionHeader label={t('mailbox.title')} />

			{loading ? (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#94a3b8' }}>
					<CircularProgress size={14} sx={{ color: THEME_GREEN }} />
					<Typography sx={{ fontSize: '0.8rem' }}>{t('mailbox.loading')}</Typography>
				</Box>
			) : connection ? (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
						<Box sx={{ flex: 1, minWidth: 200 }}>
							<Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
								{t(`mailbox.provider.${connection.provider}`)} · {connection.emailAddress}
							</Typography>
							<Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
								{t('mailbox.connectedSince', { when: dayjs(connection.connectedAt).locale(locale).format('LL') })}
								{connection.lastUsedAt && ` · ${t('mailbox.lastUsed', { when: dayjs(connection.lastUsedAt).locale(locale).fromNow() })}`}
							</Typography>
						</Box>
						<Chip
							size="small"
							label={reauth ? t('mailbox.status.REAUTH_REQUIRED') : t('mailbox.status.ACTIVE')}
							sx={{
								height: 22, fontSize: '0.7rem', fontWeight: 600, borderRadius: 1,
								backgroundColor: reauth ? '#fffbeb' : '#ecfdf3', color: reauth ? '#b45309' : '#15803d',
							}}
						/>
					</Box>
					{reauth && (
						<Alert severity="warning" sx={{ fontSize: '0.8rem', borderRadius: 1.5 }}>{t('mailbox.reauthHint')}</Alert>
					)}
					<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
						{reauth && (
							<Button variant="contained" onClick={connect} disabled={busy} sx={primaryButtonSx}>
								{t('mailbox.reconnect')}
							</Button>
						)}
						<Button variant="outlined" onClick={() => setConfirmOpen(true)} disabled={busy}
							startIcon={<LinkOffOutlinedIcon sx={{ fontSize: 15 }} />} sx={outlinedButtonSx}>
							{t('mailbox.disconnect')}
						</Button>
					</Box>
					<Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t('mailbox.scopeNote')}</Typography>
				</Box>
			) : (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					<Typography sx={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
						{t('mailbox.intro')}
					</Typography>
					{availability?.microsoft ? (
						<Box>
							<Button variant="contained" onClick={connect} disabled={busy}
								startIcon={busy ? <CircularProgress size={12} sx={{ color: '#fff' }} /> : <ForwardToInboxOutlinedIcon sx={{ fontSize: 15 }} />}
								sx={primaryButtonSx}>
								{t('mailbox.connectMicrosoft')}
							</Button>
						</Box>
					) : (
						<Alert severity="info" sx={{ fontSize: '0.8rem', borderRadius: 1.5 }}>{t('mailbox.notAvailable')}</Alert>
					)}
					<Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>{t('mailbox.otherClients')}</Typography>
					<Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t('mailbox.scopeNote')}</Typography>
					{availability?.microsoft && (
						<Box>
							<Link component="button" type="button" onClick={() => setAdminHelpOpen(o => !o)}
								sx={{ fontSize: '0.75rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
								{t('mailbox.adminHelp.toggle')}
								{adminHelpOpen ? <ExpandLessIcon sx={{ fontSize: 14 }} /> : <ExpandMoreIcon sx={{ fontSize: 14 }} />}
							</Link>
							<Collapse in={adminHelpOpen}>
								<Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.75, lineHeight: 1.6 }}>
									{t('mailbox.adminHelp.body')}
								</Typography>
							</Collapse>
						</Box>
					)}
				</Box>
			)}

			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 2, minWidth: 360 } }}>
				<DialogTitle sx={{ fontSize: '1rem', fontWeight: 700 }}>{t('mailbox.disconnectTitle')}</DialogTitle>
				<DialogContent>
					<Typography sx={{ fontSize: '0.85rem', color: '#475569' }}>{t('mailbox.disconnectBody')}</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={() => setConfirmOpen(false)} sx={{ textTransform: 'none', fontSize: '0.8rem', color: '#64748b' }}>
						{t('mailbox.cancel')}
					</Button>
					<Button variant="contained" onClick={disconnect}
						sx={{ ...primaryButtonSx, backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' } }}>
						{t('mailbox.disconnect')}
					</Button>
				</DialogActions>
			</Dialog>
		</Paper>
	);
};

export default ConnectedMailboxCard;
