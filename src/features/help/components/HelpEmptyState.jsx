import PropTypes from 'prop-types';
import { Box, Chip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';

/** Greeting and starter questions, the current page's first. */
const HelpEmptyState = ({ starters, onAsk }) => {
	const { t } = useTranslation();
	return (
		<Box sx={{ px: 2.5, py: 3 }}>
			<Typography sx={{ fontSize: tokens.fontSize.lg, fontWeight: 700, color: tokens.ink.heading, mb: 0.75 }}>
				{t('help.empty.title')}
			</Typography>
			<Typography sx={{ fontSize: tokens.fontSize.small, color: tokens.ink.soft, mb: 2.5, lineHeight: 1.55 }}>
				{t('help.empty.subtitle')}
			</Typography>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
				{starters.map((id) => (
					<Chip
						key={id}
						data-testid={`help-starter-${id}`}
						label={t(`help.starters.${id}`)}
						onClick={() => onAsk(t(`help.starters.${id}`))}
						variant="outlined"
						sx={{
							height: 'auto', py: 0.75, borderRadius: 2, borderColor: tokens.line.main, color: tokens.ink.body,
							fontSize: tokens.fontSize.small, '& .MuiChip-label': { whiteSpace: 'normal', textAlign: 'left' },
							'&:hover': { borderColor: tokens.brand.border, backgroundColor: tokens.brand.tint },
						}}
					/>
				))}
			</Box>
		</Box>
	);
};

HelpEmptyState.propTypes = {
	starters: PropTypes.arrayOf(PropTypes.string).isRequired,
	onAsk: PropTypes.func.isRequired,
};

export default HelpEmptyState;
