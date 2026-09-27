import { scoreColorsFor } from '../../../shared/lib/score.js';

// A job counts as pending only while it is open: the backend screens open jobs only, so it
// never clears the flag on a closed one, and counting it here kept the poll waiting until
// its timeout and the "jobs need matching" banner showing for good.
export const needsMatching = (job) => job.matchingReportsNeeded === true && job.status === 'open';

export const PAGE_SIZES = [10, 25, 50, 100];

export const getMatchingPhaseKey = (elapsed) => {
	if (elapsed < 10) return 'matchingPhase1';
	if (elapsed < 20) return 'matchingPhase2';
	if (elapsed < 30) return 'matchingPhase3';
	if (elapsed < 50) return 'matchingPhase4';
	return 'matchingPhase5';
};

export const scoreChipSx = (score) => {
	const tone = scoreColorsFor(score);
	return { backgroundColor: tone.tint, color: tone.text };
};
