import PropTypes from 'prop-types';
import SectionHeader from '../../../../shared/ui/SectionHeader.jsx';
import { Box, Typography, Grid2 } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Card from './Card.jsx';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** Projects and achievements. */
const ProjectsSection = ({ projectsAndAchievements }) => {
	const { t } = useTranslation();
	return (
		<>
		{projectsAndAchievements.length > 0 && (
			<Card sx={{ mb: 2 }}>
				<SectionHeader tone="document" icon={EmojiEventsIcon} label={t('appCVContent.projectsAndAchievements')} />
				<Grid2 container spacing={1.5}>
					{projectsAndAchievements.map((project, i) => (
						<Grid2 key={i} size={{ xs: 12, sm: 6 }}>
							<Box sx={{ p: 1.5, textAlign: 'left', backgroundColor: tokens.surface.subtle, borderRadius: 1.5, border: `1px solid ${tokens.surface.muted}` }}>
								<Typography sx={{ fontWeight: 700, fontSize: tokens.fontSize.body2, color: tokens.ink.strong }}>
									{project.title}
								</Typography>
								{project.description && (
									<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.muted, mt: 0.5, lineHeight: 1.6 }}>
										{project.description}
									</Typography>
								)}
								<Box sx={{ display: 'flex', gap: 1, mt: 0.75, flexWrap: 'wrap' }}>
									{project.date && (
										<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle }}>{project.date}</Typography>
									)}
									{project.impact && (
										<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.brand.text, fontWeight: 600 }}>
											{project.impact}
										</Typography>
									)}
								</Box>
							</Box>
						</Grid2>
					))}
				</Grid2>
			</Card>
		)}
		</>
	);
};

ProjectsSection.propTypes = {
	projectsAndAchievements: PropTypes.any,
};

export default ProjectsSection;
