// eslint-disable-next-line no-unused-vars
import React from 'react';
import {Drawer, List, ListItem, ListItemText, Box, Typography, useMediaQuery, IconButton} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AppMenuList from "./AppMenuList/AppMenuList.jsx";

const AppSidebar = ({ isSidebarOpen, handleSidebarToggle, handleContentChange }) => {
	const theme = useTheme();
	const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));

	const handleNavigation = (newContent) => {
		handleContentChange(newContent);
		if (!isLargeScreen) {
			handleSidebarToggle(); // Close the sidebar after navigation on small screens
		}
	};

	return (
		<>
			{/* Permanent Sidebar for Larger Screens */}
			{isLargeScreen && (
				<Drawer
					variant="permanent"
					open={isSidebarOpen}
					onClose={handleSidebarToggle}
					sx={{
						width: '15%',
						flexShrink: 0,
						[`& .MuiDrawer-paper`]: {
							width: '15%',
							boxSizing: 'border-box',
							backgroundColor: '#232F3E',
							color: 'white',
						},
					}}
				>
					<AppMenuList handleContentChange={handleNavigation}  />
				</Drawer>
			)}

			{/* Temporary Sidebar for Smaller Screens */}
			{!isLargeScreen && (
				<Drawer
					variant="temporary"
					open={isSidebarOpen}
					onClose={handleSidebarToggle}
					sx={{
						[`& .MuiDrawer-paper`]: {
							width: '10%',
							boxSizing: 'border-box',
							backgroundColor: '#232F3E',
							color: 'white',
						},
					}}
				>
					<AppMenuList handleContentChange={handleNavigation}  />
				</Drawer>
			)}
		</>
	);
};

export default AppSidebar;
