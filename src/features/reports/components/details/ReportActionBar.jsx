import PropTypes from 'prop-types';
import { Box, IconButton, Tooltip } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** Email-candidate and download actions above the report (not printed). */
const ReportActionBar = ({ canContact, candidate, finalScore, handleDownload, jobTitle, outreach, reportData }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			display: 'flex', alignItems: 'center',
			px: 2.5, py: 1.25, flexShrink: 0,
			backgroundColor: tokens.surface.paper, borderBottom: `1px solid ${tokens.line.main}`,
		}}>
			<Box sx={{ flexGrow: 1 }} />
			{canContact && (
				<Tooltip title={t('candidateOutreach.emailCandidate')}>
					<IconButton
						size="small"
						onClick={() => outreach?.openComposer({
							cvId: candidate.candidateId,
							candidateName: candidate.candidateName,
							jobPostId: reportData.jobPostId,
							matchingReportId: reportData.id,
							jobTitle,
							score: finalScore,
						})}
						sx={{
							color: tokens.brand.text, borderRadius: 1.5,
							border: `1px solid ${tokens.line.main}`, mr: 1,
							'&:hover': { backgroundColor: tokens.surface.muted },
						}}
					>
						<MailOutlineIcon sx={{ fontSize: tokens.iconSize.md }} />
					</IconButton>
				</Tooltip>
			)}
			<Tooltip title={t('appCVContent.downloadCV')}>
				<IconButton
					size="small"
					onClick={handleDownload}
					sx={{
						color: tokens.ink.muted, borderRadius: 1.5,
						border: `1px solid ${tokens.line.main}`,
						'&:hover': { backgroundColor: tokens.surface.muted },
					}}
				>
					<FileDownloadIcon sx={{ fontSize: tokens.iconSize.md }} />
				</IconButton>
			</Tooltip>
		</Box>
		</>
	);
};

ReportActionBar.propTypes = {
	canContact: PropTypes.bool,
	candidate: PropTypes.any,
	finalScore: PropTypes.any,
	handleDownload: PropTypes.func,
	jobTitle: PropTypes.any,
	outreach: PropTypes.any,
	reportData: PropTypes.any,
};

export default ReportActionBar;
