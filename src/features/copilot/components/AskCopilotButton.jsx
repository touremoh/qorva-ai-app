import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAgentRun } from '../../../contexts/AgentRunContext.jsx';
import { copilotLink } from '../model/focus.js';
import * as tokens from '../../../theme/tokens.js';

/**
 * Opens Copilot about this candidate — for this job when there is one (the conversation's focus), otherwise with
 * the candidate mentioned. Hidden when Copilot is off and inside Copilot itself.
 */
const AskCopilotButton = ({ cvId, jobPostId }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { available } = useAgentRun();
	if (!available || !cvId || pathname.startsWith('/app/copilot')) return null;
	return (
		<Tooltip title={t(jobPostId ? 'copilot.ask.aboutCandidateForJob' : 'copilot.ask.aboutCandidate')}>
			<IconButton
				size="small"
				data-testid="ask-copilot"
				aria-label={t(jobPostId ? 'copilot.ask.aboutCandidateForJob' : 'copilot.ask.aboutCandidate')}
				onClick={() => navigate(copilotLink({ cvId, jobPostId }))}
				sx={{
					color: tokens.brand.text, borderRadius: 1.5,
					border: `1px solid ${tokens.line.main}`, mr: 1,
					'&:hover': { backgroundColor: tokens.surface.muted },
				}}
			>
				<AutoAwesomeOutlinedIcon sx={{ fontSize: tokens.iconSize.md }} />
			</IconButton>
		</Tooltip>
	);
};

AskCopilotButton.propTypes = {
	cvId: PropTypes.string,
	jobPostId: PropTypes.string,
};

export default AskCopilotButton;
