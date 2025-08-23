// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import AssistantIcon from '@mui/icons-material/Assistant';
import PeopleIcon from '@mui/icons-material/People';
import {
	COMP_ID_CHAT,
	COMP_ID_CVLIB,
	COMP_ID_DASHBOARD,
	COMP_ID_JOBS,
	COMP_ID_REPORTS,
} from '../../../constants.js';

const AppMenuList = ({ handleContentChange }) => {
	const { t } = useTranslation();
	const [selectedItem, setSelectedItem] = useState(null);

	const handleNavigation = (newContent) => {
		setSelectedItem(newContent);
		handleContentChange(newContent);
	};

	const menuItems = [
		{ id: COMP_ID_DASHBOARD, icon: <LeaderboardOutlinedIcon sx={{ mr: 1 }} />, label: 'Dashboard' },
		{ id: COMP_ID_CVLIB, icon: <PeopleIcon sx={{ mr: 1 }} />, label: t('header.cvs') },
		{ id: COMP_ID_JOBS, icon: <WorkOutlineOutlinedIcon sx={{ mr: 1 }} />, label: t('header.jobs') },
		{ id: COMP_ID_REPORTS, icon: <AssessmentOutlinedIcon sx={{ mr: 1 }} />, label: t('header.reports') },
		{ id: COMP_ID_CHAT, icon: <AssistantIcon sx={{ mr: 1 }} />, label: t('header.aiResumeChat') || 'AI Resume Chat' },
	];

	return (
		<div>
			<Box sx={{ padding: 1, textAlign: 'left', borderBottom: '1px solid #ffffff33' }}>
				<Typography variant="h4" sx={{ fontWeight: 'bold' }}>Qorva</Typography>
			</Box>
			<List>
				{menuItems.map((item) => (
					<ListItem
						key={item.id}
						button
						onClick={() => handleNavigation(item.id)}
						sx={{
							cursor: 'pointer',
							backgroundColor: selectedItem === item.id ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
							'&:hover': {
								backgroundColor: selectedItem === item.id
									? 'rgba(0, 0, 0, 0.35)'
									: 'rgba(0, 0, 0, 0.2)'
							}
						}}
					>
						{item.icon}
						<ListItemText primary={item.label} />
					</ListItem>
				))}
			</List>
		</div>
	);
};

export default AppMenuList;
