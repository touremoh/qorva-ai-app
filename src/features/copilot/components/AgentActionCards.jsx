import { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { useAgentRun } from '../../../contexts/AgentRunContext.jsx';
import { toastError } from '../../../utils/errorHandler.js';
import * as tokens from '../../../theme/tokens.js';
import { isAwaitingApproval, undecidedActions } from '../model/agentRun.js';
import ActionCard from './ActionCard.jsx';

/** The cards of a run waiting for approval; the run resumes once every card is decided. */
const AgentActionCards = ({ run, onRunUpdate }) => {
	const { t } = useTranslation();
	const { approveAction } = useAgentRun();
	const [approvingAll, setApprovingAll] = useState(false);
	const actions = run.pendingActions ?? [];
	if (!isAwaitingApproval(run) || actions.length === 0) return null;
	const undecided = undecidedActions(run);

	const approveAll = async () => {
		setApprovingAll(true);
		let latest = run;
		try {
			for (const action of undecided) {
				latest = await approveAction(latest, action, {});
			}
		} catch (e) {
			toastError(e);
		} finally {
			setApprovingAll(false);
			onRunUpdate?.(latest);
		}
	};

	return (
		<Box data-testid="copilot-action-cards" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				<Typography sx={{ fontSize: tokens.fontSize.caption, fontWeight: 600, color: tokens.status.warning.text, flex: 1 }}>
					{run.canApprove
						? t('copilot.action.needsYou', { count: undecided.length })
						: t('copilot.action.waitingFor', { user: run.userEmail })}
				</Typography>
				{run.canApprove && undecided.length > 1 && (
					<Button size="small" variant="outlined" onClick={approveAll} disabled={approvingAll} data-testid="copilot-action-approve-all"
						sx={{ textTransform: 'none' }}>
						{t('copilot.action.approveAll', { count: undecided.length })}
					</Button>
				)}
			</Box>
			{run.approvalExpiresAt && (
				<Typography sx={{ fontSize: tokens.fontSize.micro, color: tokens.ink.faintest }}>
					{t('copilot.action.expires', { date: new Date(run.approvalExpiresAt).toLocaleString() })}
				</Typography>
			)}
			{actions.map((action) => (
				<ActionCard key={action.actionId} run={run} action={action} canDecide={run.canApprove && !approvingAll} onDecided={onRunUpdate} />
			))}
		</Box>
	);
};

AgentActionCards.propTypes = {
	run: PropTypes.object.isRequired,
	onRunUpdate: PropTypes.func,
};

export default AgentActionCards;
