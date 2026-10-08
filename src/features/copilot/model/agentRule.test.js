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
			.toEqual({ type: 'CV_SCORED', jobPostId: 'j1', minScore: 75, recommendations: ['strong_interview', 'interview'] });
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

	describe('a status rule', () => {
		const statusRule = (trigger = {}) => form({}, { type: TRIGGER.REPORT_STATUS_CHANGED, ...trigger });

		it('watches every status unless some are unticked, and needs at least one', () => {
			expect(toRuleRequest(statusRule()).trigger).toEqual({ type: 'REPORT_STATUS_CHANGED' });
			expect(toRuleRequest(statusRule({ jobPostId: 'j1', toStatuses: ['INTERVIEWING', 'SHORTLISTED'] })).trigger)
				.toEqual({ type: 'REPORT_STATUS_CHANGED', jobPostId: 'j1', toStatuses: ['SHORTLISTED', 'INTERVIEWING'] });
			expect(validateRule(statusRule({ toStatuses: [] })).toStatuses).toBe('copilot.rules.errors.toStatuses');
		});

		it('reads back a stored rule and summarises it', () => {
			expect(ruleToForm({ trigger: { type: 'REPORT_STATUS_CHANGED', toStatuses: null } }).trigger.toStatuses).toHaveLength(8);
			const t = (key, opts) => (opts ? `${key}:${JSON.stringify(opts)}` : key);
			expect(triggerSummary(t, { type: 'REPORT_STATUS_CHANGED', toStatuses: ['HIRED'] }))
				.toBe('copilot.rules.summary.statusChanged:{"job":"copilot.rules.anyJob"} · reportStatus.values.HIRED');
		});
	});
});

describe('new triggers (2026-10-08)', () => {
	it('filters scored candidates by verdict and score range', () => {
		const request = toRuleRequest(form({}, { minScore: '', maxScore: 40, recommendations: ['reject'] }));
		expect(request.trigger).toEqual({ type: 'CV_SCORED', maxScore: 40, recommendations: ['reject'] });
		// Every verdict ticked, or none: any verdict.
		expect(toRuleRequest(form({}, { recommendations: [] })).trigger.recommendations).toBeUndefined();
		expect(toRuleRequest(form({}, { recommendations: ['reject', 'may_be', 'interview', 'strong_interview'] })).trigger.recommendations).toBeUndefined();
		expect(validateRule(form({}, { minScore: 60, maxScore: 50 })).maxScore).toBeDefined();
		expect(validateRule(form({}, { minScore: 40, maxScore: 60 })).maxScore).toBeUndefined();
	});

	it('reads an older "recommended for interview" rule as the interview verdicts', () => {
		const loaded = ruleToForm({ name: 'n', goalTemplate: 'g', trigger: { type: 'CV_SCORED', recommendedOnly: true } });
		expect(loaded.trigger.recommendations).toEqual(['strong_interview', 'interview']);
		expect(ruleToForm({ name: 'n', goalTemplate: 'g', trigger: { type: 'CV_SCORED' } }).trigger.recommendations).toEqual([]);
	});

	it('sends an idle rule with the statuses it watches and its days', () => {
		const idle = form({}, { type: TRIGGER.REPORT_STATUS_IDLE, idleStatuses: ['CONTACTED'], idleDays: '7', jobPostId: 'j1' });
		expect(toRuleRequest(idle).trigger).toEqual({ type: 'REPORT_STATUS_IDLE', jobPostId: 'j1', toStatuses: ['CONTACTED'], idleDays: 7 });
		expect(validateRule(form({}, { type: TRIGGER.REPORT_STATUS_IDLE, idleStatuses: [] })).idleStatuses).toBeDefined();
		expect(validateRule(form({}, { type: TRIGGER.REPORT_STATUS_IDLE, idleDays: 91 })).idleDays).toBeDefined();
		const loaded = ruleToForm({ name: 'n', goalTemplate: 'g', trigger: { type: 'REPORT_STATUS_IDLE', toStatuses: ['NEW'], idleDays: 3 } });
		expect(loaded.trigger.idleStatuses).toEqual(['NEW']);
		expect(loaded.trigger.toStatuses.length).toBeGreaterThan(1);
	});

	it('sends the other new triggers with only their own fields', () => {
		expect(toRuleRequest(form({}, { type: TRIGGER.CV_OUTDATED, staleMonths: 12, source: 'ATS' })).trigger)
			.toEqual({ type: 'CV_OUTDATED', source: 'ATS', staleMonths: 12 });
		expect(validateRule(form({}, { type: TRIGGER.CV_OUTDATED, staleMonths: 7 })).staleMonths).toBeDefined();
		expect(toRuleRequest(form({}, { type: TRIGGER.JOB_CLOSED, jobPostId: '' })).trigger).toEqual({ type: 'JOB_CLOSED' });
		expect(toRuleRequest(form({}, { type: TRIGGER.DUPLICATE_FOUND })).trigger).toEqual({ type: 'DUPLICATE_FOUND', source: 'ANY' });
		expect(toRuleRequest(form({}, { type: TRIGGER.CANDIDATE_PROFILE_UPDATED })).trigger).toEqual({ type: 'CANDIDATE_PROFILE_UPDATED' });
	});

	it('sends the profile-update pre-approval and checks its cap', () => {
		const request = toRuleRequest(form({ autoApproveProfileUpdates: true, autoApproveProfileUpdatesMax: '5' }));
		expect(request).toMatchObject({ autoApproveProfileUpdates: true, autoApproveProfileUpdatesMax: 5 });
		expect(validateRule(form({ autoApproveProfileUpdates: true, autoApproveProfileUpdatesMax: 26 })).autoApproveProfileUpdatesMax).toBeDefined();
		expect(toRuleRequest(form()).autoApproveProfileUpdates).toBeUndefined();
	});

	it('describes the new triggers', () => {
		expect(triggerSummary(t, { type: 'CV_SCORED', jobTitle: 'Java', minScore: 40, maxScore: 60, recommendations: ['reject'] }))
			.toBe('copilot.rules.summary.cvScored {"job":"Java"} · copilot.rules.summary.scoreRange {"min":40,"max":60} · '
				+ 'copilot.rules.summary.verdicts {"list":"appCVMatching.recommendation.reject"}');
		expect(triggerSummary(t, { type: 'REPORT_STATUS_IDLE', idleDays: 7, toStatuses: ['CONTACTED'] }))
			.toBe('copilot.rules.summary.idle {"days":7,"statuses":"reportStatus.values.CONTACTED","job":"copilot.rules.anyJob"}');
		expect(triggerSummary(t, { type: 'CV_OUTDATED', staleMonths: 18, source: 'ATS' }))
			.toBe('copilot.rules.summary.outdated {"months":18} · copilot.rules.sources.ATS');
		expect(triggerSummary(t, { type: 'JOB_CLOSED', jobTitle: 'Java' })).toBe('copilot.rules.summary.jobClosed {"job":"Java"}');
		expect(triggerSummary(t, { type: 'DUPLICATE_FOUND', source: 'ANY' })).toBe('copilot.rules.summary.duplicate');
		expect(triggerSummary(t, { type: 'CANDIDATE_PROFILE_UPDATED' })).toBe('copilot.rules.summary.profileUpdated');
	});
});
