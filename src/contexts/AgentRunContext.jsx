import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import usePolling from '../shared/hooks/usePolling.js';
import { hasPermission } from '../shared/lib/session.js';
import { isDemoUser } from '../utils/demoMode.js';
import {
	approveAgentAction,
	cancelAgentRun,
	getAgentAvailability,
	getAgentRun,
	getPendingApprovalCount,
	listAgentRuns,
	rejectAgentAction,
	startAgentRun,
} from '../features/copilot/api/agentService.js';
import { isActive, isAwaitingApproval, isWorking, RUN_STATUS } from '../features/copilot/model/agentRun.js';

// App-level owner of the user's current Copilot run: it keeps polling while the run works, so the
// run survives switching panels and refreshing the page, and tells the user when it is done if
// they are elsewhere. Nothing is fetched for users who can't use Copilot (demo, no USE_AGENT).
const POLL_MS = 2000;
// A run waiting for approval changes only when someone decides (maybe in another tab) or it expires.
const AWAITING_POLL_MS = 5000;
const COUNT_POLL_MS = 60000;
const COPILOT_PATH = '/app/copilot';

const AgentRunContext = createContext({ available: false });

// eslint-disable-next-line react-refresh/only-export-components
export const useAgentRun = () => useContext(AgentRunContext);

export const AgentRunProvider = ({ children }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const [availability, setAvailability] = useState(null);
	const [activeRun, setActiveRun] = useState(null);
	const [pendingApprovals, setPendingApprovals] = useState(0);
	const pathRef = useRef(location.pathname);
	useEffect(() => { pathRef.current = location.pathname; }, [location.pathname]);

	const mayUseAgent = !isDemoUser() && hasPermission('USE_AGENT');

	const refreshAvailability = useCallback(() => {
		if (!mayUseAgent) return;
		getAgentAvailability()
			.then((res) => setAvailability(res.data ?? null))
			.catch(() => setAvailability(null));
	}, [mayUseAgent]);

	useEffect(() => { refreshAvailability(); }, [refreshAvailability]);

	const available = !!availability?.enabled;

	// Resume after a refresh: the user's newest run, if it is still active.
	useEffect(() => {
		if (!available) return;
		listAgentRuns({ scope: 'mine', page: 0, size: 1 })
			.then((res) => {
				const latest = res.data?.items?.[0];
				if (isActive(latest)) getAgentRun(latest.id).then((r) => setActiveRun(r.data)).catch(() => {});
			})
			.catch(() => {});
	}, [available]);

	const refreshPendingApprovals = useCallback(() => {
		if (!available) return;
		getPendingApprovalCount()
			.then((res) => setPendingApprovals(res.data?.count ?? 0))
			.catch(() => {});
	}, [available]);

	useEffect(() => { refreshPendingApprovals(); }, [refreshPendingApprovals]);
	usePolling(refreshPendingApprovals, { active: available, intervalMs: COUNT_POLL_MS });

	const announceApproval = useCallback((run) => {
		refreshPendingApprovals();
		if (pathRef.current.startsWith(COPILOT_PATH)) return;
		toast.warning(t('copilot.toast.approval', { title: run.title }), {
			action: { label: t('copilot.toast.open'), onClick: () => navigate(COPILOT_PATH) },
		});
	}, [navigate, refreshPendingApprovals, t]);

	const announce = useCallback((run) => {
		refreshAvailability();
		if (pathRef.current.startsWith(COPILOT_PATH)) return;
		const open = { label: t('copilot.toast.open'), onClick: () => navigate(COPILOT_PATH) };
		if (run.status === RUN_STATUS.COMPLETED) toast.success(t('copilot.toast.completed', { title: run.title }), { action: open });
		else if (run.status === RUN_STATUS.FAILED) toast.error(t('copilot.toast.failed', { title: run.title }), { action: open });
	}, [navigate, refreshAvailability, t]);

	const pollActiveRun = () => {
		if (!activeRun?.id) return;
		const before = activeRun.status;
		getAgentRun(activeRun.id)
			.then((res) => {
				const run = res.data;
				setActiveRun(run);
				if (isAwaitingApproval(run) && before !== RUN_STATUS.AWAITING_APPROVAL) announceApproval(run);
				else if (!isActive(run)) announce(run);
			})
			.catch(() => {});
	};
	usePolling(pollActiveRun, { active: isWorking(activeRun), intervalMs: POLL_MS });
	usePolling(pollActiveRun, { active: isAwaitingApproval(activeRun), intervalMs: AWAITING_POLL_MS });

	const startRun = useCallback(async (payload) => {
		const res = await startAgentRun(payload);
		setActiveRun(res.data);
		return res.data;
	}, []);

	const cancelRun = useCallback(async (runId) => {
		const res = await cancelAgentRun(runId);
		setActiveRun((current) => (current?.id === runId ? res.data : current));
		return res.data;
	}, []);

	/** Records a decision; the run resumes on the server and this provider follows it again. */
	const decide = useCallback(async (run, action, approve, extra = {}) => {
		const call = approve ? approveAgentAction : rejectAgentAction;
		const res = await call(run.id, action.actionId, { argsHash: action.argsHash, ...extra });
		const updated = res.data;
		setActiveRun((current) => (!current || current.id === updated.id ? updated : current));
		refreshPendingApprovals();
		return updated;
	}, [refreshPendingApprovals]);

	const approveAction = useCallback((run, action, edits) => decide(run, action, true, edits), [decide]);
	const rejectAction = useCallback((run, action, reason) => decide(run, action, false, reason ? { reason } : {}), [decide]);

	const value = useMemo(() => ({
		available, availability, activeRun, pendingApprovals, startRun, cancelRun, approveAction, rejectAction, refreshAvailability,
	}), [available, availability, activeRun, pendingApprovals, startRun, cancelRun, approveAction, rejectAction, refreshAvailability]);

	return <AgentRunContext.Provider value={value}>{children}</AgentRunContext.Provider>;
};

AgentRunProvider.propTypes = {
	children: PropTypes.node,
};
