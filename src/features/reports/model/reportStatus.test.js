import { describe, expect, it } from 'vitest';
import { REPORT_STATUSES, lastMove, pipelineSummary, statusChipSx, statusOf, withStatus } from './reportStatus.js';

describe('reportStatus', () => {
	it('lists the pipeline in order and reads unknown or missing statuses as New', () => {
		expect(REPORT_STATUSES[0]).toBe('NEW');
		expect(REPORT_STATUSES.at(-1)).toBe('WITHDRAWN');
		expect(statusOf({ status: 'SHORTLISTED' })).toBe('SHORTLISTED');
		expect(statusOf({ status: 'OPEN' })).toBe('NEW');
		expect(statusOf({})).toBe('NEW');
	});

	it('gives every status a colour pair', () => {
		REPORT_STATUSES.forEach((s) => {
			expect(statusChipSx(s).backgroundColor).toBeTruthy();
			expect(statusChipSx(s).color).toBeTruthy();
		});
	});

	it('finds the latest move and applies a move without touching the rest of the report', () => {
		const report = { id: 'r1', status: 'NEW', statusHistory: [{ status: 'CONTACTED' }, { status: 'SHORTLISTED' }] };
		expect(lastMove(report).status).toBe('SHORTLISTED');
		expect(lastMove({})).toBeNull();
		expect(withStatus(report, 'HIRED')).toEqual({ ...report, status: 'HIRED' });
	});

	it('summarises a job past New, in pipeline order, skipping empty statuses', () => {
		expect(pipelineSummary({ NEW: 9, INTERVIEWING: 1, SHORTLISTED: 3, HIRED: 0 }))
			.toEqual([{ status: 'SHORTLISTED', count: 3 }, { status: 'INTERVIEWING', count: 1 }]);
		expect(pipelineSummary(null)).toEqual([]);
	});
});
