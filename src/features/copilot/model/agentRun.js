import * as tokens from '../../../theme/tokens.js';

/** Copilot run lifecycle, as the API reports it. */
export const RUN_STATUS = Object.freeze({
	QUEUED: 'QUEUED',
	RUNNING: 'RUNNING',
	AWAITING_APPROVAL: 'AWAITING_APPROVAL',
	COMPLETED: 'COMPLETED',
	FAILED: 'FAILED',
	CANCELLED: 'CANCELLED',
	EXPIRED: 'EXPIRED',
});

/** While a run is in one of these, the app keeps polling it. */
export const WORKING_STATUSES = [RUN_STATUS.QUEUED, RUN_STATUS.RUNNING];

export const ACTIVE_STATUSES = [...WORKING_STATUSES, RUN_STATUS.AWAITING_APPROVAL];

export const isWorking = (run) => !!run && WORKING_STATUSES.includes(run.status);

export const isActive = (run) => !!run && ACTIVE_STATUSES.includes(run.status);

export const MAX_GOAL_LENGTH = 2000;

/** Colours of a status chip: every value comes from the theme. */
export const statusTone = (status) => {
	switch (status) {
		case RUN_STATUS.COMPLETED: return { color: tokens.status.success.text, bg: tokens.status.success.tint };
		case RUN_STATUS.FAILED: return { color: tokens.status.error.text, bg: tokens.status.error.tint };
		case RUN_STATUS.AWAITING_APPROVAL: return { color: tokens.status.warning.text, bg: tokens.status.warning.tint };
		case RUN_STATUS.QUEUED:
		case RUN_STATUS.RUNNING: return { color: tokens.status.info.text, bg: tokens.status.info.tint };
		default: return { color: tokens.ink.subtle, bg: tokens.surface.subtle };
	}
};

/** Composer mentions ({ type: 'candidate' | 'job', id, name }) → the API's { type: 'CV' | 'JOB', id, name }. */
export const toWireMentions = (mentions = []) => mentions
	.filter((m) => m?.id)
	.map((m) => ({ type: m.type === 'job' ? 'JOB' : 'CV', id: m.id, name: m.name }));

/** The user-facing line of a step; unknown keys fall back to the generic line with the tool name. */
export const stepLine = (t, step) => t(step?.summaryKey || 'agent.step.generic', {
	...(step?.summaryParams ?? {}),
	tool: step?.tool ?? '',
	defaultValue: t('agent.step.generic', { tool: step?.tool ?? '' }),
});

/** Error key → message; backend reasons are error.* keys translated like any API error. */
export const failureMessage = (t, run) => (run?.failureReason
	? t(run.failureReason, { defaultValue: t('copilot.run.failed') })
	: t('copilot.run.failed'));

/** Newest first in the list, one entry per conversation. */
export const upsertConversation = (conversations, run) => {
	const entry = { conversationId: run.conversationId, title: run.title, lastStatus: run.status, lastActivityAt: run.createdAt };
	return [entry, ...conversations.filter((c) => c.conversationId !== run.conversationId)];
};
