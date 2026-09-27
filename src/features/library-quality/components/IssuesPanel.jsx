import PropTypes from 'prop-types';
import SectionHeader from '../../../shared/ui/SectionHeader.jsx';
import { Box, Button, Chip, Collapse, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import QualityIssueList from './QualityIssueList.jsx';
import QualityDuplicatesList from './QualityDuplicatesList.jsx';
import { ARCHIVABLE_ISSUES, REANALYZABLE_ISSUES, ACTIVE_JOB_STATUSES, SEVERITY_CHIP } from '../model/libraryQuality.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';

/** The quality issues found, each with its fix actions and its affected resumes. */
const IssuesPanel = ({ activeJob, expandedIssue, fetchReport, handleCampaignRequest, handleDismissToggle, handleIssueAction, handleReanalyzeRequest, report, setArchiveConfirm }) => {
	const { t } = useTranslation();
	return (
		<>
		<Paper elevation={0} sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, p: 2.5 }}>
			<SectionHeader sx={{ pb: 1.5 }} icon={ReportProblemOutlinedIcon} label={t('libraryQuality.sections.issues', 'Issues To Fix')} />
			{report.issues.length === 0 ? (
				<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.brand.text, fontWeight: 600 }}>
					{t('libraryQuality.noIssues', 'No issues found — your library is in great shape!')}
				</Typography>
			) : (() => {
				const openIssues = report.issues.filter(i => !i.dismissed);
				const dismissedIssues = report.issues.filter(i => i.dismissed);
				const renderIssueRow = (issue, index, list) => {
					const chip = SEVERITY_CHIP[issue.severity] ?? SEVERITY_CHIP.MEDIUM;
					const isDuplicates = issue.issueKey === 'DUPLICATES';
					const isExpanded = expandedIssue === issue.issueKey;
					return (
						<Box key={issue.issueKey} sx={{ borderBottom: index < list.length - 1 ? `1px solid ${tokens.surface.muted}` : 'none', opacity: issue.dismissed ? 0.6 : 1 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 1.1 }}>
								<Chip
									label={t(`libraryQuality.severity.${issue.severity}`, issue.severity)}
									size="small"
									sx={{ backgroundColor: chip.bg, color: chip.color, fontWeight: 700, fontSize: tokens.fontSize.micro, height: 20 }}
								/>
								<Typography sx={{ flex: 1, fontSize: tokens.fontSize.body2, color: tokens.ink.body, fontWeight: 500, minWidth: 0 }}>
									{t(`libraryQuality.issues.${issue.issueKey}`, issue.issueKey)}
								</Typography>
								<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.strong, fontWeight: 800 }}>
									{issue.count}
								</Typography>
								{!issue.dismissed && REANALYZABLE_ISSUES.has(issue.issueKey) && (
									<Button
										size="small"
										disabled={Boolean(activeJob && ACTIVE_JOB_STATUSES.has(activeJob.status))}
										startIcon={<AutorenewRoundedIcon sx={{ fontSize: tokens.iconSize.xs }} />}
										onClick={() => handleReanalyzeRequest(issue)}
										sx={{ fontSize: tokens.fontSize.caption, fontWeight: 600, textTransform: 'none', color: tokens.ink.muted }}
									>
										{t('libraryQuality.jobs.reanalyzeAll', 'Re-analyze all')}
									</Button>
								)}
								{!issue.dismissed && ARCHIVABLE_ISSUES.has(issue.issueKey) && (
									<Button
										size="small"
										disabled={Boolean(activeJob && ACTIVE_JOB_STATUSES.has(activeJob.status))}
										startIcon={<SendOutlinedIcon sx={{ fontSize: tokens.iconSize.xs }} />}
										onClick={() => handleCampaignRequest(issue)}
										sx={{ fontSize: tokens.fontSize.caption, fontWeight: 600, textTransform: 'none', color: tokens.ink.muted }}
									>
										{t('libraryQuality.campaign.requestUpdates', 'Request updates')}
									</Button>
								)}
								{!issue.dismissed && ARCHIVABLE_ISSUES.has(issue.issueKey) && (
									<Button
										size="small"
										startIcon={<Inventory2OutlinedIcon sx={{ fontSize: tokens.iconSize.xs }} />}
										onClick={() => setArchiveConfirm(issue)}
										sx={{ fontSize: tokens.fontSize.caption, fontWeight: 600, textTransform: 'none', color: tokens.ink.muted }}
									>
										{t('libraryQuality.archiveAll', 'Archive all')}
									</Button>
								)}
								<Button
									size="small"
									onClick={() => handleIssueAction(issue)}
									endIcon={isExpanded ? <ExpandLessRoundedIcon sx={{ fontSize: tokens.iconSize.md }} /> : <ExpandMoreRoundedIcon sx={{ fontSize: tokens.iconSize.md }} />}
									sx={{ fontSize: tokens.fontSize.caption, fontWeight: 600, textTransform: 'none', color: tokens.brand.text }}
								>
									{t('libraryQuality.view', 'View')}
								</Button>
								<Tooltip title={issue.dismissed
									? t('libraryQuality.reopen', 'Reopen this issue')
									: t('libraryQuality.dismiss', 'Dismiss — accepted, hide from open issues')}>
									<IconButton size="small" onClick={() => handleDismissToggle(issue)} sx={{ color: tokens.ink.subtle }}>
										{issue.dismissed
											? <RestoreOutlinedIcon sx={{ fontSize: tokens.iconSize.md }} />
											: <VisibilityOffOutlinedIcon sx={{ fontSize: tokens.iconSize.md }} />}
									</IconButton>
								</Tooltip>
							</Box>
							<Collapse in={isExpanded} timeout="auto" unmountOnExit>
								<Box sx={{ pb: 1.5, pl: 1 }}>
									{isDuplicates
										? <QualityDuplicatesList onChanged={fetchReport} />
										: <QualityIssueList issueKey={issue.issueKey} onChanged={fetchReport} />}
								</Box>
							</Collapse>
						</Box>
					);
				};
				return (
					<Box sx={{ display: 'flex', flexDirection: 'column' }}>
						{openIssues.map((issue, i) => renderIssueRow(issue, i, openIssues))}
						{dismissedIssues.length > 0 && (
							<>
								<Typography sx={{ fontSize: tokens.fontSize.caption, fontWeight: 700, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.05em', mt: 2, mb: 0.5 }}>
									{t('libraryQuality.dismissedSection', 'Dismissed ({{count}})', { count: dismissedIssues.length })}
								</Typography>
								{dismissedIssues.map((issue, i) => renderIssueRow(issue, i, dismissedIssues))}
							</>
						)}
					</Box>
				);
			})()}
		</Paper>
		</>
	);
};

IssuesPanel.propTypes = {
	activeJob: PropTypes.any,
	expandedIssue: PropTypes.any,
	fetchReport: PropTypes.any,
	handleCampaignRequest: PropTypes.func,
	handleDismissToggle: PropTypes.func,
	handleIssueAction: PropTypes.func,
	handleReanalyzeRequest: PropTypes.func,
	report: PropTypes.any,
	setArchiveConfirm: PropTypes.func,
};

export default IssuesPanel;
