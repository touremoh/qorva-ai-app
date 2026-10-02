import { describe, expect, it } from 'vitest';
import { emptyRule, ruleToForm, toRuleRequest, TRIGGER, triggerSummary, validateRule } from './agentRule.js';

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
