import PropTypes from 'prop-types';
import SectionHeader from '../../../../shared/ui/SectionHeader.jsx';
import { Box, Chip } from '@mui/material';
import DownhillSkiingIcon from '@mui/icons-material/DownhillSkiing';
import Card from './Card.jsx';
import { softSkillChipSx } from '../../model/cvDetailsStyles.js';
import { useTranslation } from 'react-i18next';

/** Interests and hobbies. */
const InterestsSection = ({ interestsAndHobbies }) => {
	const { t } = useTranslation();
	return (
		<>
		{interestsAndHobbies.length > 0 && (
			<Card sx={{ mb: 2 }}>
				<SectionHeader tone="document" icon={DownhillSkiingIcon} label={t('appCVContent.interestsAndHobbies')} />
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
					{interestsAndHobbies.map((h, i) => (
						<Chip key={i} label={h} size="small" sx={softSkillChipSx} />
					))}
				</Box>
			</Card>
		)}
		</>
	);
};

InterestsSection.propTypes = {
	interestsAndHobbies: PropTypes.any,
};

export default InterestsSection;
