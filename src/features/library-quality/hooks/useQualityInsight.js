import { useEffect, useRef, useState } from 'react';
import { getLibraryQualityInsight } from '../api/libraryQualityService.js';

/**
 * The AI summary of the quality report. Loads after the report, and again whenever the report is
 * reloaded — the backend only regenerates when the numbers changed, so a reload is cheap.
 * `failed` means the page shows the plain verdict only.
 */
export default function useQualityInsight(report, reportLoading) {
	const [insight, setInsight] = useState(null);
	const [loading, setLoading] = useState(false);
	const [failed, setFailed] = useState(false);
	const requestId = useRef(0);

	useEffect(() => {
		if (reportLoading) return; // keep the previous summary on screen while the report reloads
		if (!report?.totalCVs) {
			setInsight(null);
			return;
		}
		const id = ++requestId.current;
		setLoading(true);
		setFailed(false);
		getLibraryQualityInsight()
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
	}, [report, reportLoading]);

	return { insight, loading, failed };
}
