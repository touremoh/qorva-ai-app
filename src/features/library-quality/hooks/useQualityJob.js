import { useEffect, useRef, useState } from 'react';
import { getQualityJobs } from '../api/libraryQualityService.js';
import { ACTIVE_JOB_STATUSES } from '../model/libraryQuality.js';

/**
 * The library's current (or last) background job. Checked on mount and whenever `trackJob` hands
 * over a freshly submitted job, then polled every 4 s while it runs; `onJobFinished` fires when a
 * job that was running is seen finished.
 */
export default function useQualityJob(onJobFinished) {
	const [activeJob, setActiveJob] = useState(null);
	const [jobPollNonce, setJobPollNonce] = useState(0);
	const onFinishedRef = useRef(onJobFinished);
	useEffect(() => { onFinishedRef.current = onJobFinished; });

	// Track the active background job: check on mount (and whenever a job is submitted),
	// then poll while one is running.
	useEffect(() => {
		let cancelled = false;
		let timer;
		const check = async () => {
			try {
				const res = await getQualityJobs();
				const jobs = (res.data?.data ?? res.data)?.jobs ?? [];
				const current = jobs.find(j => ACTIVE_JOB_STATUSES.has(j.status)) ?? jobs[0] ?? null;
				if (cancelled) return;
				setActiveJob(prev => {
					// Refresh the report the moment a previously-active job finishes.
					if (prev && ACTIVE_JOB_STATUSES.has(prev.status) && current && !ACTIVE_JOB_STATUSES.has(current.status)) {
						onFinishedRef.current?.();
					}
					return current;
				});
				if (current && ACTIVE_JOB_STATUSES.has(current.status)) {
					timer = setTimeout(check, 4000);
				}
			} catch { /* job card is best-effort */ }
		};
		check();
		return () => { cancelled = true; clearTimeout(timer); };
	}, [jobPollNonce]);

	const trackJob = (job) => {
		setActiveJob(job);
		setJobPollNonce(n => n + 1); // restart the polling loop for the fresh job
	};

	return { activeJob, setActiveJob, trackJob };
}
