import { scoreColorsFor } from '../../../shared/lib/score.js';

// A job counts as pending only while it is open: only open jobs are matched, and a closed
// job's flag means nothing.
export const needsMatching = (job) => job.matchingReportsNeeded === true && job.status === 'open';

export const PAGE_SIZES = [10, 25, 50, 100];

/** A report's final score, 0 when it has none — what the list is sorted by. */
export const finalScoreOf = (report) => report?.matchingReportDetails?.decisionSummary?.finalScore ?? 0;

export const scoreChipSx = (score) => {
	const tone = scoreColorsFor(score);
	return { backgroundColor: tone.tint, color: tone.text };
};
