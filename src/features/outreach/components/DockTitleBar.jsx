import PropTypes from 'prop-types';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';

/** Dock title with the candidate's name; minimize and close. */
const DockTitleBar = ({ handleClose, minimize, minimized, restore, title }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box
			onClick={minimized ? restore : undefined}
			sx={{
				display: 'flex', alignItems: 'center', gap: 1, px: 1.5, height: 48, flexShrink: 0,
				backgroundColor: tokens.ink.strong, color: tokens.ink.inverse, cursor: minimized ? 'pointer' : 'default',
			}}
		>
			<MailOutlineIcon sx={{ fontSize: tokens.iconSize.lg, color: tokens.brand.mintPale }} />
			<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: 600, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
				{title}
			</Typography>
			<Tooltip title={minimized ? t('candidateOutreach.restore') : t('candidateOutreach.minimize')}>
				<IconButton size="small" onClick={(e) => { e.stopPropagation(); minimized ? restore() : minimize(); }} sx={{ color: tokens.onDark.faint }}>
					{minimized ? <OpenInFullIcon sx={{ fontSize: tokens.iconSize.sm }} /> : <RemoveIcon sx={{ fontSize: tokens.iconSize.lg }} />}
				</IconButton>
			</Tooltip>
			<Tooltip title={t('candidateOutreach.close')}>
				<IconButton size="small" onClick={(e) => { e.stopPropagation(); handleClose(); }} sx={{ color: tokens.onDark.faint }}>
					<CloseIcon sx={{ fontSize: tokens.iconSize.lg }} />
				</IconButton>
			</Tooltip>
		</Box>
		</>
	);
};

DockTitleBar.propTypes = {
	handleClose: PropTypes.func,
	minimize: PropTypes.any,
	minimized: PropTypes.any,
	restore: PropTypes.any,
	title: PropTypes.any,
};

export default DockTitleBar;
