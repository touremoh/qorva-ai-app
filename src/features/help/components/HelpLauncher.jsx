import { IconButton, Tooltip } from '@mui/material';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { useTranslation } from 'react-i18next';
import { useHelpPanel } from '../hooks/HelpContext.jsx';
import * as tokens from '../../../theme/tokens.js';

/** The header's "?" button. Hidden while Qorva Help is switched off. */
const HelpLauncher = () => {
	const { t } = useTranslation();
	const { enabled, open, openHelp, closeHelp } = useHelpPanel();
	if (!enabled) return null;
	return (
		<Tooltip title={t('help.open')}>
			<IconButton
				data-testid="help-launcher"
				aria-label={t('help.open')}
				aria-expanded={open}
				onClick={() => (open ? closeHelp() : openHelp())}
				sx={{ mr: 1, color: open ? tokens.brand.text : tokens.ink.muted, '&:hover': { backgroundColor: tokens.surface.muted } }}
			>
				<HelpOutlineOutlinedIcon sx={{ fontSize: tokens.iconSize.xl }} />
			</IconButton>
		</Tooltip>
	);
};

export default HelpLauncher;
