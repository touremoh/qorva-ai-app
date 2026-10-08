import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';
import { MAX_AUTO_APPROVE_ACTIONS, MAX_AUTO_APPROVE_PROFILE_UPDATES } from '../model/agentRule.js';
import { fieldSx } from './ruleFieldSx.js';

/** One pre-approval: a checkbox, and when ticked, the most it may do without asking. */
const PreApproval = ({ checked, onCheck, label, max, value, onValue, valueLabel, help, error, testId }) => (
	<Box>
		<FormControlLabel
			control={<Checkbox size="small" checked={checked} onChange={(e) => onCheck(e.target.checked)} inputProps={{ 'data-testid': testId }} />}
			label={<Typography sx={{ fontSize: tokens.fontSize.caption }}>{label}</Typography>}
		/>
		{checked && (
			<TextField size="small" type="number" label={valueLabel} value={value}
				onChange={(e) => onValue(e.target.value === '' ? '' : Number(e.target.value))}
				error={!!error} helperText={error ?? help}
				inputProps={{ min: 1, max, 'data-testid': `${testId}-max` }} sx={{ ...fieldSx, width: 260, mt: 1 }} />
		)}
	</Box>
);
PreApproval.propTypes = {
	checked: PropTypes.bool.isRequired, onCheck: PropTypes.func.isRequired, label: PropTypes.string.isRequired, max: PropTypes.number.isRequired,
	value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), onValue: PropTypes.func.isRequired, valueLabel: PropTypes.string.isRequired,
	help: PropTypes.string, error: PropTypes.string, testId: PropTypes.string.isRequired,
};

/** What the rule's tasks may do without waiting for approval: matching, and profile-update requests. */
const RulePreApproval = ({ form, set, show }) => {
	const { t } = useTranslation();
	return (
		<>
			<PreApproval testId="copilot-rule-auto-approve" checked={!!form.autoApproveMatching} onCheck={(v) => set('autoApproveMatching', v)}
				label={t('copilot.rules.dialog.autoApprove')} max={MAX_AUTO_APPROVE_ACTIONS} value={form.autoApproveMaxActions}
				onValue={(v) => set('autoApproveMaxActions', v)} valueLabel={t('copilot.rules.dialog.autoApproveMax')}
				help={t('copilot.rules.dialog.autoApproveHelp')} error={show('autoApproveMaxActions')} />
			<PreApproval testId="copilot-rule-auto-profile-updates" checked={!!form.autoApproveProfileUpdates}
				onCheck={(v) => set('autoApproveProfileUpdates', v)} label={t('copilot.rules.dialog.autoApproveProfileUpdates')}
				max={MAX_AUTO_APPROVE_PROFILE_UPDATES} value={form.autoApproveProfileUpdatesMax}
				onValue={(v) => set('autoApproveProfileUpdatesMax', v)} valueLabel={t('copilot.rules.dialog.autoApproveProfileUpdatesMax')}
				help={t('copilot.rules.dialog.autoApproveProfileUpdatesHelp')} error={show('autoApproveProfileUpdatesMax')} />
		</>
	);
};

RulePreApproval.propTypes = {
	form: PropTypes.object.isRequired,
	set: PropTypes.func.isRequired,
	show: PropTypes.func.isRequired,
};

export default RulePreApproval;
