import React, { useState } from 'react';
import { Box, IconButton, List, ListItemButton, Tooltip, Typography } from '@mui/material';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { useTranslation } from 'react-i18next';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import {
	COMP_ID_CHAT,
	COMP_ID_CVLIB,
	COMP_ID_DASHBOARD,
	COMP_ID_INTELLIGENCE,
	COMP_ID_JOBS,
	COMP_ID_REPORTS,
	COMP_ID_SETTINGS,
} from '../../../constants.js';
import PropTypes from 'prop-types';

const AppMenuList = ({ handleContentChange, isChatAllowed, collapsed, onToggleCollapse }) => {
	const { t } = useTranslation();
	const [selectedItem, setSelectedItem] = useState(COMP_ID_DASHBOARD);

	const handleNavigation = (id) => {
		setSelectedItem(id);
		handleContentChange(id);
	};

	const menuItems = [
		{ id: COMP_ID_DASHBOARD, Icon: LeaderboardOutlinedIcon, label: 'Dashboard',                              display: true },
		{ id: COMP_ID_CVLIB,     Icon: PeopleOutlinedIcon,      label: t('header.cvs'),                         display: true },
		{ id: COMP_ID_JOBS,         Icon: WorkOutlineOutlinedIcon,  label: t('header.jobs'),                      display: true },
		{ id: COMP_ID_INTELLIGENCE, Icon: PsychologyOutlinedIcon,   label: t('header.intelligence', 'Intelligence'), display: true },
		{ id: COMP_ID_REPORTS,      Icon: AssessmentOutlinedIcon,   label: t('header.reports'),                   display: true },
		{ id: COMP_ID_CHAT,      Icon: AutoAwesomeOutlinedIcon, label: t('header.aiResumeChat') || 'AI Chat',   display: isChatAllowed },
		{ id: COMP_ID_SETTINGS,  Icon: TuneOutlinedIcon,        label: t('header.accountSettings'),             display: true },
	];

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				background: 'linear-gradient(180deg, #1a2940 0%, #232F3E 100%)',
				overflow: 'hidden',
			}}
		>
			{/* Brand */}
			<Box sx={{
				px: collapsed ? 0 : 2.5,
				pt: 2.5,
				pb: 2,
				display: 'flex',
				alignItems: 'center',
				justifyContent: collapsed ? 'center' : 'flex-start',
				gap: 1.5,
			}}>
				<Box
					component="img"
					src="/logo.svg"
					alt="Qorva"
					sx={{ width: 30, height: 30, flexShrink: 0 }}
				/>
				{!collapsed && (
					<Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
						Qorva
					</Typography>
				)}
			</Box>

			<Box sx={{ mx: collapsed ? 1 : 2.5, borderBottom: '1px solid rgba(255,255,255,0.07)', mb: 2 }} />

			{/* Nav items */}
			<List disablePadding sx={{ px: collapsed ? 0.5 : 1.5, flex: 1 }}>
				{menuItems.map((item) => {
					if (!item.display) return null;
					const { Icon } = item;
					const isActive = selectedItem === item.id;
					return (
						<ListItemButton
							key={item.id}
							onClick={() => handleNavigation(item.id)}
							title={collapsed ? item.label : undefined}
							sx={{
								borderRadius: 1.5,
								mb: 0.5,
								px: collapsed ? 0 : 1.5,
								py: 0.9,
								justifyContent: collapsed ? 'center' : 'flex-start',
								color: isActive ? '#ffffff' : 'rgba(255,255,255,0.55)',
								backgroundColor: isActive ? 'rgba(98,156,68,0.18)' : 'transparent',
								borderLeft: collapsed ? 'none' : (isActive ? '3px solid #629C44' : '3px solid transparent'),
								transition: 'all 0.15s ease',
								'&:hover': {
									backgroundColor: isActive ? 'rgba(98,156,68,0.24)' : 'rgba(255,255,255,0.06)',
									color: '#ffffff',
								},
							}}
						>
							<Icon sx={{ fontSize: 18, mr: collapsed ? 0 : 1.5, flexShrink: 0 }} />
							{!collapsed && (
								<Typography
									sx={{
										fontSize: '0.84rem',
										fontWeight: isActive ? 600 : 400,
										lineHeight: 1.2,
										letterSpacing: '-0.01em',
									}}
								>
									{item.label}
								</Typography>
							)}
						</ListItemButton>
					);
				})}
			</List>

			{/* Footer */}
			<Box sx={{ mx: collapsed ? 1 : 2.5, borderBottom: '1px solid rgba(255,255,255,0.05)', mb: 1.5 }} />
			<Box sx={{
				px: collapsed ? 0 : 2.5,
				pb: 2,
				display: 'flex',
				alignItems: 'center',
				justifyContent: collapsed ? 'center' : 'space-between',
			}}>
				{!collapsed && (
					<Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
						Qorva AI
					</Typography>
				)}
				{onToggleCollapse && (
					<Tooltip title={collapsed ? 'Expand' : 'Collapse'} placement="right">
						<IconButton
							onClick={onToggleCollapse}
							size="small"
							sx={{
								color: 'rgba(255,255,255,0.35)',
								borderRadius: 1.5,
								'&:hover': { backgroundColor: 'rgba(255,255,255,0.08)', color: '#ffffff' },
							}}
						>
							{collapsed
								? <KeyboardDoubleArrowRightIcon sx={{ fontSize: 18 }} />
								: <KeyboardDoubleArrowLeftIcon sx={{ fontSize: 18 }} />
							}
						</IconButton>
					</Tooltip>
				)}
			</Box>
		</Box>
	);
};

export default AppMenuList;

AppMenuList.propTypes = {
	handleContentChange: PropTypes.func.isRequired,
	isChatAllowed: PropTypes.bool.isRequired,
	collapsed: PropTypes.bool,
	onToggleCollapse: PropTypes.func,
};
