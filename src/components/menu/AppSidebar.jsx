// eslint-disable-next-line no-unused-vars
import React, {useEffect, useState} from 'react';
import {Drawer, useMediaQuery} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AppMenuList from "./AppMenuList/AppMenuList.jsx";
import apiClient from "../../../axiosConfig.js";
import PropTypes from "prop-types";

const AppSidebar = ({ isSidebarOpen, handleSidebarToggle, handleContentChange }) => {
	const theme = useTheme();
	const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
	const [isChatAllowed, setIsChatAllowed] = useState(true);

	const handleNavigation = (newContent) => {
		handleContentChange(newContent);
		if (!isLargeScreen) {
			handleSidebarToggle(); // Close the sidebar after navigation on small screens
		}
	};

	const checkChatAllowed = async () => {
		try {
			return await apiClient.get(`${import.meta.env.VITE_APP_API_CHAT_URL}/allowed`);
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	useEffect(() => {
		checkChatAllowed().then(response => {
			setIsChatAllowed(response.data);
		});
	}, []);

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
					<AppMenuList handleContentChange={handleNavigation} isChatAllowed={isChatAllowed}  />
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
					<AppMenuList handleContentChange={handleNavigation} isChatAllowed={isChatAllowed}  />
				</Drawer>
			)}
		</>
	);
};

export default AppSidebar;

// isSidebarOpen, handleSidebarToggle, handleContentChange
AppSidebar.propTypes = {
	isSidebarOpen: PropTypes.bool,
	handleSidebarToggle: PropTypes.func,
	handleContentChange: PropTypes.func
}
