import PropTypes from 'prop-types';
import { Box, Button, Chip } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import { useTranslation } from 'react-i18next';
import AnswerMarkdown from '../../copilot/components/answer/AnswerMarkdown.jsx';
import { helpLinkLabelKey, helpLinkPath } from '../model/helpLinks.js';
import { outlinedButtonSx } from '../../../shared/ui/buttonSx.js';
import * as tokens from '../../../theme/tokens.js';

/**
 * One Qorva Help answer: markdown without links, then "Open …" buttons for the pages it names (known keys only),
 * follow-up chips, and "Contact support" when the assistant suggests it.
 */
const HelpAnswer = ({ message, onNavigate, onAsk, onContactSupport, disabled }) => {
	const { t } = useTranslation();
	const links = (message.links ?? []).filter((key) => helpLinkPath(key));
	return (
		<Box data-testid="help-answer" sx={{ mb: 2 }}>
			<AnswerMarkdown content={message.text} plainLinks />
			{(links.length > 0 || message.offerSupport) && (
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.25 }}>
					{links.map((key) => (
						<Button
							key={key}
							size="small"
							variant="outlined"
							endIcon={<ArrowForwardIcon sx={{ fontSize: tokens.iconSize.sm }} />}
							onClick={() => onNavigate(helpLinkPath(key))}
							sx={outlinedButtonSx(tokens.fontSize.caption)}
						>
							{t('help.openPage', { page: t(helpLinkLabelKey(key)) })}
						</Button>
					))}
					{message.offerSupport && (
						<Button
							size="small"
							variant="outlined"
							data-testid="help-answer-support"
							startIcon={<SupportAgentOutlinedIcon sx={{ fontSize: tokens.iconSize.sm }} />}
							onClick={onContactSupport}
							sx={{ ...outlinedButtonSx(tokens.fontSize.caption), color: tokens.brand.text, borderColor: tokens.brand.border }}
						>
							{t('help.contactSupport')}
						</Button>
					)}
				</Box>
			)}
			{message.followUps?.length > 0 && (
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.25 }}>
					{message.followUps.map((q) => (
						<Chip
							key={q}
							label={q}
							size="small"
							disabled={disabled}
							onClick={() => onAsk(q)}
							sx={{
								height: 'auto', py: 0.5, borderRadius: 2, backgroundColor: tokens.surface.muted, color: tokens.ink.body,
								fontSize: tokens.fontSize.caption, '& .MuiChip-label': { whiteSpace: 'normal' },
							}}
						/>
					))}
				</Box>
			)}
		</Box>
	);
};

HelpAnswer.propTypes = {
	message: PropTypes.shape({
		text: PropTypes.string,
		links: PropTypes.arrayOf(PropTypes.string),
		followUps: PropTypes.arrayOf(PropTypes.string),
		offerSupport: PropTypes.bool,
	}).isRequired,
	onNavigate: PropTypes.func.isRequired,
	onAsk: PropTypes.func.isRequired,
	onContactSupport: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
};

export default HelpAnswer;
