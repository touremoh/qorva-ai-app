import { useEffect, useState } from 'react';
import { getInitials } from '../../shared/lib/text.js';
import PropTypes from 'prop-types';
import {
	AppBar,
	Avatar,
	Box,
	Divider,
	IconButton,
	ListItemIcon,
	Menu,
	MenuItem,
	Toolbar,
	Typography,
} from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import BulkImportChip from './BulkImportChip.jsx';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useTranslation } from 'react-i18next';
import {
	COMP_ID_CHAT,
	COMP_ID_CVLIB,
	COMP_ID_DASHBOARD,
	COMP_ID_INTELLIGENCE,
	COMP_ID_JOBS,
	COMP_ID_LIBRARY_QUALITY,
	COMP_ID_REPORTS,
	COMP_ID_SETTINGS,
	COMP_ID_USAGE_MONITORING,
	USER_FIRST_NAME,
	USER_LAST_NAME,
} from '../../constants.js';
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_COLLAPSED } from '../menu/AppSidebar.jsx';
import * as tokens from '../../theme/tokens.js';

export const HEADER_HEIGHT = 64;

const AppHeader = ({ handleContentChange, contentTitle, isSidebarCollapsed }) => {
	const { t } = useTranslation();
	const [anchorEl, setAnchorEl] = useState(null);
	const [initials, setInitials] = useState('');
	const [fullName, setFullName] = useState('');

	useEffect(() => {
		const first = localStorage.getItem(USER_FIRST_NAME) || '';
		const last = localStorage.getItem(USER_LAST_NAME) || '';
		setFullName(`${first} ${last}`.trim());
		setInitials(getInitials([first, last]));
	}, []);

	const pageTitles = {
		[COMP_ID_DASHBOARD]:        'Dashboard',
		[COMP_ID_CVLIB]:            t('header.cvs'),
		[COMP_ID_LIBRARY_QUALITY]:  t('header.libraryQuality', 'Library Quality'),
		[COMP_ID_JOBS]:             t('header.jobs'),
		[COMP_ID_REPORTS]:          t('header.reports'),
		[COMP_ID_INTELLIGENCE]:     t('header.intelligence', 'Talent Intelligence'),
		[COMP_ID_CHAT]:             t('header.aiResumeChat'),
		[COMP_ID_USAGE_MONITORING]: t('header.usageMonitoring', 'Usage Monitoring'),
		[COMP_ID_SETTINGS]:         t('header.accountSettings'),
	};

	const displayTitle = pageTitles[contentTitle] || 'Dashboard';

	return (
		<AppBar
			elevation={0}
			sx={{
				position: 'fixed',
				width: {
					xs: '100%',
					md: `calc(100% - ${isSidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}px)`,
				},
				marginLeft: {
					md: `${isSidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}px`,
				},
				height: HEADER_HEIGHT,
				justifyContent: 'center',
				backgroundColor: tokens.surface.paper,
				borderBottom: `1px solid ${tokens.line.main}`,
				color: tokens.ink.strong,
				transition: 'width 0.2s ease, margin-left 0.2s ease',
			}}
		>
			<Toolbar sx={{ minHeight: `${HEADER_HEIGHT}px !important`, px: { xs: 2, sm: 3 } }}>
				<Typography
					sx={{
						fontWeight: 600,
						fontSize: tokens.fontSize.body,
						color: tokens.ink.strong,
						letterSpacing: '-0.01em',
					}}
				>
					{displayTitle}
				</Typography>

				<Box sx={{ flexGrow: 1 }} />

				<BulkImportChip />

				<IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
					<Avatar
						sx={{
							width: 34,
							height: 34,
							fontSize: tokens.fontSize.small,
							fontWeight: 700,
							backgroundColor: tokens.brand.main,
							color: tokens.ink.inverse,
							letterSpacing: '0.03em',
						}}
					>
						{initials || '?'}
					</Avatar>
				</IconButton>

				<Menu
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					onClose={() => setAnchorEl(null)}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					transformOrigin={{ vertical: 'top', horizontal: 'right' }}
					slotProps={{
						paper: {
							elevation: 0,
							sx: {
								mt: 1,
								minWidth: 210,
								borderRadius: 2,
								border: `1px solid ${tokens.line.main}`,
								boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
								overflow: 'visible',
							},
						},
					}}
				>
					<Box sx={{ px: 2, py: 1.5 }}>
						<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: 600, color: tokens.ink.strong }}>
							{fullName}
						</Typography>
					</Box>
					<Divider sx={{ borderColor: tokens.surface.muted }} />
					<MenuItem
						onClick={() => { handleContentChange(COMP_ID_SETTINGS); setAnchorEl(null); }}
						sx={menuItemSx}
					>
						<ListItemIcon>
							<SettingsOutlinedIcon sx={{ fontSize: tokens.iconSize.md, color: tokens.ink.muted }} />
						</ListItemIcon>
						{t('header.accountSettings')}
					</MenuItem>
					<MenuItem
						onClick={() => { localStorage.clear(); location.reload(); }}
						sx={{ ...menuItemSx, color: tokens.status.error.bright }}
					>
						<ListItemIcon>
							<LogoutOutlinedIcon sx={{ fontSize: tokens.iconSize.md, color: tokens.status.error.bright }} />
						</ListItemIcon>
						{t('header.logout')}
					</MenuItem>
				</Menu>
			</Toolbar>
		</AppBar>
	);
};

AppHeader.propTypes = {
	handleContentChange: PropTypes.func.isRequired,
	contentTitle: PropTypes.string,
	isSidebarCollapsed: PropTypes.bool,
};

const menuItemSx = {
	px: 2,
	py: 1,
	fontSize: tokens.fontSize.body2,
	color: tokens.ink.body,
	gap: 0.5,
	'&:hover': { backgroundColor: tokens.surface.subtle },
};

export default AppHeader;
