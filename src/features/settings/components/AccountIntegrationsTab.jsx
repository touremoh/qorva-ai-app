import { useState } from 'react';
import {
	Box,
	CircularProgress,
} from '@mui/material';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { toastError } from '../../../utils/errorHandler.js';
import {
	createAtsConnection,
	deleteAtsConnection,
	registerAtsWebhooks,
	startAtsOauth,
	startAtsSync,
	testAtsConnection,
	updateAtsConnection,
} from '../api/atsService.js';
import ProviderCard from './integrations/ProviderCard.jsx';
import RegionDialog from './integrations/RegionDialog.jsx';
import ConnectDialog from './integrations/ConnectDialog.jsx';
import ConfirmDialog from '../../../shared/ui/ConfirmDialog.jsx';
import useAtsIntegrations from '../hooks/useAtsIntegrations.js';
import { GREEN, PROVIDERS } from '../model/integrations.js';
import IntegrationsIntro from './integrations/IntegrationsIntro.jsx';

const AccountIntegrationsTab = () => {
	const { t } = useTranslation();
	const { loading, catalog, catalogFailed, connections, setConnections, runsByConnection, reload } = useAtsIntegrations();
	const [busyId, setBusyId] = useState(null);

	// Connect dialog
	const [connectProvider, setConnectProvider] = useState(null);
	// Datacenter picker, shown before the Zoho consent redirect
	const [regionProvider, setRegionProvider] = useState(null);
	const [region, setRegion] = useState('com');
	const [form, setForm] = useState({});
	const [connecting, setConnecting] = useState(false);
	const [connectionToDelete, setConnectionToDelete] = useState(null);

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

	const handleDelete = () => {
		const connection = connectionToDelete;
		setConnectionToDelete(null);
		withBusy(connection.id, async () => {
			await deleteAtsConnection(connection.id);
			toast.success(t('atsIntegrations.deleted'));
		})();
	};

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


	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 860 }}>
			<IntegrationsIntro catalog={catalog} catalogFailed={catalogFailed} />

			{Object.entries(PROVIDERS).map(([provider, meta]) => {
				const connection = connectionByProvider[provider];
				return (
					<ProviderCard
						key={provider}
						provider={provider}
						meta={meta}
						connection={connection}
						runs={connection ? (runsByConnection[connection.id] || []) : []}
						busy={busyId === (connection?.id || provider)}
						planFull={planFull}
						signsWebhooks={providerSignsWebhooks(provider)}
						needsConfirmation={connection ? lastRunNeedsConfirmation(connection) : false}
						onConnect={() => handleConnectClick(provider)}
						onSync={connection && withBusy(connection.id, async () => {
							await startAtsSync(connection.id);
							toast.success(t('atsIntegrations.syncStarted'));
						})}
						onTest={connection && withBusy(connection.id, async () => {
							await testAtsConnection(connection.id);
							toast.success(t('atsIntegrations.testOk'));
						})}
						onDelete={() => setConnectionToDelete(connection)}
						onToggle={(key) => handleToggle(connection, key)}
						onConfirmInitialSync={() => confirmInitialSync(connection)}
						onCopy={copyValue}
						onRetryWebhooks={connection && withBusy(connection.id, async () => {
							await registerAtsWebhooks(connection.id);
							toast.success(t('atsIntegrations.guides.webhookRetried'));
						})}
					/>
				);
			})}

			<RegionDialog
				provider={regionProvider}
				regions={catalog.zohoRegions}
				region={region}
				onRegionChange={setRegion}
				busy={busyId === regionProvider}
				onCancel={() => setRegionProvider(null)}
				onConnect={async () => {
					const provider = regionProvider;
					setRegionProvider(null);
					await beginOauth(provider, region);
				}}
			/>

			<ConnectDialog
				provider={connectProvider}
				form={form}
				onFieldChange={(field, value) => setForm((p) => ({ ...p, [field]: value }))}
				connecting={connecting}
				onCancel={() => setConnectProvider(null)}
				onConnect={handleCreate}
			/>

			<ConfirmDialog
				open={!!connectionToDelete}
				title={t('atsIntegrations.disconnect')}
				cancelLabel={t('accountSettings.cancel')}
				confirmLabel={t('atsIntegrations.disconnect')}
				onCancel={() => setConnectionToDelete(null)}
				onConfirm={handleDelete}
				tone="danger"
			>
				{connectionToDelete ? t('atsIntegrations.deleteConfirm', { provider: PROVIDERS[connectionToDelete.provider].label }) : ''}
			</ConfirmDialog>
		</Box>
	);
};

export default AccountIntegrationsTab;
