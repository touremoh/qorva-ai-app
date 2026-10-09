import { REPORT_STATUSES } from '../../reports/model/reportStatus.js';

/** Copilot standing rules: the triggers and what a rule form may send. Mirrors AgentRuleService's checks. */
export const TRIGGER = Object.freeze({
	CV_ADDED: 'CV_ADDED',
	CV_SCORED: 'CV_SCORED',
	SCHEDULE: 'SCHEDULE',
	ATS_SYNC_FINISHED: 'ATS_SYNC_FINISHED',
	JOB_NEEDS_MATCHING: 'JOB_NEEDS_MATCHING',
	REPORT_STATUS_CHANGED: 'REPORT_STATUS_CHANGED',
	REPORT_STATUS_IDLE: 'REPORT_STATUS_IDLE',
	CV_OUTDATED: 'CV_OUTDATED',
	JOB_CLOSED: 'JOB_CLOSED',
	DUPLICATE_FOUND: 'DUPLICATE_FOUND',
	CANDIDATE_PROFILE_UPDATED: 'CANDIDATE_PROFILE_UPDATED',
});

/** Triggers that may watch one job (a job picker in the form). */
export const JOB_TRIGGERS = [TRIGGER.CV_SCORED, TRIGGER.JOB_NEEDS_MATCHING, TRIGGER.REPORT_STATUS_CHANGED,
	TRIGGER.REPORT_STATUS_IDLE, TRIGGER.JOB_CLOSED];

/** Triggers on new or ageing CVs that may be limited to uploaded or imported ones. */
export const SOURCE_TRIGGERS = [TRIGGER.CV_ADDED, TRIGGER.CV_OUTDATED, TRIGGER.DUPLICATE_FOUND];

/** Report verdicts a CV_SCORED rule may watch (none ticked = any). */
export const RECOMMENDATIONS = ['strong_interview', 'interview', 'may_be', 'reject'];
const INTERVIEW = ['strong_interview', 'interview'];

/** CV_OUTDATED: the content ages it may watch, in months (18 = Data Health's "Outdated"). */
export const STALE_MONTHS = [6, 12, 18, 24];
export const MAX_IDLE_DAYS = 90;

/** The statuses a REPORT_STATUS_CHANGED rule may watch (all of them = any change). */
export const RULE_STATUSES = REPORT_STATUSES;

/** Why a job needs matching (the job's matchingStaleReason); a JOB_NEEDS_MATCHING rule watches some or all. */
export const STALE_REASONS = ['NEVER_RUN', 'JOB_CHANGED', 'NEW_CANDIDATES', 'CANDIDATE_CHANGED'];

/** Pre-approved matching: most actions one matching may cost without asking (server: 1–500, default 50). */
export const DEFAULT_AUTO_APPROVE_ACTIONS = 50;
export const MAX_AUTO_APPROVE_ACTIONS = 500;
/** Pre-approved profile-update requests: most candidates one request may cover without asking (server: 1–25, default 10). */
export const DEFAULT_AUTO_APPROVE_PROFILE_UPDATES = 10;
export const MAX_AUTO_APPROVE_PROFILE_UPDATES = 25;

export const TRIGGERS = Object.values(TRIGGER);

export const RULE_STATUS = Object.freeze({ ACTIVE: 'ACTIVE', PAUSED: 'PAUSED' });

export const MAX_RULE_NAME = 100;
export const MAX_RULE_GOAL = 2000;
export const DEFAULT_DAILY_CAP = 20;
export const MAX_DAILY_CAP = 100;

/** Placeholders the goal may use; filled in by the server when the rule fires. */
export const PLACEHOLDERS = ['{{candidates}}', '{{job}}', '{{count}}', '{{sync}}'];

/** IANA zone of this browser (e.g. Europe/Paris); UTC when the browser won't say. */
export const browserTimeZone = () => {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
	} catch {
		return 'UTC';
	}
};

export const emptyRule = () => ({
	name: '',
	goalTemplate: '',
	dailyRunCap: DEFAULT_DAILY_CAP,
	autoApproveMatching: false,
	autoApproveMaxActions: DEFAULT_AUTO_APPROVE_ACTIONS,
	autoApproveProfileUpdates: false,
	autoApproveProfileUpdatesMax: DEFAULT_AUTO_APPROVE_PROFILE_UPDATES,
	trigger: {
		type: TRIGGER.CV_SCORED,
		source: 'ANY',
		jobPostId: '',
		minScore: 70,
		maxScore: null,
		recommendations: [...INTERVIEW],
		frequency: 'DAILY',
		hour: 9,
		weekday: 1,
		zoneId: browserTimeZone(),
		connectionId: '',
		staleReasons: [...STALE_REASONS],
		toStatuses: [...RULE_STATUSES],
		// REPORT_STATUS_IDLE watches named statuses only; its own list so switching triggers never sweeps them all.
		idleStatuses: ['CONTACTED'],
		idleDays: 7,
		staleMonths: 18,
	},
});

/** A rule from the API → the form's shape (missing trigger fields get their defaults). */
export const ruleToForm = (rule) => {
	const base = emptyRule();
	if (!rule) return base;
	const t = rule.trigger ?? {};
	return {
		name: rule.name ?? '',
		goalTemplate: rule.goalTemplate ?? '',
		dailyRunCap: rule.dailyRunCap ?? DEFAULT_DAILY_CAP,
		autoApproveMatching: !!rule.autoApproveMatching,
		autoApproveMaxActions: rule.autoApproveMaxActions ?? DEFAULT_AUTO_APPROVE_ACTIONS,
		autoApproveProfileUpdates: !!rule.autoApproveProfileUpdates,
		autoApproveProfileUpdatesMax: rule.autoApproveProfileUpdatesMax ?? DEFAULT_AUTO_APPROVE_PROFILE_UPDATES,
		trigger: {
			...base.trigger,
			type: t.type ?? base.trigger.type,
			source: t.source ?? 'ANY',
			jobPostId: t.jobPostId ?? '',
			minScore: t.minScore ?? (t.type === TRIGGER.CV_SCORED ? null : base.trigger.minScore),
			maxScore: t.maxScore ?? null,
			// Verdicts, or the older "recommended for interview" flag; none = any verdict.
			recommendations: t.recommendations?.length ? [...t.recommendations]
				: t.recommendedOnly ? [...INTERVIEW] : (t.type === TRIGGER.CV_SCORED ? [] : base.trigger.recommendations),
			frequency: t.frequency ?? 'DAILY',
			hour: t.hour ?? base.trigger.hour,
			weekday: t.weekday ?? 1,
			zoneId: t.zoneId ?? base.trigger.zoneId,
			connectionId: t.connectionId ?? '',
			// Stored as null when the rule watches every reason.
			staleReasons: t.staleReasons?.length ? [...t.staleReasons] : [...STALE_REASONS],
			// Stored as null when the rule watches every status.
			toStatuses: t.type !== TRIGGER.REPORT_STATUS_IDLE && t.toStatuses?.length ? [...t.toStatuses] : [...RULE_STATUSES],
			idleStatuses: t.type === TRIGGER.REPORT_STATUS_IDLE && t.toStatuses?.length ? [...t.toStatuses] : base.trigger.idleStatuses,
			idleDays: t.idleDays ?? base.trigger.idleDays,
			staleMonths: t.staleMonths ?? base.trigger.staleMonths,
		},
	};
};

const isInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;

/** Field → i18n error key; empty when the form can be sent. */
export const validateRule = (form) => {
	const errors = {};
	const name = form?.name?.trim() ?? '';
	const goal = form?.goalTemplate?.trim() ?? '';
	if (!name || name.length > MAX_RULE_NAME) errors.name = 'copilot.rules.errors.name';
	if (!goal || goal.length > MAX_RULE_GOAL) errors.goalTemplate = 'copilot.rules.errors.goal';
	if (!isInt(Number(form?.dailyRunCap), 1, MAX_DAILY_CAP)) errors.dailyRunCap = 'copilot.rules.errors.cap';
	const t = form?.trigger ?? {};
	if (!TRIGGERS.includes(t.type)) errors.trigger = 'copilot.rules.errors.trigger';
	const hasMin = t.minScore != null && t.minScore !== '';
	const hasMax = t.maxScore != null && t.maxScore !== '';
	if (t.type === TRIGGER.CV_SCORED && hasMin && !isInt(Number(t.minScore), 0, 100)) {
		errors.minScore = 'copilot.rules.errors.score';
	}
	if (t.type === TRIGGER.CV_SCORED && hasMax
		&& (!isInt(Number(t.maxScore), 0, 100) || (hasMin && Number(t.maxScore) < Number(t.minScore)))) {
		errors.maxScore = 'copilot.rules.errors.maxScore';
	}
	if (t.type === TRIGGER.REPORT_STATUS_IDLE) {
		if (!(t.idleStatuses?.length > 0)) errors.idleStatuses = 'copilot.rules.errors.idleStatuses';
		if (!isInt(Number(t.idleDays), 1, MAX_IDLE_DAYS)) errors.idleDays = 'copilot.rules.errors.idleDays';
	}
	if (t.type === TRIGGER.CV_OUTDATED && !STALE_MONTHS.includes(Number(t.staleMonths))) errors.staleMonths = 'copilot.rules.errors.staleMonths';
	if (t.type === TRIGGER.SCHEDULE) {
		if (!isInt(Number(t.hour), 0, 23)) errors.hour = 'copilot.rules.errors.hour';
		if (t.frequency === 'WEEKLY' && !isInt(Number(t.weekday), 1, 7)) errors.weekday = 'copilot.rules.errors.weekday';
	}
	if (t.type === TRIGGER.JOB_NEEDS_MATCHING && !(t.staleReasons?.length > 0)) errors.staleReasons = 'copilot.rules.errors.staleReasons';
	if (t.type === TRIGGER.REPORT_STATUS_CHANGED && !(t.toStatuses?.length > 0)) errors.toStatuses = 'copilot.rules.errors.toStatuses';
	if (form?.autoApproveMatching && !isInt(Number(form.autoApproveMaxActions), 1, MAX_AUTO_APPROVE_ACTIONS)) {
		errors.autoApproveMaxActions = 'copilot.rules.errors.autoApproveMax';
	}
	if (form?.autoApproveProfileUpdates && !isInt(Number(form.autoApproveProfileUpdatesMax), 1, MAX_AUTO_APPROVE_PROFILE_UPDATES)) {
		errors.autoApproveProfileUpdatesMax = 'copilot.rules.errors.autoApproveProfileUpdatesMax';
	}
	return errors;
};

/** The form → the API's RuleRequest: only the fields the chosen trigger uses. */
export const toRuleRequest = (form) => {
	const t = form.trigger;
	const trigger = { type: t.type };
	if (SOURCE_TRIGGERS.includes(t.type)) trigger.source = t.source || 'ANY';
	if (JOB_TRIGGERS.includes(t.type) && t.jobPostId) trigger.jobPostId = t.jobPostId;
	if (t.type === TRIGGER.CV_SCORED) {
		if (t.minScore != null && t.minScore !== '') trigger.minScore = Number(t.minScore);
		if (t.maxScore != null && t.maxScore !== '') trigger.maxScore = Number(t.maxScore);
		// None or every verdict ticked = any verdict: nothing sent.
		const verdicts = RECOMMENDATIONS.filter((r) => t.recommendations?.includes(r));
		if (verdicts.length && verdicts.length < RECOMMENDATIONS.length) trigger.recommendations = verdicts;
	}
	if (t.type === TRIGGER.REPORT_STATUS_IDLE) {
		trigger.toStatuses = RULE_STATUSES.filter((s) => t.idleStatuses?.includes(s));
		trigger.idleDays = Number(t.idleDays);
	}
	if (t.type === TRIGGER.CV_OUTDATED) trigger.staleMonths = Number(t.staleMonths);
	if (t.type === TRIGGER.SCHEDULE) {
		trigger.frequency = t.frequency;
		trigger.hour = Number(t.hour);
		if (t.frequency === 'WEEKLY') trigger.weekday = Number(t.weekday);
		trigger.zoneId = t.zoneId || browserTimeZone();
	}
	if (t.type === TRIGGER.ATS_SYNC_FINISHED && t.connectionId) trigger.connectionId = t.connectionId;
	if (t.type === TRIGGER.JOB_NEEDS_MATCHING) {
		// Every reason ticked is sent as none: "all of them", including reasons added later.
		const reasons = STALE_REASONS.filter((r) => t.staleReasons?.includes(r));
		if (reasons.length < STALE_REASONS.length) trigger.staleReasons = reasons;
	}
	if (t.type === TRIGGER.REPORT_STATUS_CHANGED) {
		const statuses = RULE_STATUSES.filter((s) => t.toStatuses?.includes(s));
		if (statuses.length < RULE_STATUSES.length) trigger.toStatuses = statuses;
	}
	const request = {
		name: form.name.trim(),
		goalTemplate: form.goalTemplate.trim(),
		dailyRunCap: Number(form.dailyRunCap),
		trigger,
	};
	if (form.autoApproveMatching) {
		request.autoApproveMatching = true;
		request.autoApproveMaxActions = Number(form.autoApproveMaxActions);
	}
	if (form.autoApproveProfileUpdates) {
		request.autoApproveProfileUpdates = true;
		request.autoApproveProfileUpdatesMax = Number(form.autoApproveProfileUpdatesMax);
	}
	return request;
};

const two = (n) => String(n).padStart(2, '0');

/** "… · Uploaded only" when the rule is limited to one source. */
const withSource = (t, head, source) => (source && source !== 'ANY' ? `${head} · ${t(`copilot.rules.sources.${source}`)}` : head);

/** One line saying what the rule watches, e.g. "Candidates scored 70+ on Java Developer, recommended for interview". */
export const triggerSummary = (t, trigger) => {
	if (!trigger) return '';
	switch (trigger.type) {
		case TRIGGER.CV_ADDED:
			return t(`copilot.rules.summary.cvAdded.${trigger.source || 'ANY'}`);
		case TRIGGER.CV_SCORED: {
			const parts = [t('copilot.rules.summary.cvScored', { job: trigger.jobTitle || t('copilot.rules.anyJob') })];
			if (trigger.minScore != null && trigger.maxScore != null) {
				parts.push(t('copilot.rules.summary.scoreRange', { min: trigger.minScore, max: trigger.maxScore }));
			} else if (trigger.minScore != null) {
				parts.push(t('copilot.rules.summary.minScore', { score: trigger.minScore }));
			} else if (trigger.maxScore != null) {
				parts.push(t('copilot.rules.summary.maxScore', { score: trigger.maxScore }));
			}
			if (trigger.recommendations?.length) {
				parts.push(t('copilot.rules.summary.verdicts', {
					list: trigger.recommendations.map((r) => t(`appCVMatching.recommendation.${r}`)).join(', '),
				}));
			} else if (trigger.recommendedOnly) {
				parts.push(t('copilot.rules.summary.recommended'));
			}
			return parts.join(' · ');
		}
		case TRIGGER.SCHEDULE: {
			const time = `${two(trigger.hour ?? 0)}:00`;
			return trigger.frequency === 'WEEKLY'
				? t('copilot.rules.summary.weekly', { day: t(`copilot.rules.weekdays.${trigger.weekday}`), time, zone: trigger.zoneId })
				: t('copilot.rules.summary.daily', { time, zone: trigger.zoneId });
		}
		case TRIGGER.ATS_SYNC_FINISHED:
			return t('copilot.rules.summary.atsSync', { name: trigger.connectionName || t('copilot.rules.anyConnection') });
		case TRIGGER.JOB_NEEDS_MATCHING: {
			const head = t('copilot.rules.summary.jobNeedsMatching', { job: trigger.jobTitle || t('copilot.rules.anyJob') });
			const reasons = trigger.staleReasons?.length && trigger.staleReasons.length < STALE_REASONS.length
				? trigger.staleReasons.map((r) => t(`copilot.rules.staleReasons.${r}`)).join(', ') : null;
			return reasons ? `${head} · ${reasons}` : head;
		}
		case TRIGGER.REPORT_STATUS_CHANGED: {
			const head = t('copilot.rules.summary.statusChanged', { job: trigger.jobTitle || t('copilot.rules.anyJob') });
			const statuses = trigger.toStatuses?.length && trigger.toStatuses.length < RULE_STATUSES.length
				? trigger.toStatuses.map((s) => t(`reportStatus.values.${s}`)).join(', ') : null;
			return statuses ? `${head} · ${statuses}` : head;
		}
		case TRIGGER.REPORT_STATUS_IDLE:
			return t('copilot.rules.summary.idle', {
				days: trigger.idleDays,
				statuses: (trigger.toStatuses ?? []).map((s) => t(`reportStatus.values.${s}`)).join(', '),
				job: trigger.jobTitle || t('copilot.rules.anyJob'),
			});
		case TRIGGER.CV_OUTDATED:
			return withSource(t, t('copilot.rules.summary.outdated', { months: trigger.staleMonths }), trigger.source);
		case TRIGGER.JOB_CLOSED:
			return t('copilot.rules.summary.jobClosed', { job: trigger.jobTitle || t('copilot.rules.anyJob') });
		case TRIGGER.DUPLICATE_FOUND:
			return withSource(t, t('copilot.rules.summary.duplicate'), trigger.source);
		case TRIGGER.CANDIDATE_PROFILE_UPDATED:
			return t('copilot.rules.summary.profileUpdated');
		default:
			return trigger.type;
	}
};
