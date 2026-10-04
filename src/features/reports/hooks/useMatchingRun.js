import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getActiveMatchingRuns, getMatchingRun } from '../api/reportService.js';
import { getJobs } from '../../jobs/api/jobService.js';
import { isRunActive, runsProgress, unwrap } from '../model/matchingRun.js';

const POLL_MS = 3000;

/**
 * Matching runs on the matching page: how many open jobs have out-of-date results, the runs in progress
 * (picked up again when the page is reopened), their real progress, and the last finished run for the
 * "reports ready" banner. `follow` hands over a run just started from the run dialog; `refreshReports`
 * reloads the report list (with the current filters) whenever a run finishes.
 */
export default function useMatchingRun({ refreshReports }) {
	const [runs, setRuns] = useState([]);
	const [finishedRun, setFinishedRun] = useState(null);
	const [bannerDismissed, setBannerDismissed] = useState(false);
	const [pendingJobsCount, setPendingJobsCount] = useState(0);
	const refreshReportsRef = useRef(refreshReports);
	useEffect(() => { refreshReportsRef.current = refreshReports; });

	const refreshPendingCount = useCallback(async () => {
		try {
			const res = await getJobs({ status: 'open', matchingReportsNeeded: true, pageNumber: 0, pageSize: 1 });
			setPendingJobsCount(res?.data?.data?.totalElements ?? 0);
		} catch { /* the banner is best-effort */ }
	}, []);

	// Runs started earlier (another tab, before a reload) are followed too.
	useEffect(() => {
		refreshPendingCount();
		getActiveMatchingRuns()
			.then((res) => setRuns(unwrap(res)?.runs ?? []))
			.catch(() => { /* nothing to follow */ });
	}, [refreshPendingCount]);

	const followedIds = runs.map((r) => r.id).join(',');

	useEffect(() => {
		if (!followedIds) return undefined;
		let cancelled = false;
		const poll = async () => {
			const ids = followedIds.split(',');
			const latest = await Promise.all(ids.map((id) => getMatchingRun(id).then(unwrap).catch(() => null)));
			if (cancelled) return;
			const finished = latest.filter((run) => run && !isRunActive(run));
			setRuns(latest.filter((run) => run && isRunActive(run)));
			if (finished.length > 0) {
				setFinishedRun(finished[finished.length - 1]);
				setBannerDismissed(false);
				refreshReportsRef.current?.();
				refreshPendingCount();
			}
		};
		const timer = setInterval(poll, POLL_MS);
		return () => { cancelled = true; clearInterval(timer); };
	}, [followedIds, refreshPendingCount]);

	const follow = useCallback((run) => {
		if (!run) return;
		setFinishedRun(null);
		setRuns((prev) => [...prev.filter((r) => r.id !== run.id), run]);
	}, []);

	const matchingProgress = useMemo(() => runsProgress(runs), [runs]);

	return {
		runs, matchingActive: runs.length > 0, matchingProgress,
		finishedRun, bannerDismissed, setBannerDismissed,
		pendingJobsCount, refreshPendingCount, follow,
	};
}
