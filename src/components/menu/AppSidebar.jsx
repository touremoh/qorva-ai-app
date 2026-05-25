import React, { useEffect, useState } from 'react';
import { Drawer, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AppMenuList from './AppMenuList/AppMenuList.jsx';
import { getChatAllowedStatus } from '../../services/chatService.js';
import PropTypes from 'prop-types';

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_WIDTH_COLLAPSED = 64;

const AppSidebar = ({ isSidebarOpen, isSidebarCollapsed, handleSidebarToggle, handleSidebarCollapse, handleContentChange }) => {
	const theme = useTheme();
	const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
	const [isChatAllowed, setIsChatAllowed] = useState(false);

	const handleNavigation = (newContent) => {
		handleContentChange(newContent);
		if (!isLargeScreen) {
			handleSidebarToggle();
		}
	};

	useEffect(() => {
		getChatAllowedStatus()
			.then((res) => setIsChatAllowed(res.data))
			.catch(() => setIsChatAllowed(false));
	}, []);

	const collapsed = isLargeScreen && isSidebarCollapsed;
	const width = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH;

	const drawerSx = {
		width,
		flexShrink: 0,
		transition: 'width 0.2s ease',
		'& .MuiDrawer-paper': {
			width,
			boxSizing: 'border-box',
			border: 'none',
			boxShadow: '2px 0 16px rgba(0,0,0,0.18)',
			overflow: 'hidden',
			transition: 'width 0.2s ease',
		},
	};

	return isLargeScreen ? (
		<Drawer variant="permanent" open sx={drawerSx}>
			<AppMenuList handleContentChange={handleNavigation} isChatAllowed={isChatAllowed} collapsed={collapsed} onToggleCollapse={handleSidebarCollapse} />
		</Drawer>
	) : (
		<Drawer variant="temporary" open={isSidebarOpen} onClose={handleSidebarToggle} sx={drawerSx}>
			<AppMenuList handleContentChange={handleNavigation} isChatAllowed={isChatAllowed} collapsed={false} onToggleCollapse={handleSidebarToggle} />
		</Drawer>
	);
};

export default AppSidebar;

AppSidebar.propTypes = {
	isSidebarOpen: PropTypes.bool,
	isSidebarCollapsed: PropTypes.bool,
	handleSidebarToggle: PropTypes.func,
	handleSidebarCollapse: PropTypes.func,
	handleContentChange: PropTypes.func,
};
