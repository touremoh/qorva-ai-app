import { useEffect, useRef } from 'react';

/**
 * Calls `tick` every `intervalMs` while `active` is true, and gives up after `timeoutMs` (when set).
 * The interval restarts only when `active`, `intervalMs` or `timeoutMs` change: a new `tick`
 * function on each render is picked up without resetting the timer or the timeout.
 */
export default function usePolling(tick, { active = true, intervalMs, timeoutMs } = {}) {
	const tickRef = useRef(tick);
	useEffect(() => { tickRef.current = tick; }, [tick]);

	useEffect(() => {
		if (!active) return undefined;
		const startedAt = Date.now();
		const timer = setInterval(() => {
			if (timeoutMs && Date.now() - startedAt > timeoutMs) {
				clearInterval(timer);
				return;
			}
			tickRef.current();
		}, intervalMs);
		return () => clearInterval(timer);
	}, [active, intervalMs, timeoutMs]);
}
