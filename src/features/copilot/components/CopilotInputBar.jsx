import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles';
import MentionInput from '../../intelligence/components/MentionInput.jsx';
import * as tokens from '../../../theme/tokens.js';
import { MAX_GOAL_LENGTH } from '../model/agentRun.js';

/** Task box with @candidate / #job mentions. Disabled while a task of this user is still working. */
const CopilotInputBar = ({ goal, setGoal, mentions, setMentions, submit, disabled, focusToken, error }) => {
	const { t } = useTranslation();
	const tooLong = goal.length > MAX_GOAL_LENGTH;
	return (
		<Box sx={{ px: { xs: 2, md: 3 }, py: 1.5, backgroundColor: tokens.surface.paper, borderTop: `1px solid ${tokens.line.main}`, flexShrink: 0 }}>
			<Box sx={{ maxWidth: 820, mx: 'auto' }}>
				{error && (
					<Typography role="alert" data-testid="copilot-error" sx={{
						fontSize: tokens.fontSize.caption, color: tokens.status.error.text, backgroundColor: tokens.status.error.tint,
						border: `1px solid ${tokens.status.error.border}`, borderRadius: 1.5, px: 1.5, py: 0.75, mb: 1,
					}}>
						{error}
					</Typography>
				)}
				<Box sx={{
					backgroundColor: tokens.surface.subtle,
					border: `1.5px solid ${tooLong ? tokens.status.error.main : tokens.line.main}`,
					borderRadius: 3,
					px: 1.5,
					py: 0.75,
					'&:focus-within': {
						borderColor: tooLong ? tokens.status.error.main : tokens.brand.main,
						boxShadow: `0 0 0 3px ${alpha(tokens.brand.main, 0.1)}`,
						backgroundColor: tokens.surface.paper,
					},
				}}>
					<MentionInput
						value={goal}
						onChange={setGoal}
						mentions={mentions}
						onMentionsChange={setMentions}
						onSubmit={() => submit()}
						disabled={disabled}
						placeholder={t('copilot.input.placeholder')}
						focusToken={focusToken}
					/>
				</Box>
				<Typography sx={{ fontSize: tokens.fontSize.micro, color: tooLong ? tokens.status.error.text : tokens.ink.faintest, textAlign: 'center', mt: 0.6 }}>
					{tooLong ? t('copilot.input.tooLong', { max: MAX_GOAL_LENGTH }) : t('copilot.input.hint')}
				</Typography>
			</Box>
		</Box>
	);
};

CopilotInputBar.propTypes = {
	goal: PropTypes.string.isRequired,
	setGoal: PropTypes.func.isRequired,
	mentions: PropTypes.array.isRequired,
	setMentions: PropTypes.func.isRequired,
	submit: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
	focusToken: PropTypes.any,
	error: PropTypes.string,
};

export default CopilotInputBar;
