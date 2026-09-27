import { Button, Tooltip } from '@mui/material';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { openUpgradeDialog } from '../../utils/demoMode.js';
import * as tokens from '../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

// Drop-in "Upgrade to unlock" CTA used in place of write actions that demo
// users cannot perform. Clicking it opens the upgrade flow (Screen 7).
const UpgradeButton = ({
	reason = 'gated-action',
	size = 'small',
	variant = 'outlined',
	fullWidth = false,
	withTooltip = false,
	sx = {},
}) => {
	const { t } = useTranslation();

	const button = (
		<Button
			size={size}
			variant={variant}
			fullWidth={fullWidth}
			startIcon={<LockOpenRoundedIcon sx={{ fontSize: tokens.iconSize.md }} />}
			onClick={() => openUpgradeDialog(reason)}
			sx={{
				textTransform: 'none',
				fontWeight: 600,
				borderRadius: 1.5,
				...(variant === 'outlined'
					? {
						borderColor: alpha(tokens.brand.main, 0.6),
						color: tokens.brand.text,
						'&:hover': { borderColor: tokens.brand.main, backgroundColor: alpha(tokens.brand.main, 0.06) },
					}
					: {
						backgroundColor: tokens.brand.main,
						boxShadow: `0 2px 8px ${alpha(tokens.brand.main, 0.35)}`,
						'&:hover': { backgroundColor: tokens.brand.hoverAlt },
					}),
				...sx,
			}}
		>
			{t('demo.upgradeToUnlock', 'Upgrade to unlock')}
		</Button>
	);

	if (withTooltip) {
		return (
			<Tooltip title={t('demo.upgradeTooltip', 'Upgrade to unlock full access')}>
				<span>{button}</span>
			</Tooltip>
		);
	}
	return button;
};

UpgradeButton.propTypes = {
	reason: PropTypes.string,
	size: PropTypes.string,
	variant: PropTypes.string,
	fullWidth: PropTypes.bool,
	withTooltip: PropTypes.bool,
	sx: PropTypes.object,
};

export default UpgradeButton;
