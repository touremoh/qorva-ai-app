import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';
import { stepLine } from '../model/agentRun.js';

const StepIcon = ({ state }) => {
	if (state === 'EXECUTING') return <CircularProgress size={14} sx={{ color: tokens.brand.text }} />;
	if (state === 'OK') return <CheckCircleOutlineIcon sx={{ fontSize: tokens.iconSize.sm, color: tokens.status.success.main }} />;
	return <ErrorOutlineIcon sx={{ fontSize: tokens.iconSize.sm, color: tokens.status.error.main }} />;
};

StepIcon.propTypes = { state: PropTypes.string };

/** What the agent did, one line per tool call, with the records it touched as chips. */
const AgentRunTimeline = ({ steps, onLinkClick }) => {
	const { t } = useTranslation();
	if (!steps?.length) return null;
	return (
		<Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
			{steps.map((step) => (
				<Box component="li" key={step.seq} data-testid="copilot-step" sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
					<Box sx={{ pt: 0.25, display: 'flex' }}><StepIcon state={step.state} /></Box>
					<Box sx={{ minWidth: 0 }}>
						<Typography sx={{
							fontSize: tokens.fontSize.caption,
							color: step.state === 'ERROR' ? tokens.status.error.text : tokens.ink.body,
							lineHeight: 1.5,
						}}>
							{stepLine(t, step)}
						</Typography>
						{step.links?.length > 0 && (
							<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
								{step.links.map((link) => (
									<Chip
										key={`${link.type}:${link.id}`}
										size="small"
										variant="outlined"
										label={link.label || t(`copilot.link.${link.type}`, link.type)}
										onClick={link.type === 'CV' && onLinkClick ? () => onLinkClick(link) : undefined}
										sx={{ height: 22, fontSize: tokens.fontSize.micro, borderColor: tokens.line.main, color: tokens.ink.body }}
									/>
								))}
							</Box>
						)}
					</Box>
				</Box>
			))}
		</Box>
	);
};

AgentRunTimeline.propTypes = {
	steps: PropTypes.arrayOf(PropTypes.shape({
		seq: PropTypes.number,
		state: PropTypes.string,
		tool: PropTypes.string,
		summaryKey: PropTypes.string,
		summaryParams: PropTypes.object,
		links: PropTypes.array,
	})),
	onLinkClick: PropTypes.func,
};

export default AgentRunTimeline;
