import React, { useEffect, useState } from 'react';
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
import MenuIcon from '@mui/icons-material/Menu';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useTranslation } from 'react-i18next';
import {
	COMP_ID_CHAT,
	COMP_ID_CVLIB,
	COMP_ID_DASHBOARD,
	COMP_ID_JOBS,
	COMP_ID_REPORTS,
	COMP_ID_SETTINGS,
	USER_FIRST_NAME,
	USER_LAST_NAME,
} from '../../constants.js';
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_COLLAPSED } from '../menu/AppSidebar.jsx';

export const HEADER_HEIGHT = 64;

const AppHeader = ({ handleSidebarToggle, handleSidebarCollapse, handleContentChange, contentTitle, isSidebarCollapsed }) => {
	const { t } = useTranslation();
	const [anchorEl, setAnchorEl] = useState(null);
	const [initials, setInitials] = useState('');
	const [fullName, setFullName] = useState('');

	useEffect(() => {
		const first = localStorage.getItem(USER_FIRST_NAME) || '';
		const last = localStorage.getItem(USER_LAST_NAME) || '';
		setFullName(`${first} ${last}`.trim());
		setInitials(`${first.charAt(0)}${last.charAt(0)}`.toUpperCase());
	}, []);

	const pageTitles = {
		[COMP_ID_DASHBOARD]: 'Dashboard',
		[COMP_ID_CVLIB]:     t('header.cvs'),
		[COMP_ID_JOBS]:      t('header.jobs'),
		[COMP_ID_REPORTS]:   t('header.reports'),
		[COMP_ID_CHAT]:      t('header.aiResumeChat'),
		[COMP_ID_SETTINGS]:  t('header.accountSettings'),
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
				backgroundColor: '#ffffff',
				borderBottom: '1px solid #e2e8f0',
				color: '#0f172a',
				transition: 'width 0.2s ease, margin-left 0.2s ease',
			}}
		>
			<Toolbar sx={{ minHeight: `${HEADER_HEIGHT}px !important`, px: { xs: 2, sm: 3 } }}>
				<IconButton
					onClick={(e) => {
						// On desktop: collapse/expand sidebar. On mobile: toggle drawer.
						if (window.innerWidth >= 900) {
							handleSidebarCollapse();
						} else {
							handleSidebarToggle();
						}
					}}
					edge="start"
					sx={{
						mr: 2,
						color: '#64748b',
						borderRadius: 1.5,
						'&:hover': { backgroundColor: '#f1f5f9' },
					}}
				>
					<MenuIcon sx={{ fontSize: 20 }} />
				</IconButton>

				<Typography
					sx={{
						fontWeight: 600,
						fontSize: '1rem',
						color: '#0f172a',
						letterSpacing: '-0.01em',
					}}
				>
					{displayTitle}
				</Typography>

				<Box sx={{ flexGrow: 1 }} />

				<IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
					<Avatar
						sx={{
							width: 34,
							height: 34,
							fontSize: '0.75rem',
							fontWeight: 700,
							backgroundColor: '#629C44',
							color: '#ffffff',
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
								border: '1px solid #e2e8f0',
								boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
								overflow: 'visible',
							},
						},
					}}
				>
					<Box sx={{ px: 2, py: 1.5 }}>
						<Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
							{fullName}
						</Typography>
					</Box>
					<Divider sx={{ borderColor: '#f1f5f9' }} />
					<MenuItem
						onClick={() => { handleContentChange(COMP_ID_SETTINGS); setAnchorEl(null); }}
						sx={menuItemSx}
					>
						<ListItemIcon>
							<SettingsOutlinedIcon sx={{ fontSize: 16, color: '#64748b' }} />
						</ListItemIcon>
						{t('header.accountSettings')}
					</MenuItem>
					<MenuItem
						onClick={() => { localStorage.clear(); location.reload(); }}
						sx={{ ...menuItemSx, color: '#ef4444' }}
					>
						<ListItemIcon>
							<LogoutOutlinedIcon sx={{ fontSize: 16, color: '#ef4444' }} />
						</ListItemIcon>
						{t('header.logout')}
					</MenuItem>
				</Menu>
			</Toolbar>
		</AppBar>
	);
};

const menuItemSx = {
	px: 2,
	py: 1,
	fontSize: '0.85rem',
	color: '#334155',
	gap: 0.5,
	'&:hover': { backgroundColor: '#f8fafc' },
};

export default AppHeader;
