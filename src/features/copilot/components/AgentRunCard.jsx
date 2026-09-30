import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles';
import ChatMarkdown from '../../chat/components/ChatMarkdown.jsx';
import AgentRunTimeline from './AgentRunTimeline.jsx';
import AgentActionCards from './AgentActionCards.jsx';
import RunStatusChip from './RunStatusChip.jsx';
import * as tokens from '../../../theme/tokens.js';
import { failureMessage, isWorking, RUN_STATUS } from '../model/agentRun.js';

/** One task of a conversation: the goal, what Copilot did, and its answer. */
const AgentRunCard = ({ run, onCancel, onLinkClick, onRunUpdate, showGoal = true }) => {
	const { t } = useTranslation();
	const working = isWorking(run);
	return (
		<Box data-testid="copilot-run" sx={{ mb: 2.5 }}>
			{showGoal && (
				<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.25 }}>
					<Box sx={{
						maxWidth: '72%',
						px: 1.75,
						py: 1,
						borderRadius: '18px 18px 4px 18px',
						background: `linear-gradient(135deg, ${tokens.brand.main} 0%, ${tokens.brand.deep} 100%)`,
						color: tokens.ink.inverse,
						boxShadow: `0 2px 8px ${alpha(tokens.brand.main, 0.25)}`,
					}}>
						<Typography sx={{ fontSize: tokens.fontSize.body2, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{run.goal}</Typography>
					</Box>
				</Box>
			)}

			<Box sx={{
				border: `1px solid ${tokens.line.main}`,
				borderRadius: 2,
				backgroundColor: tokens.surface.paper,
				overflow: 'hidden',
			}}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.75, py: 1, borderBottom: `1px solid ${tokens.line.main}` }}>
					<SmartToyOutlinedIcon sx={{ fontSize: tokens.iconSize.md, color: tokens.brand.text }} />
					<Typography sx={{ fontSize: tokens.fontSize.caption, fontWeight: 700, color: tokens.ink.strong, flex: 1 }}>
						{t('menu.copilot', 'Copilot')}
					</Typography>
					<RunStatusChip status={run.status} />
					{working && run.canCancel && onCancel && (
						<Button size="small" onClick={() => onCancel(run.id)} sx={{ fontSize: tokens.fontSize.micro, minWidth: 0 }}>
							{t('copilot.run.cancel')}
						</Button>
					)}
				</Box>
				{working && <LinearProgress sx={{ height: 2 }} />}

				<Box sx={{ px: 1.75, py: 1.25, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
					{working && !run.steps?.length && (
						<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle }}>
							{t(run.status === RUN_STATUS.QUEUED ? 'copilot.run.queued' : 'copilot.run.working')}
						</Typography>
					)}
					<AgentRunTimeline steps={run.steps} onLinkClick={onLinkClick} />
					<AgentActionCards run={run} onRunUpdate={onRunUpdate} />
					{run.status === RUN_STATUS.COMPLETED && run.finalAnswer && (
						<Box data-testid="copilot-answer" sx={{ pt: run.steps?.length ? 1 : 0, borderTop: run.steps?.length ? `1px dashed ${tokens.line.main}` : 'none' }}>
							<ChatMarkdown content={run.finalAnswer} />
						</Box>
					)}
					{run.stoppedEarly && (
						<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.status.warning.text }}>
							{t('copilot.run.stoppedEarly')}
						</Typography>
					)}
					{run.status === RUN_STATUS.FAILED && (
						<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.status.error.text }}>
							{failureMessage(t, run)}
						</Typography>
					)}
					{run.status === RUN_STATUS.EXPIRED && (
						<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle }}>
							{t('copilot.run.expired')}
						</Typography>
					)}
					{run.status === RUN_STATUS.CANCELLED && (
						<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle }}>
							{t('copilot.run.cancelled')}
						</Typography>
					)}
				</Box>
			</Box>
		</Box>
	);
};

AgentRunCard.propTypes = {
	run: PropTypes.shape({
		id: PropTypes.string,
		goal: PropTypes.string,
		status: PropTypes.string,
		steps: PropTypes.array,
		finalAnswer: PropTypes.string,
		failureReason: PropTypes.string,
		stoppedEarly: PropTypes.bool,
		canCancel: PropTypes.bool,
	}).isRequired,
	onCancel: PropTypes.func,
	onLinkClick: PropTypes.func,
	onRunUpdate: PropTypes.func,
	showGoal: PropTypes.bool,
};

export default AgentRunCard;
