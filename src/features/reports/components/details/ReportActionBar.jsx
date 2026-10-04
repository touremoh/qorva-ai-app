import PropTypes from 'prop-types';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';
import dayjs from '../../../../shared/lib/dayjs.js';
import ReportStatusChip from '../status/ReportStatusChip.jsx';
import { lastMove } from '../../model/reportStatus.js';

/**
 * Above the report (not printed): where the candidate stands on the job and who moved them last, then the
 * email-candidate and download actions.
 */
const ReportActionBar = ({ canContact, candidate, finalScore, handleDownload, jobTitle, onStatusChange, outreach, reportData }) => {
	const { t, i18n } = useTranslation();
	const move = lastMove(reportData);
	return (
		<>
		<Box sx={{
			display: 'flex', alignItems: 'center',
			px: 2.5, py: 1.25, flexShrink: 0,
			backgroundColor: tokens.surface.paper, borderBottom: `1px solid ${tokens.line.main}`,
		}}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexGrow: 1, minWidth: 0 }}>
				<ReportStatusChip report={reportData} onChange={onStatusChange} size="medium" />
				{move && (
					<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
						{t(`reportStatus.movedVia.${move.via ?? 'APP'}`, {
							status: t(`reportStatus.values.${move.status}`),
							name: move.byName ?? '',
							date: dayjs(move.at).locale(i18n.language?.slice(0, 2) || 'en').format('D MMM'),
						})}
					</Typography>
				)}
			</Box>
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
	onStatusChange: PropTypes.func,
	outreach: PropTypes.any,
	reportData: PropTypes.any,
};

export default ReportActionBar;
