import PropTypes from 'prop-types';
import { Box, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AiSummaryPanel from '../../../shared/ui/AiSummaryPanel.jsx';
import * as tokens from '../../../theme/tokens.js';

/** Overall library health score with a one-line verdict; the AI summary fills the right side when available. */
const HealthBanner = ({ overall, overallColors, report, verdict, insight, insightLoading, onShowIssue }) => {
	const { t } = useTranslation();
	return (
		<>
		<Paper elevation={0} sx={{
			border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, p: 2.5,
			display: 'flex', alignItems: 'flex-start', gap: 2.5, flexWrap: { xs: 'wrap', lg: 'nowrap' },
		}}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, minWidth: 0, flex: { xs: '1 1 100%', lg: '0 0 auto' }, maxWidth: { lg: 380 } }}>
				<Box sx={{
					width: 86, height: 86, borderRadius: '50%', flexShrink: 0,
					backgroundColor: overallColors.bg,
					display: 'flex', alignItems: 'center', justifyContent: 'center',
					border: `3px solid ${overallColors.accent}`,
				}}>
					<Typography sx={{ fontSize: tokens.fontSize.display, fontWeight: 800, color: overallColors.color, lineHeight: 1 }}>
						{overall}
					</Typography>
				</Box>
				<Box sx={{ minWidth: 0 }}>
					<Typography sx={{ fontSize: tokens.fontSize.caption, fontWeight: 700, color: tokens.ink.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
						{t('libraryQuality.overall', 'Library Health')}
					</Typography>
					<Typography sx={{ fontSize: tokens.fontSize.lg, fontWeight: 700, color: tokens.ink.strong, mt: 0.25 }}>
						{verdict}
					</Typography>
					<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle, mt: 0.25 }}>
						{t('libraryQuality.totalCVs', '{{count}} resumes analyzed', { count: report.totalCVs })}
					</Typography>
				</Box>
			</Box>
			{(insight || insightLoading) && (
				<Box sx={{
					flex: 1, minWidth: { xs: '100%', lg: 0 },
					borderLeft: { lg: `1px solid ${tokens.line.main}` }, pl: { lg: 2.5 },
					borderTop: { xs: `1px solid ${tokens.line.main}`, lg: 'none' }, pt: { xs: 2, lg: 0 },
				}}>
					<AiSummaryPanel insight={insight} loading={insightLoading} onShowRef={onShowIssue} refOf={(r) => r.issueKey} testId="quality-insight" />
				</Box>
			)}
		</Paper>
		</>
	);
};

HealthBanner.propTypes = {
	overall: PropTypes.any,
	overallColors: PropTypes.any,
	report: PropTypes.any,
	verdict: PropTypes.any,
	insight: PropTypes.object,
	insightLoading: PropTypes.bool,
	onShowIssue: PropTypes.func.isRequired,
};

export default HealthBanner;
