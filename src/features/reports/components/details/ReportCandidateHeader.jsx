import PropTypes from 'prop-types';
import { Avatar, Box, Typography } from '@mui/material';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import { THEME_GREEN } from '../../model/reportDetails.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** Candidate name, role and final score; sticky on screen, printed with the report. */
const ReportCandidateHeader = ({ candidate, jobTitle, nameInitials }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			display: 'flex', alignItems: 'center', gap: 2,
			px: 3, py: 1.5, flexShrink: 0,
			backgroundColor: tokens.surface.paper, borderBottom: `1px solid ${tokens.line.main}`,
			position: 'sticky', top: 0, zIndex: 1,
		}}>
			<Avatar sx={{ width: 40, height: 40, fontSize: tokens.fontSize.body2, fontWeight: 700, backgroundColor: THEME_GREEN, color: tokens.ink.inverse }}>
				{nameInitials}
			</Avatar>
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Typography sx={{ fontWeight: 700, fontSize: tokens.fontSize.body, color: tokens.ink.strong, lineHeight: 1.3 }}>
					{candidate.candidateName}
					{candidate.nbYearsExperience != null && (
						<Typography component="span" sx={{ fontSize: tokens.fontSize.small, fontWeight: 400, color: tokens.ink.muted, ml: 1 }}>
							• {candidate.nbYearsExperience} {t('appCVContent.yearsAbbr')} {t('appCVContent.experience')}
						</Typography>
					)}
				</Typography>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
					<WorkOutlineOutlinedIcon sx={{ fontSize: tokens.iconSize.xs, color: tokens.ink.subtle }} />
					<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.muted }}>{jobTitle}</Typography>
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
