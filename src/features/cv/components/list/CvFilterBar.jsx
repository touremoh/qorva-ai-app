import PropTypes from 'prop-types';
import { Box, Button, Typography, IconButton } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { GREEN } from '../../model/entries.js';
import { useTranslation } from 'react-i18next';

/** Filters button with the active count, reset, and the resume count. */
const CvFilterBar = ({ activeCount, engaged, filtersOpen, onClearFilters, onToggleFilters, totalElements }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			display: 'flex', alignItems: 'center', gap: 0.75,
			px: 1.5, py: 1, flexShrink: 0,
			borderBottom: '1px solid #f1f5f9',
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
					color: engaged ? GREEN : '#334155',
					backgroundColor: engaged ? 'rgba(98,156,68,0.08)' : '#ffffff',
					border: `1px solid ${engaged ? GREEN : '#e2e8f0'}`,
					boxShadow: 'none',
					transition: 'all 0.15s ease',
					'& .MuiButton-startIcon': { mr: 0.75, ml: 0, color: engaged ? GREEN : '#64748b' },
					'&:hover': {
						borderColor: GREEN,
						color: GREEN,
						backgroundColor: engaged ? 'rgba(98,156,68,0.12)' : 'rgba(98,156,68,0.05)',
						'& .MuiButton-startIcon': { color: GREEN },
					},
					'&:focus-visible': { outline: `2px solid rgba(98,156,68,0.35)`, outlineOffset: 2 },
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
						color: '#ffffff',
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
						color: '#94a3b8',
						'&:hover': { color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.06)' },
					}}
				>
					<CloseRoundedIcon sx={{ fontSize: 16 }} />
				</IconButton>
			)}
			<Box sx={{ flexGrow: 1 }} />
			<Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
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
