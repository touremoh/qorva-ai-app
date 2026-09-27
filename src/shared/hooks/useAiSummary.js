import { useEffect, useRef, useState } from 'react';

/**
 * An AI summary loaded from `fetcher` once the page's own data is ready, and again whenever
 * `trigger` changes (the backend only regenerates when the underlying numbers changed, so a reload
 * is cheap).
 * - `pending`: the page's data is reloading — keep the previous summary on screen meanwhile.
 * - `enabled`: false when there is nothing to summarise (empty library, no usage period).
 * `failed` means the page shows its plain content only.
 */
export default function useAiSummary(fetcher, { enabled, pending = false, trigger }) {
	const [insight, setInsight] = useState(null);
	const [loading, setLoading] = useState(false);
	const [failed, setFailed] = useState(false);
	const requestId = useRef(0);

	useEffect(() => {
		if (pending) return;
		if (!enabled) {
			setInsight(null);
			return;
		}
		const id = ++requestId.current;
		setLoading(true);
		setFailed(false);
		fetcher()
			.then((res) => {
				if (id !== requestId.current) return;
				const data = res.data?.data ?? res.data;
				setInsight(data?.headline ? data : null);
			})
			.catch(() => {
				if (id !== requestId.current) return;
				setInsight(null); // a summary of older numbers would mislead
				setFailed(true);
			})
			.finally(() => {
				if (id === requestId.current) setLoading(false);
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trigger, enabled, pending]);

	return { insight, loading, failed };
}
