import PropTypes from 'prop-types';
import { getInitials } from '../../../../shared/lib/text.js';
import { Avatar, Box, Chip, IconButton, ListItemButton, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { scoreChipSx } from '../../model/reportList.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** The match reports of the selected job: candidate, score, date, menu. */
const ReportList = ({ handleMenuOpen, selectedReport, setSelectedReport, sortedReports }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
			{sortedReports.length === 0 ? (
				<Box sx={{ px: 2, pt: 2 }}>
					<Typography sx={{ fontSize: '0.82rem', color: tokens.ink.subtle }}>
						{t('appCVMatching.noAnalysisResult')}
					</Typography>
				</Box>
			) : (
				sortedReports.map((report) => {
					const score = Math.ceil(report.matchingReportDetails?.decisionSummary?.finalScore ?? 0);
					const name = report.candidateInfo?.candidateName ?? '';
					const yrs = report.candidateInfo?.nbYearsExperience;
					const isActive = selectedReport?.id === report.id;

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
							}}
						>
							<Avatar sx={{
								width: 32, height: 32, fontSize: '0.7rem', fontWeight: 700,
								backgroundColor: tokens.brand.main, color: tokens.ink.inverse, flexShrink: 0, mt: 0.25,
							}}>
								{getInitials(name)}
							</Avatar>

							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Typography sx={{
									fontSize: '0.82rem', fontWeight: isActive ? 600 : 400,
									color: tokens.ink.strong, lineHeight: 1.3,
									overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
								}}>
									{name}
								</Typography>
								{yrs != null && (
									<Typography sx={{ fontSize: '0.72rem', color: tokens.ink.muted, lineHeight: 1.3 }}>
										{yrs} {t('appCVContent.yearsAbbr')} {t('appCVContent.experience')}
									</Typography>
								)}
								<Chip
									label={`${score}%`}
									size="small"
									sx={{
										mt: 0.5, height: 18, fontSize: '0.68rem', fontWeight: 700,
										...scoreChipSx(score),
									}}
								/>
							</Box>

							<IconButton
								size="small"
								onClick={(e) => handleMenuOpen(e, report)}
								sx={{ color: tokens.ink.subtle, flexShrink: 0, mt: 0.25 }}
							>
								<MoreVertIcon sx={{ fontSize: 16 }} />
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
	selectedReport: PropTypes.any,
	setSelectedReport: PropTypes.func,
	sortedReports: PropTypes.any,
};

export default ReportList;
