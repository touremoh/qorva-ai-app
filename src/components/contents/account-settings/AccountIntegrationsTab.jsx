import React, { useCallback, useEffect, useState } from 'react';
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	Link,
	MenuItem,
	Paper,
	Switch,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import CableOutlinedIcon from '@mui/icons-material/CableOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { toastError } from '../../../utils/errorHandler.js';
import {
	createAtsConnection,
	deleteAtsConnection,
	getAtsConnections,
	getAtsProviders,
	getAtsSyncRuns,
	registerAtsWebhooks,
	startAtsOauth,
	startAtsSync,
	testAtsConnection,
	updateAtsConnection,
} from '../../../services/atsService.js';

const GREEN = '#629C44';
const BTN_GREEN_SX = {
	backgroundColor: GREEN, borderRadius: 2, textTransform: 'none',
	fontSize: '0.8rem', fontWeight: 600, boxShadow: 'none',
	'&:hover': { backgroundColor: '#4a7a33', boxShadow: 'none' },
};

/**
 * Static provider metadata: display name, the credential fields the connect form asks for,
 * which of them are mandatory, and where the provider documents the setup.
 *
 * `fields` drives the form; `required` is what the Connect button waits for. Greenhouse is
 * the one provider that takes a client id and secret rather than a single key — Harvest v3
 * exchanges them for tokens — and its Greenhouse user id stays optional because it is only
 * needed to attribute score notes written back.
 *
 * `webhookGuide: false` marks a provider whose webhooks cannot be set up from the ATS UI, so
 * the card explains that scheduled syncing is the only option rather than listing steps
 * nobody can follow.
 */
const PROVIDERS = {
	greenhouse: {
		label: 'Greenhouse',
		fields: ['clientId', 'clientSecret', 'onBehalfOfUserId'],
		required: ['clientId', 'clientSecret'],
		docsUrl: 'https://support.greenhouse.io/hc/en-us/articles/5888163769883',
		webhookGuide: true,
	},
	recruitee: {
		label: 'Recruitee',
		fields: ['apiKey', 'companyId'],
		required: ['apiKey', 'companyId'],
		docsUrl: 'https://docs.recruitee.com/reference/getting-started',
		webhookGuide: true,
	},
	workable: {
		label: 'Workable',
		fields: ['apiKey', 'subdomain'],
		required: ['apiKey', 'subdomain'],
		docsUrl: 'https://help.workable.com/hc/en-us/articles/115015785428',
		// No customer-facing webhook screen exists, so there is no manual fallback to offer.
		webhookGuide: false,
	},
	manatal: {
		label: 'Manatal',
		fields: ['apiKey'],
		required: ['apiKey'],
		docsUrl: 'https://support.manatal.com/docs/manatal-api',
		webhookGuide: true,
	},
	bamboohr: {
		label: 'BambooHR',
		fields: ['apiKey', 'subdomain'],
		required: ['apiKey', 'subdomain'],
		docsUrl: 'https://documentation.bamboohr.com/docs/getting-started',
		// BambooHR webhooks watch employee fields, not applicants — no use for recruiting.
		webhookGuide: false,
	},
	zoho_recruit: {
		label: 'Zoho Recruit',
		fields: [],
		required: [],
		docsUrl: 'https://www.zoho.com/recruit/developer-guide/apiv2/',
		webhookGuide: true,
	},
	lever: {
		label: 'Lever',
		// Lever picks the signing key itself. Qorva reads it back from the create call where
		// Lever returns it, and otherwise the tenant pastes the account signing token here —
		// without one, deliveries arrive but cannot be proven authentic.
		fields: ['apiKey', 'webhookSigningSecret'],
		required: ['apiKey'],
		docsUrl: 'https://help.lever.co/hc/en-us/articles/20087297592477',
		webhookGuide: false,
	},
	ashby: {
		label: 'Ashby',
		fields: ['apiKey'],
		required: ['apiKey'],
		docsUrl: 'https://developers.ashbyhq.com/docs/authentication',
		webhookGuide: true,
	},
};

/** Reads an i18n key that holds a list of steps, tolerating a provider that defines none. */
const stepList = (t, key) => {
	const value = t(key, { returnObjects: true, defaultValue: [] });
	return Array.isArray(value) ? value : [];
};

/** Credential fields that must never be shown in the clear while being typed. */
const SECRET_FIELDS = new Set(['apiKey', 'clientSecret', 'webhookSigningSecret']);

/** Zoho's sign-in domain for a datacenter key — Canada is the one that breaks the pattern. */
const zohoDomain = (key) => (key === 'ca' ? 'zohocloud.ca' : `zoho.${key}`);

/**
 * "Europe — zoho.eu": the region name for recognition, the domain because that is what the
 * recruiter actually sees in their address bar. Keys like "com.au" are flattened for the
 * lookup since i18next reads a dot as a nesting separator.
 */
const regionLabel = (key, t) => {
	const domain = zohoDomain(key);
	const name = t(`atsIntegrations.regions.${key.replace(/\./g, '_')}`, '');
	return name ? `${name} — ${domain}` : domain;
};

/**
 * Numbered setup steps for one provider, optionally preceded by an intro line and followed
 * by a caution. Steps are plain strings in the locale files so translators can reword a
 * whole procedure without touching this component.
 */
const GuideSteps = ({ title, intro, steps, note, docsUrl, docsLabel }) => {
	if (!steps.length && !note) return null;
	return (
		<Box sx={{ borderRadius: 2, backgroundColor: '#f8fafc', border: '1px solid #eef2f7', p: 1.5 }}>
			<Typography sx={{
				fontSize: '0.7rem', color: '#64748b', fontWeight: 700,
				textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.75,
			}}>
				{title}
			</Typography>
			{intro && (
				<Typography sx={{ fontSize: '0.76rem', color: '#475569', mb: 1 }}>{intro}</Typography>
			)}
			{steps.length > 0 && (
				<Box component="ol" sx={{ m: 0, pl: 2.25, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
					{steps.map((step, index) => (
						<Typography key={index} component="li" sx={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.5 }}>
							{step}
						</Typography>
					))}
				</Box>
			)}
			{note && (
				<Typography sx={{ fontSize: '0.74rem', color: '#92400e', mt: 1 }}>{note}</Typography>
			)}
			{docsUrl && (
				<Link href={docsUrl} target="_blank" rel="noopener noreferrer"
					sx={{ fontSize: '0.74rem', color: GREEN, display: 'inline-flex', alignItems: 'center', gap: 0.4, mt: 1 }}>
					{docsLabel}
					<OpenInNewOutlinedIcon sx={{ fontSize: 12 }} />
				</Link>
			)}
		</Box>
	);
};

/** One copyable value (webhook URL or secret) with its label. */
const CopyRow = ({ label, value, onCopy, mask }) => (
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
		<Typography sx={{
			fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700,
			textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
		}}>
			{label}
		</Typography>
		<Typography sx={{ fontSize: '0.72rem', color: '#475569', flex: 1, minWidth: 0 }} noWrap>
			{mask ? '•'.repeat(24) : value}
		</Typography>
		<IconButton size="small" onClick={onCopy}>
			<ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />
		</IconButton>
	</Box>
);

/**
 * Status of webhooks Qorva registered itself. Success is one quiet line — there is nothing
 * for the tenant to do. Failure shows the provider's reason and a retry, because the usual
 * cause is fixable at their end (an API key created without the webhook permission).
 */
const ManagedWebhooks = ({ registered, error, busy, onRetry }) => {
	const { t } = useTranslation();
	if (registered) {
		return (
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
				<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 15, color: GREEN }} />
				<Typography sx={{ fontSize: '0.76rem', color: '#475569' }}>
					{t('atsIntegrations.guides.webhookManagedOk')}
				</Typography>
			</Box>
		);
	}
	return (
		<Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.25)' }}>
			<Typography sx={{ fontSize: '0.78rem', color: '#92400e' }}>
				{t('atsIntegrations.guides.webhookManagedFailed')}
			</Typography>
			{error && (
				<Typography sx={{ fontSize: '0.72rem', color: '#b45309', mt: 0.5, wordBreak: 'break-word' }}>
					{error}
				</Typography>
			)}
			<Button size="small" variant="contained" disabled={busy} onClick={onRetry} sx={{ ...BTN_GREEN_SX, mt: 1 }}>
				{t('atsIntegrations.guides.webhookRetry')}
			</Button>
		</Box>
	);
};

const StatusChip = ({ status }) => {
	const { t } = useTranslation();
	const byStatus = {
		CONNECTED: { color: GREEN, bg: 'rgba(98,156,68,0.1)', label: t('atsIntegrations.status.connected') },
		AUTH_ERROR: { color: '#dc2626', bg: 'rgba(220,38,38,0.08)', label: t('atsIntegrations.status.authError') },
		DISABLED: { color: '#64748b', bg: '#f1f5f9', label: t('atsIntegrations.status.disabled') },
	};
	const s = byStatus[status];
	if (!s) return null;
	return (
		<Chip size="small" label={s.label} sx={{
			height: 20, fontSize: '0.65rem', fontWeight: 700, color: s.color, backgroundColor: s.bg,
		}} />
	);
};

const SettingRow = ({ label, hint, checked, onChange, disabled }) => (
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
		<Box sx={{ flex: 1, minWidth: 0 }}>
			<Typography sx={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 500 }}>{label}</Typography>
			<Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>{hint}</Typography>
		</Box>
		<Switch size="small" checked={!!checked} onChange={onChange} disabled={disabled}
			sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: GREEN }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: GREEN } }} />
	</Box>
);

const RunLine = ({ run }) => {
	const { t } = useTranslation();
	const when = run.createdAt ? new Date(run.createdAt).toLocaleString() : '—';
	const failureLabel = run.failureReason === 'initial_sync_guard'
		? t('atsIntegrations.runs.initialSyncGuard')
		: run.failureReason === 'quota_exceeded'
			? t('atsIntegrations.runs.quotaExceeded')
			: run.failureReason;
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, borderBottom: '1px solid #f8fafc' }}>
			{['COMPLETED'].includes(run.status)
				? <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 14, color: GREEN }} />
				: ['PENDING', 'RUNNING'].includes(run.status)
					? <CircularProgress size={12} sx={{ color: GREEN }} />
					: <ErrorOutlineOutlinedIcon sx={{ fontSize: 14, color: run.status === 'FAILED' ? '#dc2626' : '#d97706' }} />}
			<Typography sx={{ fontSize: '0.72rem', color: '#475569', flex: 1, minWidth: 0 }} noWrap>
				{when} · {t('atsIntegrations.runs.summary', { imported: run.succeeded, skipped: run.skipped, failed: run.failed })}
				{failureLabel ? ` · ${failureLabel}` : ''}
			</Typography>
		</Box>
	);
};

const AccountIntegrationsTab = () => {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(true);
	const [catalog, setCatalog] = useState({ providers: [], maxConnections: 0, usedConnections: 0 });
	const [catalogFailed, setCatalogFailed] = useState(false);
	const [connections, setConnections] = useState([]);
	const [runsByConnection, setRunsByConnection] = useState({});
	const [busyId, setBusyId] = useState(null);

	// Connect dialog
	const [connectProvider, setConnectProvider] = useState(null);
	// Datacenter picker, shown before the Zoho consent redirect
	const [regionProvider, setRegionProvider] = useState(null);
	const [region, setRegion] = useState('com');
	const [form, setForm] = useState({});
	const [connecting, setConnecting] = useState(false);

	const reload = useCallback(async () => {
		try {
			const [catalogRes, connectionsRes] = await Promise.all([getAtsProviders(), getAtsConnections()]);
			setCatalogFailed(false);
			setCatalog(catalogRes.data);
			const list = connectionsRes.data?.connections || [];
			setConnections(list);
			const runsEntries = await Promise.all(list.map(async (c) => {
				try {
					const res = await getAtsSyncRuns(c.id);
					return [c.id, res.data?.jobs || []];
				} catch {
					return [c.id, []];
				}
			}));
			setRunsByConnection(Object.fromEntries(runsEntries));
		} catch (e) {
			// The catalog never loaded, so maxConnections stays 0 — which must not be read
			// as "this plan has no ATS connections". The error itself is already toasted.
			setCatalogFailed(true);
			toastError(e);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { reload(); }, [reload]);

	// Surface the OAuth round-trip result once, then clean the URL.
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const result = params.get('atsOauth');
		if (!result) return;
		if (result === 'connected') toast.success(t('atsIntegrations.oauthConnected'));
		else toast.error(t('atsIntegrations.oauthFailed'));
		params.delete('atsOauth');
		const next = params.toString();
		window.history.replaceState({}, '', window.location.pathname + (next ? `?${next}` : ''));
	}, [t]);

	const connectionByProvider = Object.fromEntries(connections.map((c) => [c.provider, c]));

	// The backend decides which providers sign their webhooks; the UI must not keep its own
	// copy of that list, or the secret shown here would drift from the check on delivery.
	const providerSignsWebhooks = (provider) =>
		!!catalog.providers.find((p) => p.provider === provider)?.webhooksSigned;

	const beginOauth = async (provider, region) => {
		try {
			setBusyId(provider);
			const res = await startAtsOauth(provider, region);
			if (res.data?.consentUrl) window.location.href = res.data.consentUrl;
		} catch (e) {
			toastError(e);
		} finally {
			setBusyId(null);
		}
	};

	const handleConnectClick = async (provider) => {
		const meta = PROVIDERS[provider];
		const catalogEntry = catalog.providers.find((p) => p.provider === provider);
		// Prefer OAuth wherever a client is registered for this environment; providers that
		// also accept a customer-generated key fall back to the credentials form.
		const useOauth = catalogEntry ? catalogEntry.oauthAvailable : meta.fields.length === 0;
		if (useOauth || meta.fields.length === 0) {
			// A Zoho account lives in one datacenter and only that one can authenticate it,
			// so ask before redirecting instead of guessing the US host.
			if (provider === 'zoho_recruit') {
				setRegionProvider(provider);
				return;
			}
			await beginOauth(provider);
			return;
		}
		setForm({});
		setConnectProvider(provider);
	};

	const handleCreate = async () => {
		try {
			setConnecting(true);
			await createAtsConnection({ provider: connectProvider, ...form });
			toast.success(t('atsIntegrations.connected', { provider: PROVIDERS[connectProvider].label }));
			setConnectProvider(null);
			await reload();
		} catch (e) {
			toastError(e);
		} finally {
			setConnecting(false);
		}
	};

	const withBusy = (id, action) => async () => {
		try {
			setBusyId(id);
			await action();
			await reload();
		} catch (e) {
			toastError(e);
		} finally {
			setBusyId(null);
		}
	};

	const handleToggle = (connection, key) => async (event) => {
		const value = event.target.checked;
		try {
			await updateAtsConnection(connection.id, { [key]: value });
			setConnections((prev) => prev.map((c) => (c.id === connection.id ? { ...c, [key]: value } : c)));
		} catch (e) {
			toastError(e);
		}
	};

	const handleDelete = (connection) => withBusy(connection.id, async () => {
		if (!window.confirm(t('atsIntegrations.deleteConfirm', { provider: PROVIDERS[connection.provider].label }))) return;
		await deleteAtsConnection(connection.id);
		toast.success(t('atsIntegrations.deleted'));
	})();

	const copyValue = (value, message) => {
		navigator.clipboard?.writeText(value)
			.then(() => toast.success(message))
			.catch(() => {});
	};

	const lastRunNeedsConfirmation = (connection) => {
		const runs = runsByConnection[connection.id] || [];
		return !connection.initialSyncConfirmed && runs.some((r) => r.failureReason === 'initial_sync_guard');
	};

	const confirmInitialSync = (connection) => withBusy(connection.id, async () => {
		await updateAtsConnection(connection.id, { initialSyncConfirmed: true });
		await startAtsSync(connection.id);
		toast.success(t('atsIntegrations.syncStarted'));
	})();

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
				<CircularProgress size={26} sx={{ color: GREEN }} />
			</Box>
		);
	}

	const planFull = catalog.usedConnections >= catalog.maxConnections;

	// Greenhouse needs a client id and secret, others a key plus their path segment, so the
	// button waits on whatever this provider actually declared rather than on apiKey alone.
	const connectFormComplete = connectProvider
		? PROVIDERS[connectProvider].required.every((field) => form[field]?.trim())
		: false;

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 860 }}>
			<Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<CableOutlinedIcon sx={{ fontSize: 16, color: GREEN }} />
					<Typography sx={{ fontSize: '0.82rem', color: '#475569', flex: 1 }}>
						{t('atsIntegrations.intro')}
					</Typography>
					<Chip size="small" label={`${catalog.usedConnections}/${catalog.maxConnections}`} sx={{ fontWeight: 700 }} />
				</Box>
				{!catalogFailed && catalog.maxConnections === 0 && (
					<Typography sx={{ fontSize: '0.78rem', color: '#d97706', mt: 1 }}>
						{t('atsIntegrations.planUpsell')}
					</Typography>
				)}
			</Paper>

			{Object.entries(PROVIDERS).map(([provider, meta]) => {
				const connection = connectionByProvider[provider];
				const busy = busyId === (connection?.id || provider);
				const runs = connection ? (runsByConnection[connection.id] || []) : [];
				return (
					<Paper key={provider} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, p: 2 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
							<Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a', flex: 1 }}>
								{meta.label}
							</Typography>
							{connection && <StatusChip status={connection.status} />}
							{connection ? (
								<>
									<Tooltip title={t('atsIntegrations.syncNow')}>
										<span>
											<IconButton size="small" disabled={busy || connection.status !== 'CONNECTED'}
												onClick={withBusy(connection.id, async () => {
													await startAtsSync(connection.id);
													toast.success(t('atsIntegrations.syncStarted'));
												})}
												sx={{ color: GREEN }}>
												<SyncOutlinedIcon sx={{ fontSize: 17 }} />
											</IconButton>
										</span>
									</Tooltip>
									<Button size="small" disabled={busy}
										onClick={withBusy(connection.id, async () => {
											await testAtsConnection(connection.id);
											toast.success(t('atsIntegrations.testOk'));
										})}
										sx={{ textTransform: 'none', fontSize: '0.72rem', color: '#64748b' }}>
										{t('atsIntegrations.testConnection')}
									</Button>
									<Tooltip title={t('atsIntegrations.disconnect')}>
										<span>
											<IconButton size="small" disabled={busy} onClick={() => handleDelete(connection)}
												sx={{ color: '#dc2626' }}>
												<DeleteOutlineOutlinedIcon sx={{ fontSize: 17 }} />
											</IconButton>
										</span>
									</Tooltip>
								</>
							) : (
								<Button size="small" variant="contained" disabled={busy || planFull}
									startIcon={busy ? <CircularProgress size={12} color="inherit" /> : null}
									onClick={() => handleConnectClick(provider)} sx={BTN_GREEN_SX}>
									{t('atsIntegrations.connect')}
								</Button>
							)}
						</Box>

						{connection && (
							<Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
								<Divider sx={{ borderColor: '#f1f5f9' }} />
								<SettingRow
									label={t('atsIntegrations.settings.autoImport')}
									hint={t('atsIntegrations.settings.autoImportHint')}
									checked={connection.autoImport}
									onChange={handleToggle(connection, 'autoImport')} />
								<SettingRow
									label={t('atsIntegrations.settings.importJobs')}
									hint={t('atsIntegrations.settings.importJobsHint')}
									checked={connection.importJobs}
									onChange={handleToggle(connection, 'importJobs')} />
								<SettingRow
									label={t('atsIntegrations.settings.writeBackScores')}
									hint={t('atsIntegrations.settings.writeBackScoresHint')}
									checked={connection.writeBackScores}
									onChange={handleToggle(connection, 'writeBackScores')} />

								{lastRunNeedsConfirmation(connection) && (
									<Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.25)' }}>
										<Typography sx={{ fontSize: '0.78rem', color: '#92400e', mb: 1 }}>
											{t('atsIntegrations.initialSyncGuardHint')}
										</Typography>
										<Button size="small" variant="contained" disabled={busy}
											onClick={() => confirmInitialSync(connection)} sx={BTN_GREEN_SX}>
											{t('atsIntegrations.confirmFullImport')}
										</Button>
									</Box>
								)}

								{/*
								  * Real-time updates. Providers that sign their payloads need Qorva's
								  * secret pasted into the ATS; the rest authenticate with the token
								  * already inside the URL, so showing them a secret would only confuse.
								  * Where the ATS offers no webhook screen at all, say so plainly instead
								  * of listing steps that lead nowhere.
								  */}
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
									{/* Only worth showing when someone has to paste them somewhere. */}
									{!connection.webhooksManaged && (
										<CopyRow
											label={t('atsIntegrations.webhookUrl')}
											value={connection.webhookUrl}
											onCopy={() => copyValue(connection.webhookUrl, t('atsIntegrations.webhookCopied'))} />
									)}
									{!connection.webhooksManaged && providerSignsWebhooks(provider) && connection.webhookSecret && (
										<CopyRow
											mask
											label={t('atsIntegrations.guides.webhookSecret')}
											value={connection.webhookSecret}
											onCopy={() => copyValue(connection.webhookSecret, t('atsIntegrations.guides.webhookSecretCopied'))} />
									)}
									{connection.webhooksManaged ? (
										<>
											<ManagedWebhooks
												registered={connection.webhooksRegistered}
												error={connection.webhookError}
												busy={busy}
												onRetry={withBusy(connection.id, async () => {
													await registerAtsWebhooks(connection.id);
													toast.success(t('atsIntegrations.guides.webhookRetried'));
												})} />
											{/* A provider with its own webhook screen keeps the manual route as a
											  * fallback, but only once the automatic attempt has actually failed. */}
											{!connection.webhooksRegistered && meta.webhookGuide && (
												<GuideSteps
													title={t('atsIntegrations.guides.webhookManualFallback')}
													steps={stepList(t, `atsIntegrations.guides.${provider}.webhookSteps`)}
													note={t('atsIntegrations.guides.urlCarriesToken')} />
											)}
										</>
									) : meta.webhookGuide ? (
										<GuideSteps
											title={t('atsIntegrations.guides.webhookTitle')}
											intro={t('atsIntegrations.guides.webhookIntro', { provider: meta.label })}
											steps={stepList(t, `atsIntegrations.guides.${provider}.webhookSteps`)}
											note={providerSignsWebhooks(provider)
												? t('atsIntegrations.guides.pasteSecret')
												: t('atsIntegrations.guides.urlCarriesToken')} />
									) : (
										<GuideSteps
											title={t('atsIntegrations.guides.webhookTitle')}
											steps={[]}
											note={t(`atsIntegrations.guides.${provider}.webhookUnavailable`, '')} />
									)}
								</Box>

								{runs.length > 0 && (
									<Box>
										<Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
											{t('atsIntegrations.runs.title')}
										</Typography>
										{runs.slice(0, 5).map((run) => <RunLine key={run.id} run={run} />)}
									</Box>
								)}
							</Box>
						)}
					</Paper>
				);
			})}

			{/* Datacenter picker (Zoho): the account is only reachable on its own region's host */}
			<Dialog open={!!regionProvider} onClose={() => setRegionProvider(null)} maxWidth="xs" fullWidth>
				<DialogTitle sx={{ fontSize: '1rem', fontWeight: 700 }}>
					{t('atsIntegrations.regionTitle')}
				</DialogTitle>
				<DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: '8px !important' }}>
					<Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
						{t('atsIntegrations.regionHint')}
					</Typography>
					{regionProvider && (
						<GuideSteps
							title={t('atsIntegrations.guides.credentialsTitle')}
							intro={t(`atsIntegrations.guides.${regionProvider}.intro`, '')}
							steps={stepList(t, `atsIntegrations.guides.${regionProvider}.steps`)}
							note={t(`atsIntegrations.guides.${regionProvider}.note`, '')}
							docsUrl={PROVIDERS[regionProvider].docsUrl}
							docsLabel={t('atsIntegrations.guides.docs', { provider: PROVIDERS[regionProvider].label })}
						/>
					)}
					<TextField
						select size="small" fullWidth value={region}
						onChange={(e) => setRegion(e.target.value)}
						slotProps={{ inputLabel: { shrink: true } }}
					>
						{(catalog.zohoRegions || ['com']).map((key) => (
							<MenuItem key={key} value={key} sx={{ fontSize: '0.85rem' }}>
								{regionLabel(key, t)}
							</MenuItem>
						))}
					</TextField>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={() => setRegionProvider(null)}
						sx={{ textTransform: 'none', fontSize: '0.82rem', color: '#64748b' }}>
						{t('accountSettings.cancel')}
					</Button>
					<Button variant="contained" sx={BTN_GREEN_SX}
						disabled={busyId === regionProvider}
						onClick={async () => {
							const provider = regionProvider;
							setRegionProvider(null);
							await beginOauth(provider, region);
						}}>
						{t('atsIntegrations.connect')}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Connect dialog (credential-form providers) */}
			<Dialog open={!!connectProvider} onClose={() => !connecting && setConnectProvider(null)} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ fontSize: '1rem', fontWeight: 700 }}>
					{connectProvider ? t('atsIntegrations.connectTitle', { provider: PROVIDERS[connectProvider].label }) : ''}
				</DialogTitle>
				<DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: '8px !important' }}>
					{connectProvider && (
						<GuideSteps
							title={t('atsIntegrations.guides.credentialsTitle')}
							intro={t(`atsIntegrations.guides.${connectProvider}.intro`, '')}
							steps={stepList(t, `atsIntegrations.guides.${connectProvider}.steps`)}
							note={t(`atsIntegrations.guides.${connectProvider}.note`, '')}
							docsUrl={PROVIDERS[connectProvider].docsUrl}
							docsLabel={t('atsIntegrations.guides.docs', { provider: PROVIDERS[connectProvider].label })}
						/>
					)}
					{(connectProvider ? PROVIDERS[connectProvider].fields : []).map((field) => (
						<TextField
							key={field} size="small" fullWidth
							type={SECRET_FIELDS.has(field) ? 'password' : 'text'}
							label={t(`atsIntegrations.fields.${field}`)}
							helperText={t(`atsIntegrations.fields.${field}Hint`, '')}
							value={form[field] || ''}
							onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
							sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem' } }}
						/>
					))}
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button size="small" disabled={connecting} onClick={() => setConnectProvider(null)}
						sx={{ textTransform: 'none', color: '#64748b' }}>
						{t('accountSettings.cancel')}
					</Button>
					<Button size="small" variant="contained" onClick={handleCreate}
						disabled={connecting || !connectFormComplete}
						startIcon={connecting ? <CircularProgress size={12} color="inherit" /> : null}
						sx={BTN_GREEN_SX}>
						{t('atsIntegrations.connect')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default AccountIntegrationsTab;
