import PropTypes from 'prop-types';
import { getInitials } from '../../../../shared/lib/text.js';
import { Avatar, Box, Chip, IconButton, ListItemButton, Tooltip, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { scoreChipSx } from '../../model/reportList.js';
import { scoreDelta } from '../../model/matchingRun.js';
import dayjs from '../../../../shared/lib/dayjs.js';
import { useTranslation } from 'react-i18next';
import ReportStatusChip from '../status/ReportStatusChip.jsx';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/**
 * The match reports of the selected job: candidate, score (and how it moved at the last re-scoring), status, menu.
 * A report that left the job's latest results stays listed, dimmed and badged "Outdated" with the reason.
 */
const ReportList = ({ handleMenuOpen, onStatusChange, selectedReport, setSelectedReport, sortedReports }) => {
	const { t, i18n } = useTranslation();
	const locale = i18n.language?.slice(0, 2) || 'en';
	return (
		<>
		<Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
			{sortedReports.length === 0 ? (
				<Box sx={{ px: 2, pt: 2 }}>
					<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.subtle }}>
						{t('appCVMatching.noAnalysisResult')}
					</Typography>
				</Box>
			) : (
				sortedReports.map((report) => {
					const score = Math.ceil(report.matchingReportDetails?.decisionSummary?.finalScore ?? 0);
					const name = report.candidateInfo?.candidateName ?? '';
					const yrs = report.candidateInfo?.nbYearsExperience;
					const isActive = selectedReport?.id === report.id;
					const delta = scoreDelta(report);

					return (
						<ListItemButton
							key={report.id}
							onClick={() => setSelectedReport(report)}
							sx={{
								px: 1.5, py: 1,
								borderLeft: isActive ? `3px solid ${tokens.brand.main}` : '3px solid transparent',
								backgroundColor: isActive ? alpha(tokens.brand.main, 0.06) : 'transparent',
								'&:hover': { backgroundColor: isActive ? alpha(tokens.brand.main, 0.10) : `${tokens.surface.subtle}` },
								gap: 1.5,
								alignItems: 'flex-start',
								opacity: report.outdated ? 0.65 : 1,
							}}
						>
							<Avatar sx={{
								width: 32, height: 32, fontSize: tokens.fontSize.caption, fontWeight: 700,
								backgroundColor: tokens.brand.main, color: tokens.ink.inverse, flexShrink: 0, mt: 0.25,
							}}>
								{getInitials(name)}
							</Avatar>

							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Typography sx={{
									fontSize: tokens.fontSize.body2, fontWeight: isActive ? 600 : 400,
									color: tokens.ink.strong, lineHeight: 1.3,
									overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
								}}>
									{name}
								</Typography>
								{yrs != null && (
									<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.muted, lineHeight: 1.3 }}>
										{yrs} {t('appCVContent.yearsAbbr')} {t('appCVContent.experience')}
									</Typography>
								)}
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
									<Chip
										label={`${score}%`}
										size="small"
										sx={{ height: 18, fontSize: tokens.fontSize.caption, fontWeight: 700, ...scoreChipSx(score) }}
									/>
									<ReportStatusChip report={report} onChange={onStatusChange} />
									{delta != null && (
										<Tooltip title={t('matchingRun.scoreMoved', { previous: Math.ceil(report.previousFinalScore) })}>
											<Typography component="span" sx={{ fontSize: tokens.fontSize.caption, fontWeight: 700, color: delta > 0 ? tokens.status.success.text : tokens.status.error.main }}>
												{delta > 0 ? `+${delta}` : delta}
											</Typography>
										</Tooltip>
									)}
									{report.outdated && (
										<Tooltip title={`${t(`matchingRun.outdatedReason.${report.outdatedReason ?? 'RANKED_OUT'}`)}${report.outdatedAt
											? ` · ${t('matchingRun.outdatedSince', { date: dayjs(report.outdatedAt).locale(locale).format('LL') })}` : ''}`}>
											<Chip label={t('matchingRun.outdated')} size="small"
												sx={{ height: 18, fontSize: tokens.fontSize.caption, fontWeight: 600, backgroundColor: tokens.surface.muted, color: tokens.ink.muted }} />
										</Tooltip>
									)}
								</Box>
							</Box>

							<IconButton
								size="small"
								onClick={(e) => handleMenuOpen(e, report)}
								sx={{ color: tokens.ink.subtle, flexShrink: 0, mt: 0.25 }}
							>
								<MoreVertIcon sx={{ fontSize: tokens.iconSize.md }} />
							</IconButton>
						</ListItemButton>
					);
				})
			)}
		</Box>
		</>
	);
};

ReportList.propTypes = {
	handleMenuOpen: PropTypes.func,
	onStatusChange: PropTypes.func,
	selectedReport: PropTypes.any,
	setSelectedReport: PropTypes.func,
	sortedReports: PropTypes.any,
};

export default ReportList;
