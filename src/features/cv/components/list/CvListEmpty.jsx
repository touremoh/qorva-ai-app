import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** Empty list: no resumes yet, or none matching the filters (with a reset). */
const CvListEmpty = ({ activeCount, onClearFilters, onQuickSearchChange, quickSearch }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, px: 2 }}>
			<Typography sx={{ fontSize: '0.84rem', color: tokens.ink.subtle, textAlign: 'center' }}>
				{activeCount > 0 || quickSearch ? t('appCVContent.filters.noMatch') : t('appCVContent.noCVEntries')}
			</Typography>
			{(activeCount > 0 || quickSearch) && (
				<Button
					size="small"
					onClick={() => { onClearFilters(); onQuickSearchChange?.(''); }}
					sx={{ textTransform: 'none', fontSize: '0.78rem', fontWeight: 600, color: tokens.brand.text }}
				>
					{t('appCVContent.filters.clearAll')}
				</Button>
			)}
		</Box>
		</>
	);
};

CvListEmpty.propTypes = {
	activeCount: PropTypes.any,
	onClearFilters: PropTypes.func,
	onQuickSearchChange: PropTypes.func,
	quickSearch: PropTypes.any,
};

export default CvListEmpty;
