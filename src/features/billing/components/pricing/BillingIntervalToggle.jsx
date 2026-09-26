import PropTypes from 'prop-types';
import { Typography, Chip, Switch, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../../theme/tokens.js';

/** Monthly / yearly switch above the plan cards, with the yearly saving. */
const BillingIntervalToggle = ({ yearly, onChange }) => {
	const { t } = useTranslation();
	return (
		<Stack direction="row" spacing={1} alignItems="center" justifyContent="center" flexWrap="wrap" sx={{ mb: 4, gap: 1 }}>
			<Typography
				variant="body2"
				fontWeight={!yearly ? 600 : 400}
				color={!yearly ? 'text.primary' : 'text.secondary'}
			>
				{t('pricing.monthly', 'Monthly')}
			</Typography>
			<Switch
				checked={yearly}
				onChange={(e) => onChange(e.target.checked)}
				sx={{
					'& .MuiSwitch-switchBase.Mui-checked': { color: tokens.brand.text },
					'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: tokens.brand.main },
				}}
			/>
			<Typography
				variant="body2"
				fontWeight={yearly ? 600 : 400}
				color={yearly ? 'text.primary' : 'text.secondary'}
			>
				{t('pricing.yearly', 'Yearly')}
			</Typography>
			{yearly && (
				<Chip
					label={t('pricing.saveChip', 'Save 20%')}
					size="small"
					sx={{
						background: `linear-gradient(135deg, ${tokens.brand.main}, ${tokens.brand.hoverAlt})`,
						color: tokens.ink.inverse,
						fontWeight: 600,
						fontSize: tokens.fontSize.caption,
					}}
				/>
			)}
		</Stack>
	);
};

BillingIntervalToggle.propTypes = {
	yearly: PropTypes.bool.isRequired,
	/** Called with true for yearly billing, false for monthly. */
	onChange: PropTypes.func.isRequired,
};

export default BillingIntervalToggle;
