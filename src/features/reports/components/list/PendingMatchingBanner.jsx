import PropTypes from 'prop-types';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { useTranslation } from 'react-i18next';

/** Job posts waiting for matching, with the button that starts it. */
const PendingMatchingBanner = ({ matchingSubmitted, handleStartMatching, matchingLoading, pendingMatchingCount }) => {
	const { t } = useTranslation();
	return (
		<>
		{pendingMatchingCount > 0 && !matchingLoading && !matchingSubmitted && (
			<Box sx={{
				display: 'flex', alignItems: 'center', justifyContent: 'space-between',
				px: 2.5, py: 1.25,
				backgroundColor: 'rgba(245,158,11,0.07)',
				borderBottom: '1px solid rgba(245,158,11,0.18)',
				flexShrink: 0, flexWrap: 'wrap', gap: 1.5,
			}}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<WarningAmberIcon sx={{ fontSize: 17, color: '#d97706' }} />
					<Typography sx={{ fontSize: '0.84rem', color: '#92400e', fontWeight: 500 }}>
						{t('appReportContent.matchingNeeded', { count: pendingMatchingCount })}
					</Typography>
				</Box>
				<Button
					variant="contained"
					size="small"
					onClick={handleStartMatching}
					disabled={matchingLoading}
					startIcon={matchingLoading
						? <CircularProgress size={14} color="inherit" />
						: <PlayArrowRoundedIcon sx={{ fontSize: 17 }} />
					}
					sx={{
						backgroundColor: '#d97706',
						'&:hover': { backgroundColor: '#b45309' },
						'&.Mui-disabled': { backgroundColor: 'rgba(245,158,11,0.3)', color: '#92400e', boxShadow: 'none' },
						borderRadius: 1.5, textTransform: 'none', fontSize: '0.82rem', fontWeight: 600,
						boxShadow: '0 2px 6px rgba(217,119,6,0.3)', flexShrink: 0,
					}}
				>
					{matchingLoading
						? t('appReportContent.matchingInProgress')
						: t('appReportContent.startMatching')}
				</Button>
			</Box>
		)}
		</>
	);
};

PendingMatchingBanner.propTypes = {
	matchingSubmitted: PropTypes.bool,
	handleStartMatching: PropTypes.func,
	matchingLoading: PropTypes.any,
	pendingMatchingCount: PropTypes.any,
};

export default PendingMatchingBanner;
