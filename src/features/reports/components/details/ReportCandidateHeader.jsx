import PropTypes from 'prop-types';
import { Avatar, Box, Typography } from '@mui/material';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import { THEME_GREEN } from '../../model/reportDetails.js';
import { useTranslation } from 'react-i18next';

/** Candidate name, role and final score; sticky on screen, printed with the report. */
const ReportCandidateHeader = ({ candidate, jobTitle, nameInitials }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			display: 'flex', alignItems: 'center', gap: 2,
			px: 3, py: 1.5, flexShrink: 0,
			backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0',
			position: 'sticky', top: 0, zIndex: 1,
		}}>
			<Avatar sx={{ width: 40, height: 40, fontSize: '0.85rem', fontWeight: 700, backgroundColor: THEME_GREEN, color: '#fff' }}>
				{nameInitials}
			</Avatar>
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.3 }}>
					{candidate.candidateName}
					{candidate.nbYearsExperience != null && (
						<Typography component="span" sx={{ fontSize: '0.78rem', fontWeight: 400, color: '#64748b', ml: 1 }}>
							• {candidate.nbYearsExperience} {t('appCVContent.yearsAbbr')} {t('appCVContent.experience')}
						</Typography>
					)}
				</Typography>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
					<WorkOutlineOutlinedIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
					<Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{jobTitle}</Typography>
				</Box>
			</Box>
		</Box>
		</>
	);
};

ReportCandidateHeader.propTypes = {
	candidate: PropTypes.any,
	jobTitle: PropTypes.any,
	nameInitials: PropTypes.any,
};

export default ReportCandidateHeader;
