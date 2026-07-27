import React, { useEffect, useState } from 'react';
import { Badge, Box, Collapse, IconButton, List, ListItemButton, Tooltip, Typography } from '@mui/material';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { useTranslation } from 'react-i18next';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
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
} from '../../../constants.js';
import PropTypes from 'prop-types';

const AppMenuList = ({ handleContentChange, isChatAllowed, collapsed, onToggleCollapse }) => {
	const { t } = useTranslation();
	const [selectedItem, setSelectedItem] = useState(COMP_ID_DASHBOARD);
	const [openGroups, setOpenGroups] = useState({});
	const [qualityIssueCount, setQualityIssueCount] = useState(0);

	// Sidebar badge: cheap cached summary on mount + every 5 min; instant update via the
	// qorva:quality-changed event dispatched whenever the quality page loads/mutates data.
	useEffect(() => {
		let cancelled = false;
		const fetchSummary = async () => {
			try {
				const { getLibraryQualitySummary } = await import('../../../services/libraryQualityService.js');
				const res = await getLibraryQualitySummary();
				const data = res.data?.data ?? res.data;
				if (!cancelled && Number.isFinite(data?.openIssueCount)) {
					setQualityIssueCount(data.openIssueCount);
				}
			} catch { /* badge is best-effort */ }
		};
		fetchSummary();
		const interval = setInterval(fetchSummary, 5 * 60 * 1000);
		const onChanged = (event) => {
			if (Number.isFinite(event.detail?.openIssueCount)) {
				setQualityIssueCount(event.detail.openIssueCount);
			} else {
				fetchSummary();
			}
		};
		window.addEventListener('qorva:quality-changed', onChanged);
		return () => {
			cancelled = true;
			clearInterval(interval);
			window.removeEventListener('qorva:quality-changed', onChanged);
		};
	}, []);

	const handleNavigation = (id) => {
		setSelectedItem(id);
		handleContentChange(id);
	};

	const menuItems = [
		{ id: COMP_ID_DASHBOARD, Icon: LeaderboardOutlinedIcon, label: 'Dashboard',                              display: true },
		{ groupId: 'RESUME_LIBRARY', Icon: PeopleOutlinedIcon,  label: t('header.cvs'),                         display: true,
			children: [
				{ id: COMP_ID_CVLIB,           Icon: DescriptionOutlinedIcon, label: t('header.resumes', 'All Resumes'),           display: true },
				{ id: COMP_ID_LIBRARY_QUALITY, Icon: FactCheckOutlinedIcon,   label: t('header.libraryQuality', 'Library Quality'), display: true,
					badge: qualityIssueCount,
					badgeTooltip: t('libraryQuality.badgeTooltip', '{{count}} issues to fix', { count: qualityIssueCount }) },
			] },
		{ id: COMP_ID_JOBS,         Icon: WorkOutlineOutlinedIcon,  label: t('header.jobs'),                      display: true },
		{ id: COMP_ID_REPORTS,      Icon: AssessmentOutlinedIcon,   label: t('header.reports'),                   display: true },
		{ id: COMP_ID_INTELLIGENCE, Icon: PsychologyOutlinedIcon,   label: t('header.intelligence', 'Intelligence'), display: true },
		{ id: COMP_ID_CHAT,             Icon: AutoAwesomeOutlinedIcon, label: t('header.aiResumeChat') || 'AI Chat',              display: isChatAllowed },
		{ id: COMP_ID_USAGE_MONITORING, Icon: SpeedOutlinedIcon,       label: t('header.usageMonitoring', 'Usage Monitoring'),   display: true },
		{ id: COMP_ID_SETTINGS,         Icon: TuneOutlinedIcon,        label: t('header.accountSettings'),                      display: true },
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

					const renderLeaf = (entry, isChild = false) => {
						const { Icon } = entry;
						const isActive = selectedItem === entry.id;
						const showBadge = Number.isFinite(entry.badge) && entry.badge > 0;
						return (
							<ListItemButton
								key={entry.id}
								onClick={() => handleNavigation(entry.id)}
								title={collapsed ? entry.label : undefined}
								sx={{
									borderRadius: 1.5,
									mb: 0.5,
									px: collapsed ? 0 : 1.5,
									pl: collapsed ? 0 : (isChild ? 3.5 : 1.5),
									py: isChild ? 0.7 : 0.9,
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
								{collapsed && showBadge ? (
									<Badge variant="dot" sx={{ '& .MuiBadge-badge': { backgroundColor: '#dc2626' } }}>
										<Icon sx={{ fontSize: isChild ? 16 : 18, flexShrink: 0 }} />
									</Badge>
								) : (
									<Icon sx={{ fontSize: isChild ? 16 : 18, mr: collapsed ? 0 : 1.5, flexShrink: 0 }} />
								)}
								{!collapsed && (
									<Typography
										sx={{
											flex: 1,
											fontSize: isChild ? '0.78rem' : '0.84rem',
											fontWeight: isActive ? 600 : 400,
											lineHeight: 1.2,
											letterSpacing: '-0.01em',
										}}
									>
										{entry.label}
									</Typography>
								)}
								{!collapsed && showBadge && (
									<Tooltip title={entry.badgeTooltip ?? ''} placement="right">
										<Box sx={{
											px: 0.7, py: 0.1, borderRadius: 2, flexShrink: 0,
											backgroundColor: '#dc2626', color: '#ffffff',
											fontSize: '0.62rem', fontWeight: 700, lineHeight: 1.6,
										}}>
											{entry.badge > 99 ? '99+' : entry.badge}
										</Box>
									</Tooltip>
								)}
							</ListItemButton>
						);
					};

					// Plain item
					if (!item.children) {
						return renderLeaf(item);
					}

					const visibleChildren = item.children.filter((child) => child.display);

					// Collapsed rail has no room for expansion — show the children as flat icons
					if (collapsed) {
						return visibleChildren.map((child) => renderLeaf(child));
					}

					// Expandable group: parent toggles, children render inside a Collapse
					const { Icon } = item;
					const childActive = visibleChildren.some((child) => child.id === selectedItem);
					const isOpen = openGroups[item.groupId] ?? childActive;
					return (
						<React.Fragment key={item.groupId}>
							<ListItemButton
								onClick={() => setOpenGroups((prev) => ({ ...prev, [item.groupId]: !isOpen }))}
								sx={{
									borderRadius: 1.5,
									mb: 0.5,
									px: 1.5,
									py: 0.9,
									color: childActive ? '#ffffff' : 'rgba(255,255,255,0.55)',
									borderLeft: childActive && !isOpen ? '3px solid #629C44' : '3px solid transparent',
									transition: 'all 0.15s ease',
									'&:hover': { backgroundColor: 'rgba(255,255,255,0.06)', color: '#ffffff' },
								}}
							>
								<Icon sx={{ fontSize: 18, mr: 1.5, flexShrink: 0 }} />
								<Typography sx={{ flex: 1, fontSize: '0.84rem', fontWeight: childActive ? 600 : 400, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
									{item.label}
								</Typography>
								{isOpen
									? <ExpandLessRoundedIcon sx={{ fontSize: 17, opacity: 0.7 }} />
									: <ExpandMoreRoundedIcon sx={{ fontSize: 17, opacity: 0.7 }} />}
							</ListItemButton>
							<Collapse in={isOpen} timeout="auto" unmountOnExit>
								{visibleChildren.map((child) => renderLeaf(child, true))}
							</Collapse>
						</React.Fragment>
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
