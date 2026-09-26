import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { toastError } from '../../../utils/errorHandler.js';
import { getAtsConnections, getAtsProviders, getAtsSyncRuns } from '../api/atsService.js';
import usePolling from '../../../shared/hooks/usePolling.js';
import { SYNC_POLL_MS, SYNC_POLL_TIMEOUT_MS } from '../model/integrations.js';

/**
 * The tenant's ATS catalog, connections and recent sync runs. Keeps polling while a sync is in
 * flight, and reports the result of an OAuth round-trip once when the page comes back from it.
 */
export default function useAtsIntegrations() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(true);
	const [catalog, setCatalog] = useState({ providers: [], maxConnections: 0, usedConnections: 0 });
	const [catalogFailed, setCatalogFailed] = useState(false);
	const [connections, setConnections] = useState([]);
	const [runsByConnection, setRunsByConnection] = useState({});

	const reload = useCallback(async ({ silent = false } = {}) => {
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
			// A failed poll must neither blank the card nor stack up toasts — the next tick retries.
			if (silent) return;
			// The catalog never loaded, so maxConnections stays 0 — which must not be read
			// as "this plan has no ATS connections". The error itself is already toasted.
			setCatalogFailed(true);
			toastError(e);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { reload(); }, [reload]);

	const syncInFlight = Object.values(runsByConnection)
		.some((runs) => runs.some((run) => ['PENDING', 'RUNNING'].includes(run.status)));

	/*
	 * startAtsSync only queues the job; a background worker drains it seconds later. Reloading
	 * once when the button returns therefore reads the run back as PENDING with 0/0/0, and
	 * nothing refreshed it after that — the spinner sat there until the tab was switched and
	 * the component remounted. Poll until no run is in flight. syncInFlight is a boolean, so
	 * a reload that changes nothing does not restart the interval or the timeout.
	 */
	usePolling(() => reload({ silent: true }), { active: syncInFlight, intervalMs: SYNC_POLL_MS, timeoutMs: SYNC_POLL_TIMEOUT_MS });

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

	return { loading, catalog, catalogFailed, connections, setConnections, runsByConnection, reload };
}
