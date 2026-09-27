import { useEffect, useRef } from 'react';
import { TOKEN_EXPIRY } from '../../constants.js';

/** Refresh this long before the token expires. */
export const REFRESH_LEAD_MS = 2 * 60 * 1000;
/** Never schedule sooner than this, so a very short token lifetime cannot spin. */
export const MIN_DELAY_MS = 5 * 1000;

const ACTIVITY_EVENTS = ['pointerdown', 'keydown'];

const storedExpiry = () => Number(localStorage.getItem(TOKEN_EXPIRY)) || 0;

/**
 * Keeps an active session signed in. The API refuses to refresh a token that has already expired,
 * so the refresh has to happen before expiry: shortly before `tokenExpiry` (epoch ms), `refresh()`
 * runs and its result goes to `onRefreshed`, but only if the user did something since the last
 * refresh. An abandoned tab is left to expire; its next request answers 401 and goes to sign-in.
 * One refresh at a time; a failed refresh is left to that same 401 path.
 */
export default function useSessionRefresh({ active, refresh, onRefreshed }) {
	const refreshRef = useRef(refresh);
	const onRefreshedRef = useRef(onRefreshed);
	useEffect(() => { refreshRef.current = refresh; }, [refresh]);
	useEffect(() => { onRefreshedRef.current = onRefreshed; }, [onRefreshed]);

	useEffect(() => {
		if (!active) return undefined;

		let timer = null;
		let inFlight = false;
		let disposed = false;
		// Activity since the last refresh started (the mount refresh counts as the first one).
		let activeSinceRefresh = false;

		const schedule = () => {
			clearTimeout(timer);
			timer = null;
			const expiry = storedExpiry();
			if (!expiry) return;
			timer = setTimeout(() => { timer = null; run(); }, Math.max(expiry - REFRESH_LEAD_MS - Date.now(), MIN_DELAY_MS));
		};

		const run = async () => {
			if (inFlight || disposed) return;
			// Idle since the last refresh: let the token lapse. Activity before expiry calls run() again.
			if (!activeSinceRefresh) return;
			if (Date.now() >= storedExpiry()) return;
			inFlight = true;
			// Cleared as the refresh starts, so activity while it is in flight counts toward the next one.
			activeSinceRefresh = false;
			try {
				const response = await refreshRef.current();
				if (disposed) return;
				onRefreshedRef.current(response);
			} catch {
				// Nothing to do: the next request answers 401 and the API client sends the user to sign-in.
			} finally {
				inFlight = false;
				if (!disposed) schedule();
			}
		};

		const onActivity = () => {
			activeSinceRefresh = true;
			// The scheduled time passed while the user was away: refresh now, while the token is still valid.
			if (timer === null && !inFlight && Date.now() >= storedExpiry() - REFRESH_LEAD_MS) run();
		};
		const onVisibility = () => { if (document.visibilityState === 'visible') onActivity(); };

		ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, onActivity, { passive: true }));
		document.addEventListener('visibilitychange', onVisibility);
		schedule();

		return () => {
			disposed = true;
			clearTimeout(timer);
			ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, onActivity));
			document.removeEventListener('visibilitychange', onVisibility);
		};
	}, [active]);
}
