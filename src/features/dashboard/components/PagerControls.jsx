import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PropTypes from 'prop-types';

const PagerControls = ({ page, totalPages, hasNext, loading = false, onPrev, onNext }) => {
	if (totalPages <= 1) return null;

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
			{loading && <CircularProgress size={12} sx={{ color: '#94a3b8', mr: 0.5 }} />}
			<IconButton
				size="small"
				onClick={onPrev}
				disabled={page === 0 || loading}
				sx={{ color: '#64748b', p: 0.25, '&:hover': { backgroundColor: 'rgba(98,156,68,0.08)', color: '#629C44' } }}
			>
				<ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
			</IconButton>
			<Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', minWidth: 32, textAlign: 'center' }}>
				{page + 1} / {totalPages}
			</Typography>
			<IconButton
				size="small"
				onClick={onNext}
				disabled={!hasNext || loading}
				sx={{ color: '#64748b', p: 0.25, '&:hover': { backgroundColor: 'rgba(98,156,68,0.08)', color: '#629C44' } }}
			>
				<ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
			</IconButton>
		</Box>
	);
};
PagerControls.propTypes = {
	page: PropTypes.number.isRequired,
	totalPages: PropTypes.number.isRequired,
	hasNext: PropTypes.bool.isRequired,
	loading: PropTypes.bool,
	onPrev: PropTypes.func.isRequired,
	onNext: PropTypes.func.isRequired,
};

export default PagerControls;
