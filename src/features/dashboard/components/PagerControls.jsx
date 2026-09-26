import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PropTypes from 'prop-types';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

const PagerControls = ({ page, totalPages, hasNext, loading = false, onPrev, onNext }) => {
	if (totalPages <= 1) return null;

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
			{loading && <CircularProgress size={12} sx={{ color: tokens.ink.subtle, mr: 0.5 }} />}
			<IconButton
				size="small"
				onClick={onPrev}
				disabled={page === 0 || loading}
				sx={{ color: tokens.ink.muted, p: 0.25, '&:hover': { backgroundColor: alpha(tokens.brand.main, 0.08), color: tokens.brand.text } }}
			>
				<ChevronLeftRoundedIcon sx={{ fontSize: tokens.iconSize.lg }} />
			</IconButton>
			<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.ink.subtle, minWidth: 32, textAlign: 'center' }}>
				{page + 1} / {totalPages}
			</Typography>
			<IconButton
				size="small"
				onClick={onNext}
				disabled={!hasNext || loading}
				sx={{ color: tokens.ink.muted, p: 0.25, '&:hover': { backgroundColor: alpha(tokens.brand.main, 0.08), color: tokens.brand.text } }}
			>
				<ChevronRightRoundedIcon sx={{ fontSize: tokens.iconSize.lg }} />
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
