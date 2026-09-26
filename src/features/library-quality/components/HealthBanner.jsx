import PropTypes from 'prop-types';
import { Box, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';

/** Overall library health score with a one-line verdict. */
const HealthBanner = ({ overall, overallColors, report, verdict }) => {
	const { t } = useTranslation();
	return (
		<>
		<Paper elevation={0} sx={{
			border: `1px solid ${tokens.line.main}`, borderRadius: 2.5, p: 2.5,
			display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap',
		}}>
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
		</Paper>
		</>
	);
};

HealthBanner.propTypes = {
	overall: PropTypes.any,
	overallColors: PropTypes.any,
	report: PropTypes.any,
	verdict: PropTypes.any,
};

export default HealthBanner;
