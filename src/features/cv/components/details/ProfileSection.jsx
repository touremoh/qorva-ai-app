import PropTypes from 'prop-types';
import SectionHeader from '../../../../shared/ui/SectionHeader.jsx';
import { Box, Typography, Chip } from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import Card from './Card.jsx';
import { softSkillChipSx, availLabelSx } from '../../model/cvDetailsStyles.js';
import { useTranslation } from 'react-i18next';

/** Areas of expertise and key responsibilities. */
const ProfileSection = ({ profiles }) => {
	const { t } = useTranslation();
	return (
		<>
		{(profiles?.areasOfExpertise?.length > 0 || profiles?.keyResponsibilities?.length > 0) && (
			<Card sx={{ mb: 2 }}>
				<SectionHeader tone="document" icon={PersonOutlinedIcon} label={t('appCVContent.profiles', 'Profile')} />
				{profiles.areasOfExpertise?.length > 0 && (
					<Box sx={{ mb: profiles.keyResponsibilities?.length > 0 ? 1.5 : 0 }}>
						<Typography sx={availLabelSx}>{t('appCVContent.areasOfExpertise', 'Areas of Expertise')}</Typography>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mt: 0.5 }}>
							{profiles.areasOfExpertise.map((area, i) => (
								<Chip key={i} label={area} size="small" sx={softSkillChipSx} />
							))}
						</Box>
					</Box>
				)}
				{profiles.keyResponsibilities?.length > 0 && (
					<Box>
						<Typography sx={availLabelSx}>{t('appCVContent.keyResponsibilities', 'Key Responsibilities')}</Typography>
						<Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2, listStyleType: 'disc' }}>
							{profiles.keyResponsibilities.map((resp, i) => (
								<Box component="li" key={i} sx={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.7, mb: 0.25 }}>
									{resp}
								</Box>
							))}
						</Box>
					</Box>
				)}
			</Card>
		)}
		</>
	);
};

ProfileSection.propTypes = {
	profiles: PropTypes.any,
};

export default ProfileSection;
