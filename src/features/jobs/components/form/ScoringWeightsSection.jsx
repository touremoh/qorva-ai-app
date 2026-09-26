import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import SectionTitle from './SectionTitle.jsx';
import SliderRow from './SliderRow.jsx';
import { THEME_GREEN } from '../../model/jobForm.js';
import { useTranslation } from 'react-i18next';

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
			<Typography sx={{ fontSize: '0.76rem', color: '#94a3b8' }}>
				{t('jobContent.totalWeight')}:
			</Typography>
			<Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: weightOk ? THEME_GREEN : '#f59e0b' }}>
				{weightTotal}%
			</Typography>
			{!weightOk && (
				<Typography sx={{ fontSize: '0.72rem', color: '#f59e0b' }}>
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
