import PropTypes from 'prop-types';
import { Box, IconButton, TextField, InputAdornment } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchIcon from '@mui/icons-material/Search';
import { GREEN } from '../../model/entries.js';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

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
							<SearchIcon sx={{ fontSize: tokens.iconSize.md, color: quickSearch ? GREEN : `${tokens.ink.subtle}` }} />
						</InputAdornment>
					),
					endAdornment: quickSearch ? (
						<InputAdornment position="end">
							<IconButton
								size="small"
								onClick={() => onQuickSearchChange?.('')}
								aria-label={t('appCVContent.filters.clear')}
								sx={{ p: 0.25, color: tokens.ink.subtle, '&:hover': { color: tokens.ink.body } }}
							>
								<CloseRoundedIcon sx={{ fontSize: tokens.iconSize.sm }} />
							</IconButton>
						</InputAdornment>
					) : null,
					sx: {
						fontSize: tokens.fontSize.body2,
						borderRadius: 1.5,
						backgroundColor: tokens.surface.paper,
						'& fieldset': { borderColor: tokens.line.main },
						'&:hover fieldset': { borderColor: tokens.line.strong },
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
