import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { resolveError } from '../../../utils/errorHandler.js';
import * as tokens from '../../../theme/tokens.js';
import { getJobs } from '../../jobs/api/jobService.js';
import { getAtsConnections } from '../../settings/api/atsService.js';
import { MAX_AUTO_APPROVE_ACTIONS, MAX_DAILY_CAP, MAX_RULE_GOAL, MAX_RULE_NAME, PLACEHOLDERS, RULE_STATUSES, ruleToForm, STALE_REASONS, TRIGGER, TRIGGERS, validateRule } from '../model/agentRule.js';

const fieldSx = { '& .MuiInputBase-root': { fontSize: tokens.fontSize.caption }, '& .MuiInputLabel-root': { fontSize: tokens.fontSize.caption } };
const HOURS = Array.from({ length: 24 }, (_, h) => h);
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];

/** Open jobs and ATS connections for the pickers; a list that fails to load just offers "any". */
const useRuleTargets = (type) => {
	const [jobs, setJobs] = useState([]);
	const [connections, setConnections] = useState([]);
	useEffect(() => {
		if (![TRIGGER.CV_SCORED, TRIGGER.JOB_NEEDS_MATCHING, TRIGGER.REPORT_STATUS_CHANGED].includes(type) || jobs.length) return;
		getJobs({ pageSize: 100, pageNumber: 0 })
			.then((res) => setJobs((res.data?.data?.content ?? []).filter((j) => (j.status ?? 'open').toLowerCase() === 'open')))
			.catch(() => {});
	}, [type, jobs.length]);
	useEffect(() => {
		if (type !== TRIGGER.ATS_SYNC_FINISHED || connections.length) return;
		getAtsConnections().then((res) => setConnections(res.data?.connections ?? [])).catch(() => {});
	}, [type, connections.length]);
	return { jobs, connections };
};

/** Create or edit a standing rule: what it watches (trigger), what Copilot then does (goal), and its daily limit. */
const AgentRuleDialog = ({ open, rule, onClose, onSave }) => {
	const { t } = useTranslation();
	const [form, setForm] = useState(() => ruleToForm(rule));
	const [touched, setTouched] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);
	const goalRef = useRef(null);
	const { jobs, connections } = useRuleTargets(form.trigger.type);
	const errors = useMemo(() => validateRule(form), [form]);
	const show = (field) => (touched && errors[field] ? t(errors[field]) : undefined);

	const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
	const setTrigger = (field, value) => setForm((f) => ({ ...f, trigger: { ...f.trigger, [field]: value } }));
	const toggleReason = (reason, on) => setTrigger('staleReasons',
		STALE_REASONS.filter((r) => (r === reason ? on : form.trigger.staleReasons?.includes(r))));
	const toggleStatus = (status, on) => setTrigger('toStatuses',
		RULE_STATUSES.filter((s) => (s === status ? on : form.trigger.toStatuses?.includes(s))));

	const insertPlaceholder = (placeholder) => {
		const input = goalRef.current;
		const value = form.goalTemplate;
		const at = input?.selectionStart ?? value.length;
		set('goalTemplate', (value.slice(0, at) + placeholder + value.slice(input?.selectionEnd ?? at)).slice(0, MAX_RULE_GOAL));
	};

	const submit = async () => {
		setTouched(true);
		if (Object.keys(errors).length) return;
		setSaving(true);
		setError(null);
		try {
			await onSave(form);
		} catch (e) {
			setError(resolveError(e));
		} finally {
			setSaving(false);
		}
	};

	const tr = form.trigger;
	// The rule's own job/connection stays selectable even if it is no longer in the loaded list.
	const jobOptions = rule?.trigger?.jobPostId && !jobs.some((j) => j.id === rule.trigger.jobPostId)
		? [{ id: rule.trigger.jobPostId, title: rule.trigger.jobTitle }, ...jobs] : jobs;
	const connectionOptions = rule?.trigger?.connectionId && !connections.some((c) => c.id === rule.trigger.connectionId)
		? [{ id: rule.trigger.connectionId, displayName: rule.trigger.connectionName }, ...connections] : connections;

	return (
		<Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth data-testid="copilot-rule-dialog">
			<DialogTitle sx={{ fontSize: tokens.fontSize.body, fontWeight: 700 }}>
				{t(rule ? 'copilot.rules.dialog.editTitle' : 'copilot.rules.dialog.newTitle')}
			</DialogTitle>
			<DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
				<TextField size="small" label={t('copilot.rules.dialog.name')} value={form.name} onChange={(e) => set('name', e.target.value)}
					error={!!show('name')} helperText={show('name')} inputProps={{ maxLength: MAX_RULE_NAME, 'data-testid': 'copilot-rule-name' }} sx={fieldSx} />

				<TextField select size="small" label={t('copilot.rules.dialog.trigger')} value={tr.type} onChange={(e) => setTrigger('type', e.target.value)}
					SelectProps={{ SelectDisplayProps: { 'data-testid': 'copilot-rule-trigger' } }} sx={fieldSx}>
					{TRIGGERS.map((type) => <MenuItem key={type} value={type}>{t(`copilot.rules.triggers.${type}`)}</MenuItem>)}
				</TextField>

				{tr.type === TRIGGER.CV_ADDED && (
					<TextField select size="small" label={t('copilot.rules.dialog.source')} value={tr.source} onChange={(e) => setTrigger('source', e.target.value)} sx={fieldSx}>
						{['ANY', 'MANUAL', 'ATS'].map((s) => <MenuItem key={s} value={s}>{t(`copilot.rules.sources.${s}`)}</MenuItem>)}
					</TextField>
				)}

				{tr.type === TRIGGER.CV_SCORED && (
					<>
						<TextField select size="small" label={t('copilot.rules.dialog.job')} value={tr.jobPostId} onChange={(e) => setTrigger('jobPostId', e.target.value)} sx={fieldSx}>
							<MenuItem value="">{t('copilot.rules.anyJob')}</MenuItem>
							{jobOptions.map((j) => <MenuItem key={j.id} value={j.id}>{j.title}</MenuItem>)}
						</TextField>
						<Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
							<TextField size="small" type="number" label={t('copilot.rules.dialog.minScore')} value={tr.minScore ?? ''}
								onChange={(e) => setTrigger('minScore', e.target.value === '' ? null : Number(e.target.value))}
								error={!!show('minScore')} helperText={show('minScore') ?? t('copilot.rules.dialog.minScoreHelp')}
								inputProps={{ min: 0, max: 100, 'data-testid': 'copilot-rule-min-score' }} sx={{ ...fieldSx, width: 180 }} />
							<FormControlLabel
								control={<Checkbox size="small" checked={!!tr.recommendedOnly} onChange={(e) => setTrigger('recommendedOnly', e.target.checked)} />}
								label={<Typography sx={{ fontSize: tokens.fontSize.caption }}>{t('copilot.rules.dialog.recommendedOnly')}</Typography>}
							/>
						</Box>
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
						<Typography sx={{ fontSize: tokens.fontSize.micro, color: tokens.ink.faintest, alignSelf: 'center' }}>
							{t('copilot.rules.dialog.zone', { zone: tr.zoneId })}
						</Typography>
					</Box>
				)}

				{tr.type === TRIGGER.JOB_NEEDS_MATCHING && (
					<>
						<TextField select size="small" label={t('copilot.rules.dialog.job')} value={tr.jobPostId} onChange={(e) => setTrigger('jobPostId', e.target.value)} sx={fieldSx}>
							<MenuItem value="">{t('copilot.rules.anyJob')}</MenuItem>
							{jobOptions.map((j) => <MenuItem key={j.id} value={j.id}>{j.title}</MenuItem>)}
						</TextField>
						<Box data-testid="copilot-rule-stale-reasons">
							<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.muted }}>{t('copilot.rules.dialog.staleReasons')}</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 1 }}>
								{STALE_REASONS.map((r) => (
									<FormControlLabel key={r}
										control={<Checkbox size="small" checked={!!tr.staleReasons?.includes(r)} onChange={(e) => toggleReason(r, e.target.checked)} />}
										label={<Typography sx={{ fontSize: tokens.fontSize.caption }}>{t(`copilot.rules.staleReasons.${r}`)}</Typography>}
									/>
								))}
							</Box>
							{show('staleReasons') && <Typography sx={{ fontSize: tokens.fontSize.micro, color: tokens.status.error.text }}>{show('staleReasons')}</Typography>}
						</Box>
					</>
				)}

				{tr.type === TRIGGER.REPORT_STATUS_CHANGED && (
					<>
						<TextField select size="small" label={t('copilot.rules.dialog.job')} value={tr.jobPostId} onChange={(e) => setTrigger('jobPostId', e.target.value)} sx={fieldSx}>
							<MenuItem value="">{t('copilot.rules.anyJob')}</MenuItem>
							{jobOptions.map((j) => <MenuItem key={j.id} value={j.id}>{j.title}</MenuItem>)}
						</TextField>
						<Box data-testid="copilot-rule-to-statuses">
							<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.muted }}>{t('copilot.rules.dialog.toStatuses')}</Typography>
							<Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 1 }}>
								{RULE_STATUSES.map((s) => (
									<FormControlLabel key={s}
										control={<Checkbox size="small" checked={!!tr.toStatuses?.includes(s)} onChange={(e) => toggleStatus(s, e.target.checked)} />}
										label={<Typography sx={{ fontSize: tokens.fontSize.caption }}>{t(`reportStatus.values.${s}`)}</Typography>}
									/>
								))}
							</Box>
							{show('toStatuses') && <Typography sx={{ fontSize: tokens.fontSize.micro, color: tokens.status.error.text }}>{show('toStatuses')}</Typography>}
						</Box>
					</>
				)}

				{tr.type === TRIGGER.ATS_SYNC_FINISHED && (
					<TextField select size="small" label={t('copilot.rules.dialog.connection')} value={tr.connectionId} onChange={(e) => setTrigger('connectionId', e.target.value)} sx={fieldSx}>
						<MenuItem value="">{t('copilot.rules.anyConnection')}</MenuItem>
						{connectionOptions.map((c) => <MenuItem key={c.id} value={c.id}>{c.displayName || c.provider}</MenuItem>)}
					</TextField>
				)}

				<Box>
					<TextField size="small" fullWidth multiline minRows={3} maxRows={10} label={t('copilot.rules.dialog.goal')} value={form.goalTemplate}
						onChange={(e) => set('goalTemplate', e.target.value)} inputRef={goalRef}
						placeholder={t('copilot.rules.dialog.goalPlaceholder', { candidates: '{{candidates}}', job: '{{job}}' })} error={!!show('goalTemplate')} helperText={show('goalTemplate')}
						inputProps={{ maxLength: MAX_RULE_GOAL, 'data-testid': 'copilot-rule-goal' }} sx={fieldSx} />
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1, alignItems: 'center' }}>
						<Typography sx={{ fontSize: tokens.fontSize.micro, color: tokens.ink.faintest }}>{t('copilot.rules.dialog.insert')}</Typography>
						{PLACEHOLDERS.map((p) => (
							<Chip key={p} size="small" label={t(`copilot.rules.placeholders.${p.slice(2, -2)}`)} onClick={() => insertPlaceholder(p)}
								sx={{ height: 22, fontSize: tokens.fontSize.micro }} />
						))}
					</Box>
				</Box>

				<TextField size="small" type="number" label={t('copilot.rules.dialog.cap')} value={form.dailyRunCap}
					onChange={(e) => set('dailyRunCap', e.target.value === '' ? '' : Number(e.target.value))}
					error={!!show('dailyRunCap')} helperText={show('dailyRunCap') ?? t('copilot.rules.dialog.capHelp')}
					inputProps={{ min: 1, max: MAX_DAILY_CAP, 'data-testid': 'copilot-rule-cap' }} sx={{ ...fieldSx, width: 220 }} />

				<Box>
					<FormControlLabel
						control={<Checkbox size="small" checked={!!form.autoApproveMatching} onChange={(e) => set('autoApproveMatching', e.target.checked)}
							inputProps={{ 'data-testid': 'copilot-rule-auto-approve' }} />}
						label={<Typography sx={{ fontSize: tokens.fontSize.caption }}>{t('copilot.rules.dialog.autoApprove')}</Typography>}
					/>
					{form.autoApproveMatching && (
						<TextField size="small" type="number" label={t('copilot.rules.dialog.autoApproveMax')} value={form.autoApproveMaxActions}
							onChange={(e) => set('autoApproveMaxActions', e.target.value === '' ? '' : Number(e.target.value))}
							error={!!show('autoApproveMaxActions')} helperText={show('autoApproveMaxActions') ?? t('copilot.rules.dialog.autoApproveHelp')}
							inputProps={{ min: 1, max: MAX_AUTO_APPROVE_ACTIONS, 'data-testid': 'copilot-rule-auto-approve-max' }} sx={{ ...fieldSx, width: 260, mt: 1 }} />
					)}
				</Box>

				<Typography sx={{ fontSize: tokens.fontSize.micro, color: tokens.ink.faintest }}>{t('copilot.rules.dialog.note')}</Typography>
				{error && <Typography role="alert" sx={{ fontSize: tokens.fontSize.caption, color: tokens.status.error.text }}>{error}</Typography>}
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button onClick={onClose} disabled={saving} sx={{ textTransform: 'none' }}>{t('copilot.rules.cancel')}</Button>
				<Button variant="contained" onClick={submit} disabled={saving} data-testid="copilot-rule-save" sx={{ textTransform: 'none' }}>
					{t(rule ? 'copilot.rules.dialog.save' : 'copilot.rules.dialog.create')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

AgentRuleDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	rule: PropTypes.object,
	onClose: PropTypes.func.isRequired,
	onSave: PropTypes.func.isRequired,
};

export default AgentRuleDialog;
