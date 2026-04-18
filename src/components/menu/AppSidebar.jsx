import React, { useEffect, useState } from 'react';
import { Drawer, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AppMenuList from './AppMenuList/AppMenuList.jsx';
import apiClient from '../../../axiosConfig.js';
import PropTypes from 'prop-types';

export const SIDEBAR_WIDTH = 240;

const drawerSx = {
	width: SIDEBAR_WIDTH,
	flexShrink: 0,
	'& .MuiDrawer-paper': {
		width: SIDEBAR_WIDTH,
		boxSizing: 'border-box',
		border: 'none',
		boxShadow: '2px 0 16px rgba(0,0,0,0.18)',
	},
};

const AppSidebar = ({ isSidebarOpen, handleSidebarToggle, handleContentChange }) => {
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
		apiClient
			.get(`${import.meta.env.VITE_APP_API_CHAT_URL}/allowed`)
			.then((res) => setIsChatAllowed(res.data))
			.catch(() => setIsChatAllowed(false));
	}, []);

	return isLargeScreen ? (
		<Drawer variant="permanent" open sx={drawerSx}>
			<AppMenuList handleContentChange={handleNavigation} isChatAllowed={isChatAllowed} />
		</Drawer>
	) : (
		<Drawer variant="temporary" open={isSidebarOpen} onClose={handleSidebarToggle} sx={drawerSx}>
			<AppMenuList handleContentChange={handleNavigation} isChatAllowed={isChatAllowed} />
		</Drawer>
	);
};

export default AppSidebar;

AppSidebar.propTypes = {
	isSidebarOpen: PropTypes.bool,
	handleSidebarToggle: PropTypes.func,
	handleContentChange: PropTypes.func,
};
