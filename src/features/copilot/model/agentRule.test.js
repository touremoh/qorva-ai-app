import { describe, expect, it } from 'vitest';
import { emptyRule, ruleToForm, STALE_REASONS, toRuleRequest, TRIGGER, triggerSummary, validateRule } from './agentRule.js';

const t = (key, params) => (params ? `${key} ${JSON.stringify(params)}` : key);

const form = (overrides = {}, trigger = {}) => {
	const base = emptyRule();
	return { ...base, name: 'Invite', goalTemplate: 'Draft for {{candidates}}', ...overrides, trigger: { ...base.trigger, ...trigger } };
};

describe('validateRule', () => {
	it('accepts a complete rule', () => {
		expect(validateRule(form())).toEqual({});
	});

	it('requires a name, a goal and a cap between 1 and 100', () => {
		expect(Object.keys(validateRule(form({ name: ' ', goalTemplate: '', dailyRunCap: 0 })))).toEqual(['name', 'goalTemplate', 'dailyRunCap']);
		expect(validateRule(form({ dailyRunCap: 101 })).dailyRunCap).toBeDefined();
	});

	it('checks the score and the schedule', () => {
		expect(validateRule(form({}, { minScore: 120 })).minScore).toBeDefined();
		expect(validateRule(form({}, { minScore: '' })).minScore).toBeUndefined();
		expect(validateRule(form({}, { type: TRIGGER.SCHEDULE, hour: 24 })).hour).toBeDefined();
		expect(validateRule(form({}, { type: TRIGGER.SCHEDULE, frequency: 'WEEKLY', weekday: 0 })).weekday).toBeDefined();
	});
});

describe('toRuleRequest', () => {
	it('sends only the fields of the chosen trigger', () => {
		expect(toRuleRequest(form({}, { jobPostId: 'j1', minScore: 75 })).trigger)
			.toEqual({ type: 'CV_SCORED', jobPostId: 'j1', minScore: 75, recommendedOnly: true });
		expect(toRuleRequest(form({}, { type: TRIGGER.SCHEDULE, frequency: 'DAILY', hour: '8', zoneId: 'Europe/Paris' })).trigger)
			.toEqual({ type: 'SCHEDULE', frequency: 'DAILY', hour: 8, zoneId: 'Europe/Paris' });
		expect(toRuleRequest(form({}, { type: TRIGGER.ATS_SYNC_FINISHED, connectionId: '' })).trigger).toEqual({ type: 'ATS_SYNC_FINISHED' });
	});

	it('trims the name and goal', () => {
		const request = toRuleRequest(form({ name: '  Tag  ', goalTemplate: ' Tag them ' }, { type: TRIGGER.CV_ADDED }));
		expect(request).toMatchObject({ name: 'Tag', goalTemplate: 'Tag them', trigger: { type: 'CV_ADDED', source: 'ANY' } });
	});
});

describe('ruleToForm', () => {
	it('round-trips a rule from the API', () => {
		const rule = { name: 'n', goalTemplate: 'g', dailyRunCap: 5, trigger: { type: 'SCHEDULE', frequency: 'WEEKLY', hour: 8, weekday: 3, zoneId: 'UTC' } };
		expect(toRuleRequest(ruleToForm(rule))).toEqual({ name: 'n', goalTemplate: 'g', dailyRunCap: 5,
			trigger: { type: 'SCHEDULE', frequency: 'WEEKLY', hour: 8, weekday: 3, zoneId: 'UTC' } });
	});
});

describe('triggerSummary', () => {
	it('describes each trigger', () => {
		expect(triggerSummary(t, { type: 'CV_SCORED', jobTitle: 'Java', minScore: 70, recommendedOnly: true }))
			.toBe('copilot.rules.summary.cvScored {"job":"Java"} · copilot.rules.summary.minScore {"score":70} · copilot.rules.summary.recommended');
		expect(triggerSummary(t, { type: 'SCHEDULE', frequency: 'DAILY', hour: 8, zoneId: 'UTC' }))
			.toBe('copilot.rules.summary.daily {"time":"08:00","zone":"UTC"}');
		expect(triggerSummary(t, { type: 'CV_ADDED', source: 'ATS' })).toBe('copilot.rules.summary.cvAdded.ATS');
	});
});

describe('a rule on jobs that need matching', () => {
	const jobRule = (trigger = {}, overrides = {}) => form(overrides, { type: TRIGGER.JOB_NEEDS_MATCHING, ...trigger });

	it('watches every reason by default, and sends that as no reason at all', () => {
		expect(emptyRule().trigger.staleReasons).toEqual(STALE_REASONS);
		expect(toRuleRequest(jobRule()).trigger).toEqual({ type: 'JOB_NEEDS_MATCHING' });
	});

	it('sends the chosen reasons and job, and needs at least one reason', () => {
		expect(toRuleRequest(jobRule({ jobPostId: 'j1', staleReasons: ['JOB_CHANGED'] })).trigger)
			.toEqual({ type: 'JOB_NEEDS_MATCHING', jobPostId: 'j1', staleReasons: ['JOB_CHANGED'] });
		expect(validateRule(jobRule({ staleReasons: [] })).staleReasons).toBeDefined();
	});

	it('sends the matching pre-approval only when it is on, within 1–500 actions', () => {
		expect(toRuleRequest(jobRule()).autoApproveMatching).toBeUndefined();
		expect(toRuleRequest(jobRule({}, { autoApproveMatching: true, autoApproveMaxActions: '30' })))
			.toMatchObject({ autoApproveMatching: true, autoApproveMaxActions: 30 });
		expect(validateRule(jobRule({}, { autoApproveMatching: true, autoApproveMaxActions: 501 })).autoApproveMaxActions).toBeDefined();
	});

	it('reads a rule watching every reason back with all of them ticked', () => {
		const form = ruleToForm({ name: 'n', goalTemplate: 'g', autoApproveMatching: true, autoApproveMaxActions: 20,
			trigger: { type: 'JOB_NEEDS_MATCHING', staleReasons: null } });
		expect(form.trigger.staleReasons).toEqual(STALE_REASONS);
		expect(form).toMatchObject({ autoApproveMatching: true, autoApproveMaxActions: 20 });
	});

	it('is summed up with its job and, when not all, its reasons', () => {
		expect(triggerSummary(t, { type: 'JOB_NEEDS_MATCHING', jobTitle: 'Java' }))
			.toBe('copilot.rules.summary.jobNeedsMatching {"job":"Java"}');
		expect(triggerSummary(t, { type: 'JOB_NEEDS_MATCHING', staleReasons: ['JOB_CHANGED'] }))
			.toBe('copilot.rules.summary.jobNeedsMatching {"job":"copilot.rules.anyJob"} · copilot.rules.staleReasons.JOB_CHANGED');
	});
});
