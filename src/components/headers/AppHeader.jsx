import { AppBar, Avatar, Box, IconButton, Menu, MenuItem, Toolbar, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
// eslint-disable-next-line no-unused-vars
import React, {useEffect, useState} from "react";
import { useTranslation } from 'react-i18next';
import {
	COMP_ID_CVLIB,
	COMP_ID_REPORTS,
	COMP_ID_SETTINGS,
	COMP_ID_JOBS,
	USER_FIRST_NAME, USER_LAST_NAME, COMP_ID_DASHBOARD, COMP_ID_CHAT
} from "../../constants.js";


const AppHeader = ({ handleSidebarToggle, handleContentChange, contentTitle }) => {
	const { t } = useTranslation();
	const [anchorEl, setAnchorEl] = useState(null);
	const [fullName, setFullName] = useState('');

	const handleMenuOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleLogoutClick = () => {
		localStorage.clear();
		location.reload();
	};

	const handleNavigation = (newContent) => {
		handleContentChange(newContent);
		handleMenuClose();
	};


	const handleHamburgerToggle = () => {
		handleSidebarToggle();
	};

	const renderContentTile = () => {
		switch (contentTitle) {
			case COMP_ID_DASHBOARD:
				return<Typography variant="h5">Dashboard</Typography>;
			case COMP_ID_CVLIB:
				return <Typography variant="h5">{t('header.cvs')}</Typography>;
			case COMP_ID_JOBS:
				return <Typography variant="h5">{t('header.jobs')}</Typography>;
			case COMP_ID_REPORTS:
				return <Typography variant="h5">{t('header.reports')}</Typography>;
			case COMP_ID_CHAT:
				return <Typography variant="h5">{t('header.aiResumeChat') || 'AI Resume Chat'}</Typography>;
			case COMP_ID_SETTINGS:
				return <Typography variant="h5">{t('header.accountSettings')}</Typography>;
			default:
				return <Typography variant="h5">Dashboard</Typography>;
		}
	};

	useEffect(() => {
		const firstName = localStorage.getItem(USER_FIRST_NAME);
		const lastName = localStorage.getItem(USER_LAST_NAME);
		setFullName(firstName + ' ' + lastName);
	}, []);

	return (
		<AppBar sx={{position: 'fixed', width: { xs: '100%', md: '85%', lg: '85%'  }, marginLeft: { md: 240 }, height: '5vh', justifyContent: 'center', backgroundColor: '#f8f8f8', color: 'black' }}>
			<Toolbar>
				{/* Hamburger Icon (Always Visible) */}
				<IconButton
					color="inherit"
					edge="start"
					sx={{ mr: 2 }}
					onClick={handleHamburgerToggle}
				>
					<MenuIcon />
				</IconButton>

				{/* Content Title in the AppBar */}
				{renderContentTile()}
				<Box sx={{ flexGrow: 1 }} />

				{/* Language switcher  */}
				{/*<LanguageSwitcher textColor={'black'} />*/}

				{/* User Account Icon */}
				<IconButton color="inherit" onClick={handleMenuOpen}>
					<Avatar />
				</IconButton>
				<Menu
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					onClose={handleMenuClose}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				>
					<MenuItem sx={{fontStyle: 'italic', fontWeight: '0.5rem', color: 'blue'}}>{fullName}</MenuItem>
					<MenuItem onClick={() => handleNavigation(COMP_ID_SETTINGS)}>{t('header.accountSettings')}</MenuItem>
					<MenuItem onClick={handleLogoutClick}>{t('header.logout')}</MenuItem>
				</Menu>
			</Toolbar>
		</AppBar>
	);
};

export default AppHeader;
