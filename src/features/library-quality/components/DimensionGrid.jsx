import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import DimensionCard from './DimensionCard.jsx';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';

/** The four quality dimensions: completeness, freshness, uniqueness, parse confidence. */
const DimensionGrid = ({ confidenceMetrics, report, uniquenessMetrics }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
			<DimensionCard
				label={t('libraryQuality.dimensions.completeness', 'Completeness')}
				score={report.completeness.score}
				icon={ChecklistOutlinedIcon} accent={tokens.status.info.blue} bg="rgba(59,130,246,0.08)">
				<Typography sx={{ fontSize: '0.68rem', color: tokens.ink.muted }}>
					{t('libraryQuality.dimensions.completenessHint', 'Contact details and profile data present on your resumes.')}
				</Typography>
			</DimensionCard>

			<DimensionCard
				label={t('libraryQuality.dimensions.freshness', 'Freshness')}
				score={report.freshness.score}
				icon={UpdateOutlinedIcon} accent={tokens.brand.text} bg="rgba(98,156,68,0.08)">
				<Typography sx={{ fontSize: '0.68rem', color: tokens.ink.muted }}>
					{t('libraryQuality.dimensions.freshnessHint', 'How current the resume content actually is.')}
				</Typography>
			</DimensionCard>

			<DimensionCard
				label={t('libraryQuality.dimensions.uniqueness', 'Uniqueness')}
				score={report.uniqueness.score}
				icon={ContentCopyOutlinedIcon} accent={tokens.status.accent.purple} bg="rgba(139,92,246,0.08)">
				<Typography sx={{ fontSize: '0.68rem', color: tokens.ink.muted }}>
					{t('libraryQuality.dimensions.uniquenessHint', '{{count}} duplicate groups detected.', { count: uniquenessMetrics.duplicateGroups?.count ?? 0 })}
				</Typography>
			</DimensionCard>

			<DimensionCard
				label={t('libraryQuality.dimensions.parseConfidence', 'AI Confidence')}
				score={report.parseConfidence.score}
				icon={PsychologyOutlinedIcon} accent={tokens.status.warning.bright} bg="rgba(245,158,11,0.08)">
				<Typography sx={{ fontSize: '0.68rem', color: tokens.ink.muted }}>
					{t('libraryQuality.dimensions.parseConfidenceHint', '{{count}} resumes need review.', { count: (confidenceMetrics.lowConfidence?.count ?? 0) + (confidenceMetrics.missingAnalysis?.count ?? 0) })}
				</Typography>
			</DimensionCard>
		</Box>
		</>
	);
};

DimensionGrid.propTypes = {
	confidenceMetrics: PropTypes.any,
	report: PropTypes.any,
	uniquenessMetrics: PropTypes.any,
};

export default DimensionGrid;
