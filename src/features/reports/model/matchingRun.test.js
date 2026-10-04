import { describe, expect, it } from 'vitest';
import { exceedsRemaining, initialTopN, isRunActive, nextTopN, runsProgress, scoreDelta, staleReasonKey } from './matchingRun.js';

describe('matching runs', () => {
	it('knows when a run is still going', () => {
		expect(isRunActive({ status: 'PENDING' })).toBe(true);
		expect(isRunActive({ status: 'RUNNING' })).toBe(true);
		expect(isRunActive({ status: 'COMPLETED' })).toBe(false);
		expect(isRunActive(null)).toBe(false);
	});

	it('adds up the progress of every followed run, capped at 100', () => {
		expect(runsProgress([{ total: 10, processed: 5 }, { total: 10, processed: 10 }])).toBe(75);
		expect(runsProgress([{ total: 4, processed: 6 }])).toBe(100);
		expect(runsProgress([{ total: 0, processed: 0 }])).toBe(0);
	});

	it('names why an open flagged job is out of date, and nothing for a current or closed one', () => {
		expect(staleReasonKey({ status: 'open', matchingReportsNeeded: true, matchingStaleReason: 'NEW_CANDIDATES' }))
			.toBe('matchingRun.stale.NEW_CANDIDATES');
		expect(staleReasonKey({ status: 'open', matchingReportsNeeded: true, matchingStaleReason: null }))
			.toBe('matchingRun.stale.UNKNOWN');
		expect(staleReasonKey({ status: 'open', matchingReportsNeeded: false })).toBeNull();
		expect(staleReasonKey({ status: 'closed', matchingReportsNeeded: true, matchingStaleReason: 'JOB_CHANGED' })).toBeNull();
	});

	it('offers five more until the plan cap, and nothing for a job never matched', () => {
		const allowed = [5, 10, 15, 20];
		expect(nextTopN({ lastMatchedAt: '2026-10-01T10:00:00Z', matchingTopN: 10 }, allowed)).toBe(15);
		expect(nextTopN({ lastMatchedAt: '2026-10-01T10:00:00Z', matchingTopN: 20 }, allowed)).toBeNull();
		expect(nextTopN({ lastMatchedAt: null, matchingTopN: 10 }, allowed)).toBeNull();
	});

	it('preselects the requested Top N only when the plan allows it', () => {
		const options = { allowedTopN: [5, 10], defaultTopN: 10 };
		expect(initialTopN(5, options)).toBe(5);
		expect(initialTopN(20, options)).toBe(10);
		expect(initialTopN(null, options)).toBe(10);
	});

	it('shows how far a re-scored report moved', () => {
		const report = (score, previous) => ({ previousFinalScore: previous, matchingReportDetails: { decisionSummary: { finalScore: score } } });
		expect(scoreDelta(report(81, 72))).toBe(9);
		expect(scoreDelta(report(64.2, 70))).toBe(-5);
		expect(scoreDelta(report(70, 70))).toBeNull();
		expect(scoreDelta(report(70, null))).toBeNull();
	});

	it('warns only when a limited plan has fewer actions left than the run needs', () => {
		expect(exceedsRemaining({ estimatedActions: 12, remainingActions: 10 })).toBe(true);
		expect(exceedsRemaining({ estimatedActions: 12, remainingActions: null })).toBe(false);
		expect(exceedsRemaining({ estimatedActions: 0, remainingActions: 0 })).toBe(false);
	});
});
