import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { resolveError } from '../../../utils/errorHandler.js';
import * as tokens from '../../../theme/tokens.js';
import { getJobs } from '../../jobs/api/jobService.js';
import { getAtsConnections } from '../../settings/api/atsService.js';
import { JOB_TRIGGERS, MAX_DAILY_CAP, MAX_RULE_GOAL, MAX_RULE_NAME, PLACEHOLDERS, ruleToForm, TRIGGER, TRIGGERS, validateRule } from '../model/agentRule.js';
import RuleTriggerFields from './RuleTriggerFields.jsx';
import { fieldSx } from './ruleFieldSx.js';
import RulePreApproval from './RulePreApproval.jsx';

/** Open jobs and ATS connections for the pickers; a list that fails to load just offers "any". */
const useRuleTargets = (type) => {
	const [jobs, setJobs] = useState([]);
	const [connections, setConnections] = useState([]);
	useEffect(() => {
		if (!JOB_TRIGGERS.includes(type) || jobs.length) return;
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

				<RuleTriggerFields trigger={tr} setTrigger={setTrigger} jobs={jobOptions} connections={connectionOptions} show={show} />

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

				<RulePreApproval form={form} set={set} show={show} />

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
