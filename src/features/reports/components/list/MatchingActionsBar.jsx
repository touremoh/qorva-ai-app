import PropTypes from 'prop-types';
import { Box, Button, FormControlLabel, Switch, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/**
 * Under the toolbar: how many jobs have out-of-date results and the button that opens the run dialog; for the
 * selected job, showing or hiding its outdated reports and deleting them.
 */
const MatchingActionsBar = ({
	demo, pendingJobsCount, matchingActive, onRunMatching,
	selectedJobId, hideOutdated, onToggleHideOutdated, outdatedCount, onDeleteOutdated,
}) => {
	const { t } = useTranslation();
	const pending = pendingJobsCount > 0;
	return (
		<Box sx={{
			display: 'flex', alignItems: 'center', justifyContent: 'space-between',
			px: 2.5, py: 1, gap: 1.5, flexWrap: 'wrap', flexShrink: 0,
			backgroundColor: pending ? 'rgba(245,158,11,0.07)' : tokens.surface.paper,
			borderBottom: `1px solid ${pending ? 'rgba(245,158,11,0.18)' : tokens.line.main}`,
		}}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
				{pending && <WarningAmberIcon sx={{ fontSize: tokens.iconSize.md, color: tokens.status.warning.main }} />}
				<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: 500, color: pending ? tokens.status.warning.text : tokens.ink.muted }}>
					{pending ? t('matchingRun.bannerPending', { count: pendingJobsCount }) : t('matchingRun.bannerUpToDate')}
				</Typography>
			</Box>

			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
				{selectedJobId && (
					<>
						<FormControlLabel
							control={<Switch size="small" checked={hideOutdated} onChange={(e) => onToggleHideOutdated(e.target.checked)} />}
							label={<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.muted }}>{t('matchingRun.hideOutdated')}</Typography>}
							sx={{ mr: 0 }}
						/>
						{!demo && outdatedCount > 0 && (
							<Button size="small" onClick={onDeleteOutdated}
								startIcon={<DeleteOutlineIcon sx={{ fontSize: tokens.iconSize.md }} />}
								sx={{ textTransform: 'none', fontSize: tokens.fontSize.small, color: tokens.status.error.main }}>
								{t('matchingRun.deleteOutdated', { count: outdatedCount })}
							</Button>
						)}
					</>
				)}
				{!demo && (
					<Button
						variant="contained"
						size="small"
						onClick={onRunMatching}
						disabled={matchingActive}
						startIcon={<PlayArrowRoundedIcon sx={{ fontSize: tokens.iconSize.md }} />}
						sx={{
							backgroundColor: pending ? tokens.status.warning.main : tokens.brand.main,
							'&:hover': { backgroundColor: pending ? tokens.status.warning.strong : tokens.brand.hover },
							borderRadius: 1.5, textTransform: 'none', fontSize: tokens.fontSize.body2, fontWeight: 600, boxShadow: 'none', flexShrink: 0,
						}}
					>
						{matchingActive ? t('appReportContent.matchingInProgress') : t('appReportContent.startMatching')}
					</Button>
				)}
			</Box>
		</Box>
	);
};

MatchingActionsBar.propTypes = {
	demo: PropTypes.bool,
	pendingJobsCount: PropTypes.number,
	matchingActive: PropTypes.bool,
	onRunMatching: PropTypes.func,
	selectedJobId: PropTypes.string,
	hideOutdated: PropTypes.bool,
	onToggleHideOutdated: PropTypes.func,
	outdatedCount: PropTypes.number,
	onDeleteOutdated: PropTypes.func,
};

export default MatchingActionsBar;
