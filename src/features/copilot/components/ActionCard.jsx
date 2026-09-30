import { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles';
import { useAgentRun } from '../../../contexts/AgentRunContext.jsx';
import { useCandidateOutreach } from '../../../contexts/CandidateOutreachContext.jsx';
import { resolveError } from '../../../utils/errorHandler.js';
import * as tokens from '../../../theme/tokens.js';
import { ACTION_STATUS, emailEdits } from '../model/agentRun.js';
import { AtsSyncActionBody, EmailActionBody, ScreeningActionBody } from './ActionBodies.jsx';

const KIND = {
	send_outreach_email: { Icon: MailOutlineIcon, titleKey: 'copilot.action.email.title' },
	start_screening: { Icon: ManageSearchOutlinedIcon, titleKey: 'copilot.action.screening.title' },
	trigger_ats_sync: { Icon: SyncOutlinedIcon, titleKey: 'copilot.action.ats.title' },
};

/** One approval card. Nothing happens until the run's own user approves; decided cards stay visible, read-only. */
const ActionCard = ({ run, action, canDecide, onDecided }) => {
	const { t } = useTranslation();
	const { approveAction, rejectAction } = useAgentRun();
	const outreach = useCandidateOutreach();
	const preview = action.preview ?? {};
	const isEmail = action.tool === 'send_outreach_email';
	const [subject, setSubject] = useState(preview.subject ?? '');
	const [body, setBody] = useState(preview.body ?? '');
	const [rejecting, setRejecting] = useState(false);
	const [reason, setReason] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState(null);
	const kind = KIND[action.tool] ?? { Icon: SyncOutlinedIcon, titleKey: 'copilot.action.generic' };
	const pending = action.status === ACTION_STATUS.PENDING;
	const editable = canDecide && pending && isEmail;

	const decide = async (approve) => {
		setBusy(true);
		setError(null);
		try {
			const updated = approve
				? await approveAction(run, action, isEmail ? emailEdits(preview, subject, body) : {})
				: await rejectAction(run, action, reason.trim() || undefined);
			onDecided?.(updated);
		} catch (e) {
			setError(resolveError(e));
		} finally {
			setBusy(false);
		}
	};

	const openInComposer = () => outreach?.openComposer({
		cvId: preview.cvId, jobPostId: preview.jobId ?? undefined, draft: { subject, body },
	});

	return (
		<Box data-testid="copilot-action-card" sx={{
			border: `1px solid ${pending ? tokens.status.warning.border : tokens.line.main}`,
			backgroundColor: pending ? alpha(tokens.status.warning.bright, 0.06) : tokens.surface.paper,
			borderRadius: 2, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1,
		}}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				<kind.Icon sx={{ fontSize: tokens.iconSize.md, color: tokens.status.warning.text }} />
				<Typography sx={{ fontSize: tokens.fontSize.caption, fontWeight: 700, color: tokens.ink.strong, flex: 1 }}>
					{t(kind.titleKey, { tool: action.tool })}
				</Typography>
				{!pending && (
					<Chip size="small" label={t(`copilot.action.decided.${action.status}`, action.status)}
						sx={{ height: 20, fontSize: tokens.fontSize.micro }} />
				)}
			</Box>

			{isEmail && <EmailActionBody preview={preview} subject={subject} body={body} onSubject={setSubject} onBody={setBody} editable={editable} />}
			{action.tool === 'start_screening' && <ScreeningActionBody preview={preview} />}
			{action.tool === 'trigger_ats_sync' && <AtsSyncActionBody preview={preview} />}
			{action.status === ACTION_STATUS.REJECTED && action.reason && (
				<Typography sx={{ fontSize: tokens.fontSize.micro, color: tokens.ink.subtle }}>{t('copilot.action.reasonShown', { reason: action.reason })}</Typography>
			)}

			{error && <Typography role="alert" sx={{ fontSize: tokens.fontSize.micro, color: tokens.status.error.text }}>{error}</Typography>}

			{canDecide && pending && (
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
					{rejecting && (
						<TextField size="small" value={reason} onChange={(e) => setReason(e.target.value)} autoFocus
							placeholder={t('copilot.action.reasonPlaceholder')} inputProps={{ maxLength: 500, 'data-testid': 'copilot-action-reason' }} />
					)}
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'flex-end' }}>
						{isEmail && !rejecting && (
							<Button size="small" onClick={openInComposer} sx={{ mr: 'auto', textTransform: 'none' }}>{t('copilot.action.editInComposer')}</Button>
						)}
						{rejecting ? (
							<>
								<Button size="small" onClick={() => setRejecting(false)} disabled={busy} sx={{ textTransform: 'none' }}>{t('copilot.action.back')}</Button>
								<Button size="small" color="error" variant="outlined" onClick={() => decide(false)} disabled={busy}
									data-testid="copilot-action-confirm-reject" sx={{ textTransform: 'none' }}>{t('copilot.action.reject')}</Button>
							</>
						) : (
							<>
								<Button size="small" onClick={() => setRejecting(true)} disabled={busy} data-testid="copilot-action-reject"
									sx={{ textTransform: 'none' }}>{t('copilot.action.reject')}</Button>
								<Button size="small" variant="contained" onClick={() => decide(true)} disabled={busy || (isEmail && (!subject.trim() || !body.trim()))}
									data-testid="copilot-action-approve" sx={{ textTransform: 'none' }}>
									{t(isEmail ? 'copilot.action.approveSend' : 'copilot.action.approve')}
								</Button>
							</>
						)}
					</Box>
				</Box>
			)}
		</Box>
	);
};

ActionCard.propTypes = {
	run: PropTypes.object.isRequired,
	action: PropTypes.shape({
		actionId: PropTypes.string,
		tool: PropTypes.string,
		status: PropTypes.string,
		argsHash: PropTypes.string,
		preview: PropTypes.object,
		reason: PropTypes.string,
	}).isRequired,
	canDecide: PropTypes.bool,
	onDecided: PropTypes.func,
};

export default ActionCard;
