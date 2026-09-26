import { useEffect, useMemo, useRef, useState } from 'react';
import { startMatching } from '../api/reportService.js';
import { getJobs } from '../../../services/jobService.js';
import { needsMatching } from '../model/reportList.js';

/**
 * Matching runs: the job posts waiting for matching, starting a run, a 5 s poll (reports and jobs)
 * until none are pending or 6 minutes pass, and the progress bar shown meanwhile.
 * `refreshReports` reloads the report list with the current filters; `onJobsFetched` receives the
 * job list each time it is fetched outside the poll.
 */
export default function useMatchingRun({ refreshReports, onJobsFetched }) {
	const [jobs, setJobs] = useState([]);
	const [matchingLoading, setScreeningLoading] = useState(false);
	const [matchingSubmitted, setScreeningSubmitted] = useState(false);
	const [matchingCompleted, setMatchingCompleted] = useState(false);
	const [bannerDismissed, setBannerDismissed] = useState(false);
	const pollingRef      = useRef(null);
	const progressTimerRef = useRef(null);
	const matchingStartRef = useRef(null);
	const [matchingProgress, setMatchingProgress] = useState(0);
	const [matchingElapsed, setMatchingElapsed] = useState(0);
	const refreshReportsRef = useRef(refreshReports);
	const onJobsFetchedRef = useRef(onJobsFetched);
	useEffect(() => { refreshReportsRef.current = refreshReports; onJobsFetchedRef.current = onJobsFetched; });

	const fetchJobs = async () => {
		try {
			const response = await getJobs({ pageSize: 25, pageNumber: 0 });
			const content = response?.data?.data?.content ?? [];
			setJobs(content);
			onJobsFetchedRef.current?.(content);
		} catch (error) {
			console.error('Error fetching jobs:', error);
		}
	};

	// Poll every 5 s while matching is in progress; stop when no jobs remain pending
	useEffect(() => {
		if (!matchingSubmitted) {
			if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
			return;
		}

		let attempts = 0;
		const MAX_ATTEMPTS = 72; // 6 minutes max

		const poll = async () => {
			attempts += 1;
			try {
				await refreshReportsRef.current?.();
				const jobsRes = await getJobs({ pageSize: 25, pageNumber: 0 });
				const updatedJobs = jobsRes?.data?.data?.content ?? [];
				setJobs(updatedJobs);
				const pending = updatedJobs.filter(needsMatching).length;
				if (pending === 0 || attempts >= MAX_ATTEMPTS) {
					clearInterval(pollingRef.current);
					pollingRef.current = null;
					setScreeningSubmitted(false);
					setMatchingCompleted(true);
					setBannerDismissed(false);
				}
			} catch (err) {
				console.error('Polling error:', err);
			}
		};

		pollingRef.current = setInterval(poll, 5000);
		return () => { clearInterval(pollingRef.current); pollingRef.current = null; };
	}, [matchingSubmitted]);

	// Drive progress bar while matching is running (starts on button click, not just after API returns)
	useEffect(() => {
		const isActive = matchingLoading || matchingSubmitted;
		if (isActive) {
			if (!progressTimerRef.current) {
				matchingStartRef.current = Date.now();
				setMatchingProgress(0);
				setMatchingElapsed(0);
				progressTimerRef.current = setInterval(() => {
					const elapsed = Math.floor((Date.now() - matchingStartRef.current) / 1000);
					setMatchingElapsed(elapsed);
					setMatchingProgress(Math.min(92, (elapsed / 60) * 100));
				}, 500);
			}
		} else {
			clearInterval(progressTimerRef.current);
			progressTimerRef.current = null;
			setMatchingProgress(0);
			setMatchingElapsed(0);
		}
	}, [matchingLoading, matchingSubmitted]);

	// Clear timer on unmount
	useEffect(() => () => { clearInterval(progressTimerRef.current); }, []);

	const pendingMatchingCount = useMemo(() => jobs.filter(needsMatching).length, [jobs]);

	const handleStartMatching = async () => {
		try {
			setScreeningLoading(true);
			setMatchingCompleted(false);
			setBannerDismissed(false);
			await startMatching();
			await fetchJobs();
			setScreeningSubmitted(true);
		} catch (error) {
			console.error('Error starting matching:', error);
		} finally {
			setScreeningLoading(false);
		}
	};

	return {
		jobs, fetchJobs, pendingMatchingCount, handleStartMatching,
		matchingLoading, matchingSubmitted, matchingCompleted, bannerDismissed, setBannerDismissed,
		matchingProgress, matchingElapsed,
	};
}
