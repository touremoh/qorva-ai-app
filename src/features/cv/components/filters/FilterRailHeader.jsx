import PropTypes from 'prop-types';
import { Box, Button, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useTranslation } from 'react-i18next';
import { GREEN } from '../../model/filterRail.js';
import * as tokens from '../../../../theme/tokens.js';

/** Rail title bar: "Clear all" when filters are active, and the collapse button. */
const FilterRailHeader = ({ activeCount, onClearAll, onClose }) => {
	const { t } = useTranslation();
	return (
		<Box sx={{
			display: 'flex', alignItems: 'center', gap: 0.5,
			px: 1.5, py: 1, borderBottom: `1px solid ${tokens.line.main}`, flexShrink: 0,
		}}>
			<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: 700, color: tokens.ink.strong, flex: 1 }}>
				{t('appCVContent.filters.title')}
			</Typography>
			{activeCount > 0 && (
				<Button size="small" onClick={onClearAll} sx={{
					textTransform: 'none', fontSize: tokens.fontSize.small, fontWeight: 600, color: GREEN, minWidth: 0, px: 0.75,
				}}>
					{t('appCVContent.filters.clearAll')}
				</Button>
			)}
			<IconButton size="small" onClick={onClose} sx={{ color: tokens.ink.subtle }}>
				<ChevronLeftIcon sx={{ fontSize: tokens.iconSize.lg }} />
			</IconButton>
		</Box>
	);
};

FilterRailHeader.propTypes = {
	activeCount: PropTypes.number.isRequired,
	onClearAll: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
};

export default FilterRailHeader;
