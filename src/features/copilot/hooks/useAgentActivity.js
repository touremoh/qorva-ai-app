import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import usePolling from '../../../shared/hooks/usePolling.js';
import { toastError } from '../../../utils/errorHandler.js';
import { cancelAgentRun, getAgentRun, listAgentRuns } from '../api/agentService.js';
import { isActive, isAwaitingApproval, isWorking } from '../model/agentRun.js';

const PAGE_SIZE = 20;
const LIST_POLL_MS = 10000;
const RUN_POLL_MS = 2000;

/** Activity tab: the user's runs (or the team's), filtered and paged, plus the run opened in the drawer. */
export default function useAgentActivity() {
	const [params, setParams] = useSearchParams();
	const status = params.get('status') || '';
	const origin = params.get('origin') || '';
	const ruleId = params.get('ruleId') || '';
	// ?scope=team comes from a teammate's rule ("See its tasks"); the server still checks MANAGE_USERS.
	const [scope, setScope] = useState(() => (params.get('scope') === 'team' ? 'team' : 'mine'));
	const [page, setPage] = useState(0);
	const [data, setData] = useState({ items: [], total: 0 });
	const [loading, setLoading] = useState(true);
	const [selectedRun, setSelectedRun] = useState(null);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const load = useCallback((quiet = false) => {
		if (!quiet) setLoading(true);
		return listAgentRuns({ scope, status: status || undefined, origin: origin || undefined, ruleId: ruleId || undefined, page, size: PAGE_SIZE })
			.then((res) => setData({ items: res.data?.items ?? [], total: res.data?.total ?? 0 }))
			.catch((e) => { if (!quiet) toastError(e); })
			.finally(() => { if (!quiet) setLoading(false); });
	}, [scope, status, origin, ruleId, page]);

	useEffect(() => { load(); }, [load]);

	usePolling(() => load(true), { active: data.items.some(isActive), intervalMs: LIST_POLL_MS });

	usePolling(() => {
		if (!selectedRun?.id) return;
		getAgentRun(selectedRun.id).then((res) => setSelectedRun(res.data)).catch(() => {});
	}, { active: drawerOpen && (isWorking(selectedRun) || isAwaitingApproval(selectedRun)), intervalMs: RUN_POLL_MS });

	/** Filters live in the URL, so a digest email's link opens Activity already filtered. */
	const setParam = useCallback((name, next) => {
		const nextParams = new URLSearchParams(params);
		if (next) nextParams.set(name, next); else nextParams.delete(name);
		// Choosing an origin replaces the "this rule's tasks" filter.
		if (name === 'origin') nextParams.delete('ruleId');
		setParams(nextParams, { replace: true });
		setPage(0);
	}, [params, setParams]);

	const setStatus = useCallback((next) => setParam('status', next), [setParam]);
	const setOrigin = useCallback((next) => setParam('origin', next), [setParam]);
	const clearRule = useCallback(() => setParam('ruleId', ''), [setParam]);

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

	const updateRun = useCallback((run) => {
		if (!run?.id) return;
		setSelectedRun((current) => (current?.id === run.id ? run : current));
		load(true);
	}, [load]);

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
		cancelRun, changeScope, clearRule, closeRun, data, drawerOpen, loading, openRun, origin, page, pageSize: PAGE_SIZE,
		ruleId, scope, selectedRun, setOrigin, setPage, setStatus, status, updateRun,
	};
}
