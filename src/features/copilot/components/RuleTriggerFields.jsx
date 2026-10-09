import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';
import { fieldSx } from './ruleFieldSx.js';
import {
	JOB_TRIGGERS, MAX_IDLE_DAYS, RECOMMENDATIONS, RULE_STATUSES, SOURCE_TRIGGERS, STALE_MONTHS, STALE_REASONS, TRIGGER,
} from '../model/agentRule.js';

const HOURS = Array.from({ length: 24 }, (_, h) => h);
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];
const small = (text) => <Typography sx={{ fontSize: tokens.fontSize.caption }}>{text}</Typography>;
const hint = (text) => <Typography sx={{ fontSize: tokens.fontSize.micro, color: tokens.ink.faintest }}>{text}</Typography>;

/** A labelled row of checkboxes over {@code options}; {@code selected} keeps the options' order. */
const CheckboxGroup = ({ label, options, selected, onChange, labelOf, error, testId }) => (
	<Box data-testid={testId}>
		<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.muted }}>{label}</Typography>
		<Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 1 }}>
			{options.map((o) => (
				<FormControlLabel key={o} label={small(labelOf(o))}
					control={<Checkbox size="small" checked={!!selected?.includes(o)}
						onChange={(e) => onChange(options.filter((x) => (x === o ? e.target.checked : selected?.includes(x))))} />} />
			))}
		</Box>
		{error && <Typography sx={{ fontSize: tokens.fontSize.micro, color: tokens.status.error.text }}>{error}</Typography>}
	</Box>
);
CheckboxGroup.propTypes = {
	label: PropTypes.string.isRequired, options: PropTypes.array.isRequired, selected: PropTypes.array, onChange: PropTypes.func.isRequired,
	labelOf: PropTypes.func.isRequired, error: PropTypes.string, testId: PropTypes.string,
};

/** The fields of the chosen trigger: job, source, scores and verdicts, schedule, statuses, days, age, connection. */
const RuleTriggerFields = ({ trigger: tr, setTrigger, jobs, connections, show }) => {
	const { t } = useTranslation();
	const number = (field) => (e) => setTrigger(field, e.target.value === '' ? null : Number(e.target.value));
	return (
		<>
			{JOB_TRIGGERS.includes(tr.type) && (
				<TextField select size="small" label={t('copilot.rules.dialog.job')} value={tr.jobPostId} onChange={(e) => setTrigger('jobPostId', e.target.value)} sx={fieldSx}
					SelectProps={{ SelectDisplayProps: { 'data-testid': 'copilot-rule-job' } }}>
					<MenuItem value="">{t('copilot.rules.anyJob')}</MenuItem>
					{jobs.map((j) => <MenuItem key={j.id} value={j.id}>{j.title}</MenuItem>)}
				</TextField>
			)}

			{SOURCE_TRIGGERS.includes(tr.type) && (
				<TextField select size="small" label={t('copilot.rules.dialog.source')} value={tr.source} onChange={(e) => setTrigger('source', e.target.value)} sx={fieldSx}>
					{['ANY', 'MANUAL', 'ATS'].map((s) => <MenuItem key={s} value={s}>{t(`copilot.rules.sources.${s}`)}</MenuItem>)}
				</TextField>
			)}

			{tr.type === TRIGGER.CV_SCORED && (
				<>
					<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
						<TextField size="small" type="number" label={t('copilot.rules.dialog.minScore')} value={tr.minScore ?? ''} onChange={number('minScore')}
							error={!!show('minScore')} helperText={show('minScore') ?? t('copilot.rules.dialog.minScoreHelp')}
							inputProps={{ min: 0, max: 100, 'data-testid': 'copilot-rule-min-score' }} sx={{ ...fieldSx, width: 180 }} />
						<TextField size="small" type="number" label={t('copilot.rules.dialog.maxScore')} value={tr.maxScore ?? ''} onChange={number('maxScore')}
							error={!!show('maxScore')} helperText={show('maxScore') ?? t('copilot.rules.dialog.minScoreHelp')}
							inputProps={{ min: 0, max: 100, 'data-testid': 'copilot-rule-max-score' }} sx={{ ...fieldSx, width: 180 }} />
					</Box>
					<CheckboxGroup testId="copilot-rule-recommendations" label={t('copilot.rules.dialog.recommendations')} options={RECOMMENDATIONS}
						selected={tr.recommendations} onChange={(v) => setTrigger('recommendations', v)} labelOf={(r) => t(`appCVMatching.recommendation.${r}`)} />
					{hint(t('copilot.rules.dialog.recommendationsHelp'))}
				</>
			)}

			{tr.type === TRIGGER.SCHEDULE && (
				<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
					<TextField select size="small" label={t('copilot.rules.dialog.frequency')} value={tr.frequency} onChange={(e) => setTrigger('frequency', e.target.value)} sx={{ ...fieldSx, minWidth: 140 }}>
						<MenuItem value="DAILY">{t('copilot.rules.frequency.DAILY')}</MenuItem>
						<MenuItem value="WEEKLY">{t('copilot.rules.frequency.WEEKLY')}</MenuItem>
					</TextField>
					{tr.frequency === 'WEEKLY' && (
						<TextField select size="small" label={t('copilot.rules.dialog.weekday')} value={tr.weekday} onChange={(e) => setTrigger('weekday', e.target.value)} sx={{ ...fieldSx, minWidth: 140 }}>
							{WEEKDAYS.map((d) => <MenuItem key={d} value={d}>{t(`copilot.rules.weekdays.${d}`)}</MenuItem>)}
						</TextField>
					)}
					<TextField select size="small" label={t('copilot.rules.dialog.hour')} value={tr.hour} onChange={(e) => setTrigger('hour', e.target.value)} sx={{ ...fieldSx, minWidth: 110 }}>
						{HOURS.map((h) => <MenuItem key={h} value={h}>{`${String(h).padStart(2, '0')}:00`}</MenuItem>)}
					</TextField>
					<Box sx={{ alignSelf: 'center' }}>{hint(t('copilot.rules.dialog.zone', { zone: tr.zoneId }))}</Box>
				</Box>
			)}

			{tr.type === TRIGGER.JOB_NEEDS_MATCHING && (
				<CheckboxGroup testId="copilot-rule-stale-reasons" label={t('copilot.rules.dialog.staleReasons')} options={STALE_REASONS}
					selected={tr.staleReasons} onChange={(v) => setTrigger('staleReasons', v)} labelOf={(r) => t(`copilot.rules.staleReasons.${r}`)}
					error={show('staleReasons')} />
			)}

			{tr.type === TRIGGER.REPORT_STATUS_CHANGED && (
				<CheckboxGroup testId="copilot-rule-to-statuses" label={t('copilot.rules.dialog.toStatuses')} options={RULE_STATUSES}
					selected={tr.toStatuses} onChange={(v) => setTrigger('toStatuses', v)} labelOf={(s) => t(`reportStatus.values.${s}`)}
					error={show('toStatuses')} />
			)}

			{tr.type === TRIGGER.REPORT_STATUS_IDLE && (
				<>
					<CheckboxGroup testId="copilot-rule-idle-statuses" label={t('copilot.rules.dialog.idleStatuses')} options={RULE_STATUSES}
						selected={tr.idleStatuses} onChange={(v) => setTrigger('idleStatuses', v)} labelOf={(s) => t(`reportStatus.values.${s}`)}
						error={show('idleStatuses')} />
					<TextField size="small" type="number" label={t('copilot.rules.dialog.idleDays')} value={tr.idleDays ?? ''} onChange={number('idleDays')}
						error={!!show('idleDays')} helperText={show('idleDays') ?? t('copilot.rules.dialog.idleHelp')}
						inputProps={{ min: 1, max: MAX_IDLE_DAYS, 'data-testid': 'copilot-rule-idle-days' }} sx={{ ...fieldSx, width: 260 }} />
				</>
			)}

			{tr.type === TRIGGER.CV_OUTDATED && (
				<>
					<TextField select size="small" label={t('copilot.rules.dialog.staleMonths')} value={tr.staleMonths} onChange={(e) => setTrigger('staleMonths', Number(e.target.value))}
						SelectProps={{ SelectDisplayProps: { 'data-testid': 'copilot-rule-stale-months' } }} sx={{ ...fieldSx, width: 220 }}>
						{STALE_MONTHS.map((m) => <MenuItem key={m} value={m}>{t('copilot.rules.dialog.staleMonthsOption', { months: m })}</MenuItem>)}
					</TextField>
					{hint(t('copilot.rules.dialog.outdatedNote'))}
				</>
			)}

			{tr.type === TRIGGER.JOB_CLOSED && hint(t('copilot.rules.dialog.jobClosedNote'))}
			{tr.type === TRIGGER.DUPLICATE_FOUND && hint(t('copilot.rules.dialog.duplicateNote'))}
			{tr.type === TRIGGER.CANDIDATE_PROFILE_UPDATED && hint(t('copilot.rules.dialog.profileUpdatedNote'))}

			{tr.type === TRIGGER.ATS_SYNC_FINISHED && (
				<TextField select size="small" label={t('copilot.rules.dialog.connection')} value={tr.connectionId} onChange={(e) => setTrigger('connectionId', e.target.value)} sx={fieldSx}>
					<MenuItem value="">{t('copilot.rules.anyConnection')}</MenuItem>
					{connections.map((c) => <MenuItem key={c.id} value={c.id}>{c.displayName || c.provider}</MenuItem>)}
				</TextField>
			)}
		</>
	);
};

RuleTriggerFields.propTypes = {
	trigger: PropTypes.object.isRequired,
	setTrigger: PropTypes.func.isRequired,
	jobs: PropTypes.array.isRequired,
	connections: PropTypes.array.isRequired,
	show: PropTypes.func.isRequired,
};

export default RuleTriggerFields;
