import { describe, expect, it } from 'vitest';
import { PIPELINE_COLUMNS, formatHoursToShortlist, isPipelineEmpty, periodRange } from './pipeline.js';

describe('pipeline', () => {
	it('shows every status past New as a column', () => {
		expect(PIPELINE_COLUMNS).not.toContain('NEW');
		expect(PIPELINE_COLUMNS).toHaveLength(7);
	});

	it('asks for the period ending now', () => {
		const now = new Date('2026-10-04T12:00:00Z');
		expect(periodRange(7, now)).toEqual({ from: '2026-09-27T12:00:00.000Z', to: '2026-10-04T12:00:00.000Z' });
	});

	it('shows hours under two days, then days', () => {
		expect(formatHoursToShortlist(null)).toBeNull();
		expect(formatHoursToShortlist(17.6)).toEqual({ value: 18, unit: 'hours' });
		expect(formatHoursToShortlist(84)).toEqual({ value: 3.5, unit: 'days' });
	});

	it('is empty until someone moves a candidate past New', () => {
		expect(isPipelineEmpty(null)).toBe(true);
		expect(isPipelineEmpty({ currentByStatus: { NEW: 12 }, recruiters: [] })).toBe(true);
		expect(isPipelineEmpty({ currentByStatus: { NEW: 11, SHORTLISTED: 1 }, recruiters: [] })).toBe(false);
	});
});
