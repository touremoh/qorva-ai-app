import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import MetricRow from './MetricRow.jsx';
import ChartSection from './ChartSection.jsx';
import CandidateSection from './CandidateSection.jsx';
import CandidateComparisonSection from './CandidateComparisonSection.jsx';
import DisclaimerBanner from './DisclaimerBanner.jsx';
import * as tokens from '../../../../theme/tokens.js';

/** What a library analysis computed, under Copilot's answer: metrics, charts, candidate cards or a comparison. */
const AnswerBlocks = ({ blocks, onCandidateClick }) => {
	const { t } = useTranslation();
	const { intent, metrics, charts, candidates, disclaimer, rawData } = blocks;
	const openCandidate = onCandidateClick ? (c) => c?.id && onCandidateClick({ type: 'CV', id: c.id, label: c.name }) : undefined;
	const section = { mt: 1.5, pt: 1.5, borderTop: `1px solid ${tokens.surface.muted}` };

	return (
		<Box data-testid="copilot-answer-blocks">
			<MetricRow metrics={metrics} />
			<ChartSection charts={charts} />
			{intent === 'CANDIDATE_COMPARISON' && candidates?.length > 0 ? (
				<Box sx={section}>
					<CandidateComparisonSection candidates={candidates} rawData={rawData ?? {}} onCandidateClick={openCandidate} />
				</Box>
			) : candidates?.length > 0 ? (
				<Box sx={section}>
					<Typography sx={{ fontSize: tokens.fontSize.micro, fontWeight: 700, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
						{t('insight.candidates', 'Candidates')}
					</Typography>
					<CandidateSection candidates={candidates} showRediscoveredTag={intent === 'CANDIDATE_REDISCOVERY'} onCandidateClick={openCandidate} />
				</Box>
			) : null}
			<DisclaimerBanner text={disclaimer} />
		</Box>
	);
};

AnswerBlocks.propTypes = {
	blocks: PropTypes.shape({
		intent: PropTypes.string,
		metrics: PropTypes.array,
		charts: PropTypes.array,
		candidates: PropTypes.array,
		disclaimer: PropTypes.string,
		rawData: PropTypes.object,
	}).isRequired,
	onCandidateClick: PropTypes.func,
};

export default AnswerBlocks;
