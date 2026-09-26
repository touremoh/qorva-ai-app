import PropTypes from 'prop-types';
import { Box, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import SectionTitle from './SectionTitle.jsx';
import { inputSx, selectSx } from '../../model/jobForm.js';
import { useTranslation } from 'react-i18next';

/** Minimum total and relevant years of experience, and seniority. */
const ExperienceSection = ({ sc, setExp }) => {
	const { t } = useTranslation();
	return (
		<>
		<SectionTitle label={t('jobContent.experienceRequirements')} />
		<Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
			<TextField size="small" type="number" label={t('jobContent.minYearsOfExperience')}
				value={sc.experienceRequirements.minYearsOfExperience}
				onChange={(e) => setExp({ minYearsOfExperience: e.target.value })}
				inputProps={{ min: 0 }} sx={{ ...inputSx, flex: '1 1 150px' }} />
			<TextField size="small" type="number" label={t('jobContent.minRelevantYears')}
				value={sc.experienceRequirements.minRelevantYears}
				onChange={(e) => setExp({ minRelevantYears: e.target.value })}
				inputProps={{ min: 0 }} sx={{ ...inputSx, flex: '1 1 150px' }} />
			<FormControl size="small" sx={{ flex: '1 1 140px' }}>
				<InputLabel sx={{ fontSize: '0.84rem' }}>{t('jobContent.seniorityLevel')}</InputLabel>
				<Select value={sc.experienceRequirements.seniorityLevel}
					onChange={(e) => setExp({ seniorityLevel: e.target.value })}
					label={t('jobContent.seniorityLevel')} sx={selectSx}>
					<MenuItem value="junior" sx={{ fontSize: '0.84rem' }}>{t('jobContent.junior')}</MenuItem>
					<MenuItem value="mid" sx={{ fontSize: '0.84rem' }}>{t('jobContent.mid')}</MenuItem>
					<MenuItem value="senior" sx={{ fontSize: '0.84rem' }}>{t('jobContent.senior')}</MenuItem>
				</Select>
			</FormControl>
		</Box>

		</>
	);
};

ExperienceSection.propTypes = {
	sc: PropTypes.any,
	setExp: PropTypes.func,
};

export default ExperienceSection;
