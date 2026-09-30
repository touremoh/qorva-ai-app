import { describe, expect, it } from 'vitest';
import { isActive, isWorking, RUN_STATUS, stepLine, toWireMentions, upsertConversation, failureMessage } from './agentRun.js';

const t = (key, opts = {}) => {
	const known = {
		'agent.step.search_cvs': `Searched the library ({{count}})`.replace('{{count}}', opts.count),
		'agent.step.generic': `Used ${opts.tool}`,
		'copilot.run.failed': 'Copilot could not finish',
		'error.agent.model_failed': 'AI unavailable',
	};
	return known[key] ?? opts.defaultValue ?? key;
};

describe('agentRun model', () => {
	it('knows which runs are still working and which are active', () => {
		expect(isWorking({ status: RUN_STATUS.RUNNING })).toBe(true);
		expect(isWorking({ status: RUN_STATUS.AWAITING_APPROVAL })).toBe(false);
		expect(isActive({ status: RUN_STATUS.AWAITING_APPROVAL })).toBe(true);
		expect(isActive({ status: RUN_STATUS.COMPLETED })).toBe(false);
		expect(isActive(null)).toBe(false);
	});

	it('maps composer mentions to the API shape and drops incomplete ones', () => {
		expect(toWireMentions([
			{ type: 'candidate', id: 'c1', name: 'Ana' },
			{ type: 'job', id: 'j1', name: 'Backend Lead' },
			{ type: 'candidate', name: 'no id' },
		])).toEqual([
			{ type: 'CV', id: 'c1', name: 'Ana' },
			{ type: 'JOB', id: 'j1', name: 'Backend Lead' },
		]);
	});

	it('renders a step from its summary key, and falls back to the tool name', () => {
		expect(stepLine(t, { tool: 'search_cvs', summaryKey: 'agent.step.search_cvs', summaryParams: { count: '12' } }))
			.toBe('Searched the library (12)');
		expect(stepLine(t, { tool: 'future_tool', summaryKey: 'agent.step.future_tool' })).toBe('Used future_tool');
	});

	it('translates the failure reason, with a generic fallback', () => {
		expect(failureMessage(t, { failureReason: 'error.agent.model_failed' })).toBe('AI unavailable');
		expect(failureMessage(t, { failureReason: 'error.agent.unknown' })).toBe('Copilot could not finish');
		expect(failureMessage(t, {})).toBe('Copilot could not finish');
	});

	it('moves the conversation of the latest run to the top', () => {
		const list = [{ conversationId: 'a', title: 'A' }, { conversationId: 'b', title: 'B' }];
		const next = upsertConversation(list, { conversationId: 'b', title: 'B', status: 'QUEUED', createdAt: 'now' });
		expect(next.map((c) => c.conversationId)).toEqual(['b', 'a']);
		expect(next[0].lastStatus).toBe('QUEUED');
	});
});

describe('approval helpers', () => {
	it('lists only the undecided cards', async () => {
		const { undecidedActions, isAwaitingApproval } = await import('./agentRun.js');
		const run = { status: 'AWAITING_APPROVAL', pendingActions: [{ actionId: 'a', status: 'PENDING' }, { actionId: 'b', status: 'APPROVED' }] };
		expect(isAwaitingApproval(run)).toBe(true);
		expect(undecidedActions(run).map((a) => a.actionId)).toEqual(['a']);
		expect(undecidedActions(null)).toEqual([]);
	});

	it('sends only the email fields the user changed', async () => {
		const { emailEdits } = await import('./agentRun.js');
		const preview = { subject: 'Hi', body: 'Hello' };
		expect(emailEdits(preview, 'Hi', 'Hello')).toEqual({});
		expect(emailEdits(preview, 'Hi', 'Hello, edited')).toEqual({ body: 'Hello, edited' });
		expect(emailEdits(preview, undefined, undefined)).toEqual({});
	});
});
