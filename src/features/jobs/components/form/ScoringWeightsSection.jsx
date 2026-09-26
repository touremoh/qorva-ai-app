import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import SectionTitle from './SectionTitle.jsx';
import SliderRow from './SliderRow.jsx';
import { THEME_GREEN } from '../../model/jobForm.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** Sliders weighting skills, experience, location and industry; they must add up to 100. */
const ScoringWeightsSection = ({ sc, setWeights, weightOk, weightTotal }) => {
	const { t } = useTranslation();
	return (
		<>
		<SectionTitle label={t('jobContent.scoringWeights')} />
		<Box sx={{ display: 'flex', gap: { xs: 2, sm: 4 }, flexWrap: 'wrap', mb: 0.5 }}>
			{[
				{ key: 'skills', label: t('jobContent.weightSkills') },
				{ key: 'experience', label: t('jobContent.weightExperience') },
				{ key: 'location', label: t('jobContent.weightLocation') },
				{ key: 'industry', label: t('jobContent.weightIndustry') },
			].map(({ key, label }) => (
				<Box key={key} sx={{ flex: '1 1 140px', minWidth: 120 }}>
					<SliderRow
						label={label} value={sc.scoringWeight[key]}
						onChange={(v) => setWeights({ [key]: v })}
						min={0} max={100} step={5} format={(v) => `${v}%`}
					/>
				</Box>
			))}
		</Box>
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
			<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.subtle }}>
				{t('jobContent.totalWeight')}:
			</Typography>
			<Typography sx={{ fontSize: tokens.fontSize.small, fontWeight: 700, color: weightOk ? THEME_GREEN : `${tokens.status.warning.bright}` }}>
				{weightTotal}%
			</Typography>
			{!weightOk && (
				<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.status.warning.bright }}>
					(should be 100%)
				</Typography>
			)}
		</Box>

		</>
	);
};

ScoringWeightsSection.propTypes = {
	sc: PropTypes.any,
	setWeights: PropTypes.func,
	weightOk: PropTypes.any,
	weightTotal: PropTypes.any,
};

export default ScoringWeightsSection;
