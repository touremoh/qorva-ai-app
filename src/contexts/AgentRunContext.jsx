import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import usePolling from '../shared/hooks/usePolling.js';
import { hasPermission } from '../shared/lib/session.js';
import { isDemoUser } from '../utils/demoMode.js';
import {
	cancelAgentRun,
	getAgentAvailability,
	getAgentRun,
	listAgentRuns,
	startAgentRun,
} from '../features/copilot/api/agentService.js';
import { isActive, isWorking, RUN_STATUS } from '../features/copilot/model/agentRun.js';

// App-level owner of the user's current Copilot run: it keeps polling while the run works, so the
// run survives switching panels and refreshing the page, and tells the user when it is done if
// they are elsewhere. Nothing is fetched for users who can't use Copilot (demo, no USE_AGENT).
const POLL_MS = 2000;
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

	const announce = useCallback((run) => {
		refreshAvailability();
		if (pathRef.current.startsWith(COPILOT_PATH)) return;
		const open = { label: t('copilot.toast.open'), onClick: () => navigate(COPILOT_PATH) };
		if (run.status === RUN_STATUS.COMPLETED) toast.success(t('copilot.toast.completed', { title: run.title }), { action: open });
		else if (run.status === RUN_STATUS.FAILED) toast.error(t('copilot.toast.failed', { title: run.title }), { action: open });
	}, [navigate, refreshAvailability, t]);

	usePolling(() => {
		if (!activeRun?.id) return;
		getAgentRun(activeRun.id)
			.then((res) => {
				const run = res.data;
				setActiveRun(run);
				if (!isWorking(run)) announce(run);
			})
			.catch(() => {});
	}, { active: isWorking(activeRun), intervalMs: POLL_MS });

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

	const value = useMemo(() => ({
		available, availability, activeRun, startRun, cancelRun, refreshAvailability,
	}), [available, availability, activeRun, startRun, cancelRun, refreshAvailability]);

	return <AgentRunContext.Provider value={value}>{children}</AgentRunContext.Provider>;
};

AgentRunProvider.propTypes = {
	children: PropTypes.node,
};
