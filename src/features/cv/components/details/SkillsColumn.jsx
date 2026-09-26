import PropTypes from 'prop-types';
import SectionHeader from '../../../../shared/ui/SectionHeader.jsx';
import { Box, Typography, Chip, Grid2, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import TranslateIcon from '@mui/icons-material/Translate';
import Card from './Card.jsx';
import { techSkillChipSx, softSkillChipSx, langThSx } from '../../model/cvDetailsStyles.js';
import { useTranslation } from 'react-i18next';

/** Right column: key, technical and soft skills, languages, certifications. */
const SkillsColumn = ({ certifications, keySkills, skills }) => {
	const { t } = useTranslation();
	return (
		<>
		<Grid2 size={{ xs: 12, md: 5 }}>
			{keySkills.length > 0 && (
				<Card sx={{ mb: 2 }}>
					<SectionHeader tone="document" icon={ConstructionIcon} label={t('appCVContent.keySkills', 'Key Skills')} />
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
						{keySkills.map((group, i) => (
							<Box key={i}>
								<Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', mb: 0.5 }}>
									{group.category}
								</Typography>
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
									{(group.skills ?? []).map((skill, j) => (
										<Chip key={j} label={skill} size="small" sx={techSkillChipSx} />
									))}
								</Box>
							</Box>
						))}
					</Box>
				</Card>
			)}

			{skills.technicalSkills?.length > 0 && (
				<Card sx={{ mb: 2 }}>
					<SectionHeader tone="document" icon={ConstructionIcon} label={t('appCVContent.technicalSkills')} />
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
						{skills.technicalSkills.map((s, i) => (
							<Chip key={i} label={s} size="small" sx={techSkillChipSx} />
						))}
					</Box>
				</Card>
			)}

			{skills.softSkills?.length > 0 && (
				<Card sx={{ mb: 2 }}>
					<SectionHeader tone="document" icon={PeopleOutlinedIcon} label={t('appCVContent.softSkills')} />
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
						{skills.softSkills.map((s, i) => (
							<Chip key={i} label={s} size="small" sx={softSkillChipSx} />
						))}
					</Box>
				</Card>
			)}

			{skills.languages?.length > 0 && (
				<Card sx={{ mb: 2 }}>
					<SectionHeader tone="document" icon={TranslateIcon} label={t('appCVContent.languages')} />
					<TableContainer>
						<Table size="small">
							<TableHead>
								<TableRow>
									<TableCell sx={langThSx}>{t('appCVContent.proficiency.langProfTitle')}</TableCell>
									<TableCell sx={langThSx} align="center">{t('appCVContent.proficiency.read')}</TableCell>
									<TableCell sx={langThSx} align="center">{t('appCVContent.proficiency.written')}</TableCell>
									<TableCell sx={langThSx} align="center">{t('appCVContent.proficiency.spoken')}</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{skills.languages.map((lang, i) => (
									<TableRow key={i} sx={{ '&:last-child td': { borderBottom: 0 } }}>
										<TableCell sx={{ fontSize: '0.78rem', py: 0.75, fontWeight: 600 }}>{lang.language}</TableCell>
										<TableCell sx={{ fontSize: '0.78rem', py: 0.75 }} align="center">{lang.proficiency?.read || '—'}</TableCell>
										<TableCell sx={{ fontSize: '0.78rem', py: 0.75 }} align="center">{lang.proficiency?.written || '—'}</TableCell>
										<TableCell sx={{ fontSize: '0.78rem', py: 0.75 }} align="center">{lang.proficiency?.spoken || '—'}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Card>
			)}

			{certifications.length > 0 && (
				<Card>
					<SectionHeader tone="document" icon={WorkspacePremiumIcon} label={t('appCVContent.certifications')} />
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
						{certifications.map((cert, i) => (
							<Box key={i} sx={{ textAlign: 'left', ...(i > 0 ? { pt: 1.5, borderTop: '1px solid #f1f5f9' } : {}) }}>
								<Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
									{cert.title}
								</Typography>
								<Typography sx={{ fontSize: '0.78rem', color: '#629C44', fontWeight: 600 }}>
									{cert.institution}
								</Typography>
								{cert.year && (
									<Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>{cert.year}</Typography>
								)}
								{cert.description && (
									<Typography sx={{ fontSize: '0.78rem', color: '#64748b', mt: 0.25 }}>
										{cert.description}
									</Typography>
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

SkillsColumn.propTypes = {
	certifications: PropTypes.any,
	keySkills: PropTypes.any,
	skills: PropTypes.any,
};

export default SkillsColumn;
