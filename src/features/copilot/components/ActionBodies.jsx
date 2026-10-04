import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';
import { triggerSummary } from '../model/agentRule.js';

const label = { fontSize: tokens.fontSize.micro, color: tokens.ink.faintest, textTransform: 'uppercase', letterSpacing: 0.4 };
const value = { fontSize: tokens.fontSize.caption, color: tokens.ink.strong };

const Row = ({ name, children }) => (
	<Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
		<Typography sx={{ ...label, width: 72, flexShrink: 0 }}>{name}</Typography>
		<Typography component="div" sx={{ ...value, minWidth: 0, wordBreak: 'break-word' }}>{children}</Typography>
	</Box>
);
Row.propTypes = { name: PropTypes.node, children: PropTypes.node };

/** Email card: who it goes to (from the profile, never editable), and the message, editable before approving. */
export const EmailActionBody = ({ preview, subject, body, onSubject, onBody, editable }) => {
	const { t } = useTranslation();
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
			<Row name={t('copilot.action.email.to')}>{preview.candidateName ? `${preview.candidateName} <${preview.to}>` : preview.to}</Row>
			<Row name={t('copilot.action.email.from')}>{preview.from}</Row>
			{preview.lastContactedAt && (
				<Row name={t('copilot.action.email.lastContacted')}>{new Date(preview.lastContactedAt).toLocaleDateString()}</Row>
			)}
			{editable ? (
				<>
					<TextField size="small" label={t('copilot.action.email.subject')} value={subject} onChange={(e) => onSubject(e.target.value)}
						inputProps={{ maxLength: 200, 'data-testid': 'copilot-action-subject' }} sx={{ mt: 0.5 }} />
					<TextField size="small" label={t('copilot.action.email.body')} value={body} onChange={(e) => onBody(e.target.value)}
						multiline minRows={4} maxRows={14} inputProps={{ maxLength: 8000, 'data-testid': 'copilot-action-body' }} />
				</>
			) : (
				<>
					<Row name={t('copilot.action.email.subject')}>{subject}</Row>
					<Typography sx={{ ...value, whiteSpace: 'pre-wrap', backgroundColor: tokens.surface.subtle, borderRadius: 1, p: 1 }}>{body}</Typography>
				</>
			)}
		</Box>
	);
};
EmailActionBody.propTypes = {
	preview: PropTypes.object.isRequired,
	subject: PropTypes.string,
	body: PropTypes.string,
	onSubject: PropTypes.func,
	onBody: PropTypes.func,
	editable: PropTypes.bool,
};

/** Matching card: which jobs (with their Top N), what it may cost — unchanged reports are free —, what the plan has left. */
export const ScreeningActionBody = ({ preview }) => {
	const { t } = useTranslation();
	const jobLabel = (j) => (j.topN ? `${j.title} (${t('matchingRun.topNOption', { n: j.topN })})` : j.title);
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
			<Row name={t('copilot.action.screening.jobs')}>{(preview.jobs ?? []).map(jobLabel).join(', ')}</Row>
			<Row name={t('copilot.action.screening.cost')}>
				{t('copilot.action.screening.estimate', { count: preview.estimatedActions })}
				{preview.reusedReports > 0 && ` · ${t('copilot.action.screening.reused', { count: preview.reusedReports })}`}
			</Row>
			<Row name={t('copilot.action.screening.left')}>
				{preview.remainingActions == null ? t('copilot.action.screening.unmetered') : preview.remainingActions}
			</Row>
		</Box>
	);
};
ScreeningActionBody.propTypes = { preview: PropTypes.object.isRequired };

/** ATS import card. */
export const AtsSyncActionBody = ({ preview }) => {
	const { t } = useTranslation();
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
			<Row name={t('copilot.action.ats.connection')}>{preview.name} ({preview.provider})</Row>
			<Typography sx={{ fontSize: tokens.fontSize.micro, color: tokens.ink.subtle }}>{t('copilot.action.ats.note')}</Typography>
		</Box>
	);
};
AtsSyncActionBody.propTypes = { preview: PropTypes.object.isRequired };

/** Standing-rule card: what it will watch, what Copilot will then do, and its daily limit. */
export const RuleActionBody = ({ preview }) => {
	const { t } = useTranslation();
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
			<Row name={t('copilot.action.rule.name')}>{preview.name}</Row>
			<Row name={t('copilot.action.rule.when')}>{triggerSummary(t, preview.trigger)}</Row>
			<Row name={t('copilot.action.rule.goal')}><Box component="span" sx={{ whiteSpace: 'pre-wrap' }}>{preview.goalTemplate}</Box></Row>
			<Row name={t('copilot.action.rule.cap')}>{t('copilot.action.rule.perDay', { count: preview.dailyRunCap ?? 20 })}</Row>
			{preview.autoApproveMatching && (
				<Row name={t('copilot.action.rule.matching')}>{t('copilot.rules.autoApproved', { count: preview.autoApproveMaxActions ?? 50 })}</Row>
			)}
			<Typography sx={{ fontSize: tokens.fontSize.micro, color: tokens.ink.subtle }}>{t('copilot.action.rule.note')}</Typography>
		</Box>
	);
};
RuleActionBody.propTypes = { preview: PropTypes.object.isRequired };
