import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import usePolling from '../../../shared/hooks/usePolling.js';
import { toastError } from '../../../utils/errorHandler.js';
import { cancelAgentRun, getAgentRun, listAgentRuns } from '../api/agentService.js';
import { isActive, isWorking } from '../model/agentRun.js';

const PAGE_SIZE = 20;
const LIST_POLL_MS = 10000;
const RUN_POLL_MS = 2000;

/** Activity tab: the user's runs (or the team's), filtered and paged, plus the run opened in the drawer. */
export default function useAgentActivity() {
	const [params, setParams] = useSearchParams();
	const status = params.get('status') || '';
	const [scope, setScope] = useState('mine');
	const [page, setPage] = useState(0);
	const [data, setData] = useState({ items: [], total: 0 });
	const [loading, setLoading] = useState(true);
	const [selectedRun, setSelectedRun] = useState(null);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const load = useCallback((quiet = false) => {
		if (!quiet) setLoading(true);
		return listAgentRuns({ scope, status: status || undefined, page, size: PAGE_SIZE })
			.then((res) => setData({ items: res.data?.items ?? [], total: res.data?.total ?? 0 }))
			.catch((e) => { if (!quiet) toastError(e); })
			.finally(() => { if (!quiet) setLoading(false); });
	}, [scope, status, page]);

	useEffect(() => { load(); }, [load]);

	usePolling(() => load(true), { active: data.items.some(isActive), intervalMs: LIST_POLL_MS });

	usePolling(() => {
		if (!selectedRun?.id) return;
		getAgentRun(selectedRun.id).then((res) => setSelectedRun(res.data)).catch(() => {});
	}, { active: drawerOpen && isWorking(selectedRun), intervalMs: RUN_POLL_MS });

	const setStatus = useCallback((next) => {
		const nextParams = new URLSearchParams(params);
		if (next) nextParams.set('status', next); else nextParams.delete('status');
		setParams(nextParams, { replace: true });
		setPage(0);
	}, [params, setParams]);

	const changeScope = useCallback((next) => {
		if (!next) return;
		setScope(next);
		setPage(0);
	}, []);

	const openRun = useCallback(async (runId) => {
		setDrawerOpen(true);
		setSelectedRun(null);
		try {
			const res = await getAgentRun(runId);
			setSelectedRun(res.data);
		} catch (e) {
			toastError(e);
			setDrawerOpen(false);
		}
	}, []);

	const closeRun = useCallback(() => {
		setDrawerOpen(false);
		setSelectedRun(null);
	}, []);

	const cancelRun = useCallback(async (runId) => {
		try {
			const res = await cancelAgentRun(runId);
			setSelectedRun((current) => (current?.id === runId ? res.data : current));
			load(true);
		} catch (e) {
			toastError(e);
		}
	}, [load]);

	return {
		cancelRun, changeScope, closeRun, data, drawerOpen, loading, openRun, page, pageSize: PAGE_SIZE,
		scope, selectedRun, setPage, setStatus, status,
	};
}
