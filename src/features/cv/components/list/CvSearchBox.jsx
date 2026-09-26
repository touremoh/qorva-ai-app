import PropTypes from 'prop-types';
import { Box, IconButton, TextField, InputAdornment } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchIcon from '@mui/icons-material/Search';
import { GREEN } from '../../model/entries.js';
import { useTranslation } from 'react-i18next';

/** Quick search over name, role and skills. */
const CvSearchBox = ({ onQuickSearchChange, quickSearch }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ px: 1.5, pt: 1.5, flexShrink: 0 }}>
			<TextField
				size="small"
				fullWidth
				placeholder={t('appCVContent.filters.quickSearch')}
				value={quickSearch}
				onChange={(e) => onQuickSearchChange?.(e.target.value)}
				onKeyDown={(e) => { if (e.key === 'Escape' && quickSearch) onQuickSearchChange?.(''); }}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon sx={{ fontSize: 16, color: quickSearch ? GREEN : '#94a3b8' }} />
						</InputAdornment>
					),
					endAdornment: quickSearch ? (
						<InputAdornment position="end">
							<IconButton
								size="small"
								onClick={() => onQuickSearchChange?.('')}
								aria-label={t('appCVContent.filters.clear')}
								sx={{ p: 0.25, color: '#94a3b8', '&:hover': { color: '#334155' } }}
							>
								<CloseRoundedIcon sx={{ fontSize: 14 }} />
							</IconButton>
						</InputAdornment>
					) : null,
					sx: {
						fontSize: '0.82rem',
						borderRadius: 1.5,
						backgroundColor: '#ffffff',
						'& fieldset': { borderColor: '#e2e8f0' },
						'&:hover fieldset': { borderColor: '#cbd5e1' },
						'&.Mui-focused fieldset': { borderColor: GREEN, borderWidth: 1 },
					},
				}}
			/>
		</Box>
		</>
	);
};

CvSearchBox.propTypes = {
	onQuickSearchChange: PropTypes.func,
	quickSearch: PropTypes.any,
};

export default CvSearchBox;
