import { REPORT_STATUSES } from '../../reports/model/reportStatus.js';

/** The periods the Pipeline card offers, in days; the first is the default. */
export const PIPELINE_PERIODS = [30, 7, 90];

/** The statuses shown as columns: every move past New. */
export const PIPELINE_COLUMNS = REPORT_STATUSES.filter((s) => s !== 'NEW');

/** The request window for a period ending now. */
export const periodRange = (days, now = new Date()) => ({
	from: new Date(now.getTime() - days * 24 * 3600 * 1000).toISOString(),
	to: now.toISOString(),
});

/** "18 h" under two days, "3.5 d" beyond; null without a shortlist. */
export const formatHoursToShortlist = (hours) => {
	if (hours == null) return null;
	if (hours < 48) return { value: Math.round(hours), unit: 'hours' };
	return { value: Math.round((hours / 24) * 10) / 10, unit: 'days' };
};

/** True when nobody moved a candidate in the period and no candidate is past New. */
export const isPipelineEmpty = (data) => !data
	|| ((data.recruiters ?? []).length === 0 && PIPELINE_COLUMNS.every((s) => !(data.currentByStatus?.[s] > 0)));
