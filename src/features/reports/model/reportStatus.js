import { alpha } from '@mui/material/styles';
import * as tokens from '../../../theme/tokens.js';

/** Where a candidate stands on a job, in pipeline order (Rejected and Withdrawn can follow any step). */
export const REPORT_STATUSES = ['NEW', 'CONTACTED', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'HIRED', 'REJECTED', 'WITHDRAWN'];

/** Reports created before the pipeline, or with an unknown value, read as New. */
export const statusOf = (report) => (REPORT_STATUSES.includes(report?.status) ? report.status : 'NEW');

const TONES = {
	NEW: { bg: tokens.surface.muted, text: tokens.ink.muted },
	CONTACTED: { bg: tokens.status.info.tint, text: tokens.status.info.text },
	SHORTLISTED: { bg: alpha(tokens.status.accent.bright, 0.12), text: tokens.status.accent.deep },
	INTERVIEWING: { bg: tokens.status.warning.tint, text: tokens.status.warning.text },
	OFFERED: { bg: tokens.status.success.pale, text: tokens.status.success.teal },
	HIRED: { bg: tokens.status.success.tint, text: tokens.status.success.text },
	REJECTED: { bg: tokens.status.error.tint, text: tokens.status.error.text },
	WITHDRAWN: { bg: tokens.surface.muted, text: tokens.ink.subtle },
};

export const statusChipSx = (status) => {
	const tone = TONES[status] ?? TONES.NEW;
	return { backgroundColor: tone.bg, color: tone.text };
};

/** The report's latest move, or null before the first one. */
export const lastMove = (report) => {
	const history = report?.statusHistory;
	return Array.isArray(history) && history.length > 0 ? history[history.length - 1] : null;
};

/** The report as it looks right after a move, before the server answers (optimistic update). */
export const withStatus = (report, status) => ({ ...report, status });

/**
 * "3 shortlisted · 1 interviewing": the job's statuses past New with at least one candidate, in pipeline order.
 * {@code counts} is the Dashboard's currentByStatus.
 */
export const pipelineSummary = (counts) =>
	REPORT_STATUSES.filter((s) => s !== 'NEW' && (counts?.[s] ?? 0) > 0).map((s) => ({ status: s, count: counts[s] }));
