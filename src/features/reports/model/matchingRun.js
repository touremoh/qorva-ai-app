import { needsMatching } from './reportList.js';

/** The plan's possible Top N values (steps of 5); the ones above the plan's cap are shown locked. */
export const TOP_N_STEPS = [5, 10, 15, 20, 25, 30];

const ACTIVE_RUN_STATUSES = new Set(['PENDING', 'RUNNING']);

/** The matching-run endpoints answer with the object itself, not the { code, data } envelope. */
export const unwrap = (response) => response?.data?.data ?? response?.data;

export const isRunActive = (run) => ACTIVE_RUN_STATUSES.has(run?.status);

/** Progress of one or more runs, 0–100; a run's total is an estimate, so it is capped. */
export const runsProgress = (runs) => {
	const total = runs.reduce((sum, r) => sum + (r.total ?? 0), 0);
	const processed = runs.reduce((sum, r) => sum + (r.processed ?? 0), 0);
	if (total <= 0) return 0;
	return Math.min(100, Math.round((processed / total) * 100));
};

/** i18n key of why a job's results are out of date, or null when they are current. */
export const staleReasonKey = (job) => {
	if (!job || !needsMatching(job)) return null;
	const known = ['NEVER_RUN', 'JOB_CHANGED', 'NEW_CANDIDATES', 'CANDIDATE_CHANGED'];
	return `matchingRun.stale.${known.includes(job.matchingStaleReason) ? job.matchingStaleReason : 'UNKNOWN'}`;
};

/** The next Top N above the job's last one, within the plan — "Show 5 more" — or null when at the cap. */
export const nextTopN = (job, allowedTopN) => {
	if (!job?.lastMatchedAt || !Array.isArray(allowedTopN) || allowedTopN.length === 0) return null;
	const current = job.matchingTopN ?? 10;
	return allowedTopN.find((n) => n > current) ?? null;
};

/** The Top N the run dialog preselects: the requested one if the plan allows it, else the plan default. */
export const initialTopN = (requested, options) => {
	const allowed = options?.allowedTopN ?? [];
	if (requested != null && allowed.includes(requested)) return requested;
	return options?.defaultTopN ?? allowed[0] ?? 10;
};

/** How much a re-scored report moved, in whole points, or null when it was not re-scored. */
export const scoreDelta = (report) => {
	const previous = report?.previousFinalScore;
	const current = report?.matchingReportDetails?.decisionSummary?.finalScore;
	if (previous == null || current == null) return null;
	const delta = Math.ceil(current) - Math.ceil(previous);
	return delta === 0 ? null : delta;
};

/** True when the run needs more actions than the period has left (null remaining = unlimited plan). */
export const exceedsRemaining = (estimate) =>
	estimate != null && estimate.remainingActions != null && estimate.estimatedActions > estimate.remainingActions;
