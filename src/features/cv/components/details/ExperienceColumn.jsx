import PropTypes from 'prop-types';
import SectionHeader from '../../../../shared/ui/SectionHeader.jsx';
import { Box, Typography, Chip, Grid2 } from '@mui/material';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import SchoolIcon from '@mui/icons-material/School';
import Card from './Card.jsx';
import { useTranslation } from 'react-i18next';

/** Left column: work experience and education. */
const ExperienceColumn = ({ education, workExperience }) => {
	const { t } = useTranslation();
	return (
		<>
		<Grid2 size={{ xs: 12, md: 7 }}>
			{workExperience.length > 0 && (
				<Card sx={{ mb: 2 }}>
					<SectionHeader tone="document" icon={WorkOutlineOutlinedIcon} label={t('appCVContent.workExperience')} />
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
						{workExperience.map((work, i) => (
							<Box key={i} sx={i > 0 ? { pt: 2.5, borderTop: '1px solid #f1f5f9' } : {}}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 0.5 }}>
									<Box>
										<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
											{work.position}
										</Typography>
										<Typography sx={{ fontSize: '0.82rem', color: '#629C44', fontWeight: 600 }}>
											{work.company}
										</Typography>
										{work.location && (
											<Typography sx={{ fontSize: '0.78rem', color: '#94a3b8' }}>
												{work.location}
											</Typography>
										)}
									</Box>
									<Chip
										label={`${work.from} – ${work.to}`}
										size="small"
										sx={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#64748b', height: 22, borderRadius: 0.75 }}
									/>
								</Box>
								{work.activities?.length > 0 && (
									<Box sx={{ mt: 1.25, pl: 2, borderLeft: '2px solid #e2e8f0' }}>
										{work.activities.map((act, j) => (
											<Box key={j} sx={{ mb: 1.25 }}>
												{act.project && (
													<Typography sx={{ fontSize: '0.80rem', fontWeight: 600, color: '#334155', mb: 0.5 }}>
														{act.project}
													</Typography>
												)}
												<Box component="ul" sx={{ m: 0, pl: 2, listStyleType: 'disc' }}>
													{act.tasks?.map((task, k) => (
														<Box component="li" key={k} sx={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.7, mb: 0.25 }}>
															{task}
														</Box>
													))}
												</Box>
											</Box>
										))}
									</Box>
								)}
							</Box>
						))}
					</Box>
				</Card>
			)}

			{education.length > 0 && (
				<Card>
					<SectionHeader tone="document" icon={SchoolIcon} label={t('appCVContent.education')} />
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						{education.map((edu, i) => (
							<Box key={i} sx={i > 0 ? { pt: 2, borderTop: '1px solid #f1f5f9' } : {}}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.5, alignItems: 'flex-start' }}>
									<Box sx={{ textAlign: 'left' }}>
										<Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
											{edu.degree}
										</Typography>
										<Typography sx={{ fontSize: '0.82rem', color: '#629C44', fontWeight: 600 }}>
											{edu.institution}
										</Typography>
										{edu.fieldOfStudy && (
											<Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
												{edu.fieldOfStudy}
											</Typography>
										)}
									</Box>
									{edu.year && (
										<Chip
											label={edu.year}
											size="small"
											sx={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#64748b', height: 22, borderRadius: 0.75 }}
										/>
									)}
								</Box>
								{edu.achievements?.length > 0 && (
									<Box component="ul" sx={{ m: 0, mt: 0.75, pl: 2, listStyleType: 'disc' }}>
										{edu.achievements.map((a, k) => (
											<Box component="li" key={k} sx={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.7, mb: 0.25 }}>
												{a}
											</Box>
										))}
									</Box>
								)}
							</Box>
						))}
					</Box>
				</Card>
			)}
		</Grid2>
		</>
	);
};

ExperienceColumn.propTypes = {
	education: PropTypes.any,
	workExperience: PropTypes.any,
};

export default ExperienceColumn;
