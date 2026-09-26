import PropTypes from 'prop-types';
import { Box, Button, Typography, IconButton } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { GREEN } from '../../model/entries.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** Filters button with the active count, reset, and the resume count. */
const CvFilterBar = ({ activeCount, engaged, filtersOpen, onClearFilters, onToggleFilters, totalElements }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			display: 'flex', alignItems: 'center', gap: 0.75,
			px: 1.5, py: 1, flexShrink: 0,
			borderBottom: `1px solid ${tokens.surface.muted}`,
		}}>
			<Button
				onClick={onToggleFilters}
				aria-pressed={filtersOpen}
				disableRipple
				startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
				sx={{
					height: 32,
					pl: 1.25,
					pr: activeCount > 0 ? 0.75 : 1.5,
					borderRadius: 999,
					textTransform: 'none',
					fontSize: '0.8rem',
					fontWeight: 600,
					lineHeight: 1,
					letterSpacing: 0,
					color: engaged ? GREEN : `${tokens.ink.body}`,
					backgroundColor: engaged ? alpha(tokens.brand.main, 0.08) : `${tokens.surface.paper}`,
					border: `1px solid ${engaged ? GREEN : `${tokens.line.main}`}`,
					boxShadow: 'none',
					transition: 'all 0.15s ease',
					'& .MuiButton-startIcon': { mr: 0.75, ml: 0, color: engaged ? GREEN : `${tokens.ink.muted}` },
					'&:hover': {
						borderColor: GREEN,
						color: GREEN,
						backgroundColor: engaged ? alpha(tokens.brand.main, 0.12) : alpha(tokens.brand.main, 0.05),
						'& .MuiButton-startIcon': { color: GREEN },
					},
					'&:focus-visible': { outline: `2px solid ${alpha(tokens.brand.main, 0.35)}`, outlineOffset: 2 },
				}}
			>
				{t('appCVContent.filters.button')}
				{activeCount > 0 && (
					<Box component="span" sx={{
						ml: 1,
						minWidth: 20,
						height: 20,
						px: 0.75,
						borderRadius: 999,
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: '0.68rem',
						fontWeight: 700,
						color: tokens.ink.inverse,
						backgroundColor: GREEN,
					}}>
						{activeCount}
					</Box>
				)}
			</Button>
			{activeCount > 0 && (
				<IconButton
					size="small"
					onClick={onClearFilters}
					aria-label={t('appCVContent.filters.clearAll')}
					title={t('appCVContent.filters.clearAll')}
					sx={{
						width: 28, height: 28,
						color: tokens.ink.subtle,
						'&:hover': { color: tokens.status.error.bright, backgroundColor: 'rgba(239,68,68,0.06)' },
					}}
				>
					<CloseRoundedIcon sx={{ fontSize: 16 }} />
				</IconButton>
			)}
			<Box sx={{ flexGrow: 1 }} />
			<Typography sx={{ fontSize: '0.72rem', color: tokens.ink.subtle, whiteSpace: 'nowrap' }}>
				{t('appCVContent.resumeCount', { count: totalElements })}
			</Typography>
		</Box>
		</>
	);
};

CvFilterBar.propTypes = {
	activeCount: PropTypes.any,
	engaged: PropTypes.any,
	filtersOpen: PropTypes.any,
	onClearFilters: PropTypes.func,
	onToggleFilters: PropTypes.func,
	totalElements: PropTypes.any,
};

export default CvFilterBar;
