/** Copilot standing rules: the four triggers and what a rule form may send. Mirrors AgentRuleService's checks. */
export const TRIGGER = Object.freeze({
	CV_ADDED: 'CV_ADDED',
	CV_SCORED: 'CV_SCORED',
	SCHEDULE: 'SCHEDULE',
	ATS_SYNC_FINISHED: 'ATS_SYNC_FINISHED',
});

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
	trigger: {
		type: TRIGGER.CV_SCORED,
		source: 'ANY',
		jobPostId: '',
		minScore: 70,
		recommendedOnly: true,
		frequency: 'DAILY',
		hour: 9,
		weekday: 1,
		zoneId: browserTimeZone(),
		connectionId: '',
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
		trigger: {
			...base.trigger,
			type: t.type ?? base.trigger.type,
			source: t.source ?? 'ANY',
			jobPostId: t.jobPostId ?? '',
			minScore: t.minScore ?? (t.type === TRIGGER.CV_SCORED ? null : base.trigger.minScore),
			recommendedOnly: !!t.recommendedOnly,
			frequency: t.frequency ?? 'DAILY',
			hour: t.hour ?? base.trigger.hour,
			weekday: t.weekday ?? 1,
			zoneId: t.zoneId ?? base.trigger.zoneId,
			connectionId: t.connectionId ?? '',
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
	if (t.type === TRIGGER.CV_SCORED && t.minScore != null && t.minScore !== '' && !isInt(Number(t.minScore), 0, 100)) {
		errors.minScore = 'copilot.rules.errors.score';
	}
	if (t.type === TRIGGER.SCHEDULE) {
		if (!isInt(Number(t.hour), 0, 23)) errors.hour = 'copilot.rules.errors.hour';
		if (t.frequency === 'WEEKLY' && !isInt(Number(t.weekday), 1, 7)) errors.weekday = 'copilot.rules.errors.weekday';
	}
	return errors;
};

/** The form → the API's RuleRequest: only the fields the chosen trigger uses. */
export const toRuleRequest = (form) => {
	const t = form.trigger;
	const trigger = { type: t.type };
	if (t.type === TRIGGER.CV_ADDED) trigger.source = t.source || 'ANY';
	if (t.type === TRIGGER.CV_SCORED) {
		if (t.jobPostId) trigger.jobPostId = t.jobPostId;
		if (t.minScore != null && t.minScore !== '') trigger.minScore = Number(t.minScore);
		if (t.recommendedOnly) trigger.recommendedOnly = true;
	}
	if (t.type === TRIGGER.SCHEDULE) {
		trigger.frequency = t.frequency;
		trigger.hour = Number(t.hour);
		if (t.frequency === 'WEEKLY') trigger.weekday = Number(t.weekday);
		trigger.zoneId = t.zoneId || browserTimeZone();
	}
	if (t.type === TRIGGER.ATS_SYNC_FINISHED && t.connectionId) trigger.connectionId = t.connectionId;
	return {
		name: form.name.trim(),
		goalTemplate: form.goalTemplate.trim(),
		dailyRunCap: Number(form.dailyRunCap),
		trigger,
	};
};

const two = (n) => String(n).padStart(2, '0');

/** One line saying what the rule watches, e.g. "Candidates scored 70+ on Java Developer, recommended for interview". */
export const triggerSummary = (t, trigger) => {
	if (!trigger) return '';
	switch (trigger.type) {
		case TRIGGER.CV_ADDED:
			return t(`copilot.rules.summary.cvAdded.${trigger.source || 'ANY'}`);
		case TRIGGER.CV_SCORED: {
			const parts = [t('copilot.rules.summary.cvScored', { job: trigger.jobTitle || t('copilot.rules.anyJob') })];
			if (trigger.minScore != null) parts.push(t('copilot.rules.summary.minScore', { score: trigger.minScore }));
			if (trigger.recommendedOnly) parts.push(t('copilot.rules.summary.recommended'));
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
		default:
			return trigger.type;
	}
};
