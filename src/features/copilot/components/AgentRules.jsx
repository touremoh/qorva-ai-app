import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAgentRun } from '../../../contexts/AgentRunContext.jsx';
import ConfirmDialog from '../../../shared/ui/ConfirmDialog.jsx';
import * as tokens from '../../../theme/tokens.js';
import useAgentRules from '../hooks/useAgentRules.js';
import { RULE_STATUS, triggerSummary } from '../model/agentRule.js';
import AgentRuleDialog from './AgentRuleDialog.jsx';

const text = { fontSize: tokens.fontSize.caption, color: tokens.ink.body };
const faint = { fontSize: tokens.fontSize.micro, color: tokens.ink.faintest };

const formatDate = (value, language) => {
	if (!value) return null;
	try {
		return new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
	} catch {
		return value;
	}
};

const StatusChip = ({ rule }) => {
	const { t } = useTranslation();
	const paused = rule.status === RULE_STATUS.PAUSED;
	const tone = paused ? tokens.status.warning : tokens.status.success;
	const label = paused ? t(`copilot.rules.paused.${rule.pausedReason || 'MANUAL'}`) : t('copilot.rules.active');
	return <Chip size="small" label={label} data-testid="copilot-rule-status" sx={{ height: 22, fontSize: tokens.fontSize.micro, color: tone.text, backgroundColor: tone.tint }} />;
};
StatusChip.propTypes = { rule: PropTypes.object.isRequired };

/** One rule: what it watches and does, how much it ran today, and what this user may do with it. */
const RuleRow = ({ rule, showOwner, onEdit, onDelete, onTogglePause, onShowRuns }) => {
	const { t, i18n } = useTranslation();
	const lastFired = formatDate(rule.lastFiredAt, i18n.language);
	const nextRun = formatDate(rule.nextRunAt, i18n.language);
	return (
		<Box data-testid="copilot-rule" sx={{ p: 2, borderBottom: `1px solid ${tokens.line.main}`, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
				<Typography sx={{ fontSize: tokens.fontSize.small, fontWeight: 700, color: tokens.ink.strong, flex: 1, minWidth: 0 }}>{rule.name}</Typography>
				<StatusChip rule={rule} />
			</Box>
			<Typography sx={text}>{triggerSummary(t, rule.trigger)}</Typography>
			<Typography sx={{ ...text, color: tokens.ink.subtle, whiteSpace: 'pre-wrap' }}>{rule.goalTemplate}</Typography>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
				<Typography sx={faint}>{t('copilot.rules.runsToday', { count: rule.runsToday, cap: rule.dailyRunCap })}</Typography>
				{rule.autoApproveMatching && (
					<Typography sx={faint}>{t('copilot.rules.autoApproved', { count: rule.autoApproveMaxActions })}</Typography>
				)}
				{rule.autoApproveProfileUpdates && (
					<Typography sx={faint}>{t('copilot.rules.autoApprovedProfileUpdates', { count: rule.autoApproveProfileUpdatesMax })}</Typography>
				)}
				{rule.skippedToday > 0 && <Typography sx={{ ...faint, color: tokens.status.warning.text }}>{t('copilot.rules.skippedToday', { count: rule.skippedToday })}</Typography>}
				{lastFired && <Typography sx={faint}>{t('copilot.rules.lastFired', { date: lastFired })}</Typography>}
				{nextRun && rule.status === RULE_STATUS.ACTIVE && <Typography sx={faint}>{t('copilot.rules.nextRun', { date: nextRun })}</Typography>}
				{showOwner && <Typography sx={faint}>{t('copilot.rules.owner', { email: rule.ownerEmail })}</Typography>}
			</Box>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'flex-end' }}>
				<Button size="small" onClick={() => onShowRuns(rule)} sx={{ textTransform: 'none', mr: 'auto' }}>{t('copilot.rules.showRuns')}</Button>
				{rule.canPause && (
					<Button size="small" onClick={() => onTogglePause(rule)} data-testid="copilot-rule-toggle" sx={{ textTransform: 'none' }}>
						{t(rule.status === RULE_STATUS.PAUSED ? 'copilot.rules.resume' : 'copilot.rules.pause')}
					</Button>
				)}
				{rule.canEdit && (
					<>
						<Button size="small" onClick={() => onEdit(rule)} data-testid="copilot-rule-edit" sx={{ textTransform: 'none' }}>{t('copilot.rules.edit')}</Button>
						<Button size="small" color="error" onClick={() => onDelete(rule)} data-testid="copilot-rule-delete" sx={{ textTransform: 'none' }}>{t('copilot.rules.delete')}</Button>
					</>
				)}
			</Box>
		</Box>
	);
};
RuleRow.propTypes = {
	rule: PropTypes.object.isRequired,
	showOwner: PropTypes.bool,
	onEdit: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
	onTogglePause: PropTypes.func.isRequired,
	onShowRuns: PropTypes.func.isRequired,
};

/** Rules tab: standing rules that start Copilot tasks by themselves. Users who manage users also see the team's. */
const AgentRules = () => {
	const { t } = useTranslation();
	const { availability } = useAgentRun();
	const [params, setParams] = useSearchParams();
	const rules = useAgentRules();
	const canViewTeam = !!availability?.canViewTeam;

	const showRuns = (rule) => {
		const next = new URLSearchParams(params);
		next.set('tab', 'activity');
		next.set('ruleId', rule.id);
		if (rules.scope === 'team') next.set('scope', 'team'); else next.delete('scope');
		next.delete('status');
		setParams(next, { replace: true });
	};

	return (
		<Box sx={{ height: '100%', overflowY: 'auto', px: { xs: 2, md: 3 }, py: 2, backgroundColor: tokens.surface.subtle }}>
			<Box sx={{ maxWidth: 1100, mx: 'auto' }}>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 1 }}>
					{canViewTeam && (
						<ToggleButtonGroup size="small" exclusive value={rules.scope} onChange={(_, v) => rules.changeScope(v)}>
							<ToggleButton value="mine" data-testid="copilot-rules-scope-mine" sx={{ textTransform: 'none', fontSize: tokens.fontSize.caption }}>
								{t('copilot.rules.scope.mine')}
							</ToggleButton>
							<ToggleButton value="team" data-testid="copilot-rules-scope-team" sx={{ textTransform: 'none', fontSize: tokens.fontSize.caption }}>
								{t('copilot.rules.scope.team')}
							</ToggleButton>
						</ToggleButtonGroup>
					)}
					<Button variant="contained" size="small" startIcon={<AddIcon />} onClick={rules.openNew} data-testid="copilot-rule-new"
						sx={{ ml: 'auto', textTransform: 'none' }}>
						{t('copilot.rules.new')}
					</Button>
				</Box>
				<Typography sx={{ ...faint, mb: 2 }}>{t('copilot.rules.intro')}</Typography>

				<Box sx={{ backgroundColor: tokens.surface.paper, border: `1px solid ${tokens.line.main}`, borderRadius: 2, overflow: 'hidden' }}>
					{rules.loading ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
							<CircularProgress size={22} sx={{ color: tokens.brand.text }} />
						</Box>
					) : rules.rules.length === 0 ? (
						<Typography data-testid="copilot-rules-empty" sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.subtle, textAlign: 'center', py: 5 }}>
							{t('copilot.rules.empty')}
						</Typography>
					) : rules.rules.map((rule) => (
						<RuleRow key={rule.id} rule={rule} showOwner={rules.scope === 'team'} onEdit={rules.openEdit}
							onDelete={rules.setRuleToDelete} onTogglePause={rules.togglePause} onShowRuns={showRuns} />
					))}
				</Box>
			</Box>

			{rules.dialogOpen && <AgentRuleDialog open rule={rules.editing} onClose={rules.closeDialog} onSave={rules.save} />}

			<ConfirmDialog
				open={!!rules.ruleToDelete}
				title={t('copilot.rules.deleteTitle')}
				subject={rules.ruleToDelete?.name && (
					<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: 600, color: 'ink.strong' }}>{rules.ruleToDelete.name}</Typography>
				)}
				cancelLabel={t('copilot.rules.cancel')}
				confirmLabel={t('copilot.rules.delete')}
				onCancel={() => rules.setRuleToDelete(null)}
				onConfirm={rules.confirmDelete}
				busy={rules.busy}
				tone="danger"
				maxWidth="xs"
				fullWidth
			>
				{t('copilot.rules.deleteMessage')}
			</ConfirmDialog>
		</Box>
	);
};

export default AgentRules;
