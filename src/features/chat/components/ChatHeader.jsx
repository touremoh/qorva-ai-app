import PropTypes from 'prop-types';
import { Avatar, Box, Chip, CircularProgress, Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';

/** Selected chat: candidate, job, linked report and chat actions. */
const ChatHeader = ({ contextOpen, handleUpdateStatus, headerMenuAnchor, linkedReport, navigate, selectedChat, setChatToDelete, setHeaderMenuAnchor, toggleContext, updatingStatusChatId }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			px: 2.5, py: 1.5, flexShrink: 0,
			backgroundColor: tokens.surface.paper,
			borderBottom: `1px solid ${tokens.line.main}`,
			display: 'flex', alignItems: 'center', gap: 1.5,
		}}>
			{selectedChat ? (
				<>
					<Avatar sx={{ width: 28, height: 28, fontSize: '0.65rem', fontWeight: 700, backgroundColor: tokens.brand.main }}>
						{(selectedChat.title || '?')[0].toUpperCase()}
					</Avatar>
					<Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: tokens.ink.strong, flex: 1 }}>
						{selectedChat.title}
					</Typography>
					{linkedReport?.matchingReportDetails?.decisionSummary?.finalScore != null ? (
						<Tooltip title={t('appAIResumeChat.screeningScoreHint')}>
							<Chip
								size="small"
								icon={<AssessmentOutlinedIcon sx={{ fontSize: '13px !important' }} />}
								label={`${t('appAIResumeChat.screeningScore')}: ${Math.round(linkedReport.matchingReportDetails.decisionSummary.finalScore)}%`}
								onClick={() => navigate('/app/reports')}
								sx={{ fontSize: '0.72rem', backgroundColor: tokens.status.success.tint, color: tokens.status.success.text, fontWeight: 600, height: 22, cursor: 'pointer' }}
							/>
						</Tooltip>
					) : !linkedReport && (
						<Tooltip title={t('appAIResumeChat.noReportYetHint')}>
							<Chip
								size="small"
								icon={<AssessmentOutlinedIcon sx={{ fontSize: '13px !important' }} />}
								label={t('appAIResumeChat.runScreening')}
								onClick={() => navigate('/app/reports')}
								variant="outlined"
								sx={{ fontSize: '0.72rem', color: tokens.status.warning.text, borderColor: tokens.status.warning.border2, backgroundColor: tokens.status.warning.pale, height: 22, cursor: 'pointer' }}
							/>
						</Tooltip>
					)}
					{selectedChat.status === 'CLOSED' && (
						<Chip
							size="small"
							icon={<LockOutlinedIcon sx={{ fontSize: '12px !important' }} />}
							label={t('appAIResumeChat.closed')}
							sx={{ fontSize: '0.72rem', backgroundColor: tokens.surface.muted, color: tokens.ink.muted, height: 22 }}
						/>
					)}
					{selectedChat.status === 'ARCHIVED' && (
						<Chip
							size="small"
							icon={<ArchiveOutlinedIcon sx={{ fontSize: '12px !important' }} />}
							label={t('appAIResumeChat.archived')}
							sx={{ fontSize: '0.72rem', backgroundColor: tokens.status.warning.tintAlt, color: tokens.status.warning.text, height: 22 }}
						/>
					)}
					<Tooltip title={t(contextOpen ? 'appAIResumeChat.hideContext' : 'appAIResumeChat.showContext')}>
						<IconButton
							size="small"
							onClick={toggleContext}
							sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 1.5, color: contextOpen ? `${tokens.brand.main}` : `${tokens.ink.muted}`, '&:hover': { backgroundColor: tokens.surface.muted } }}
						>
							<ViewSidebarOutlinedIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
					<Tooltip title={t('appAIResumeChat.chatOptions')}>
						<IconButton
							size="small"
							onClick={(e) => setHeaderMenuAnchor(e.currentTarget)}
							sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 1.5, color: tokens.ink.muted, '&:hover': { backgroundColor: tokens.surface.muted } }}
						>
							<MoreVertIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
					<Menu
						anchorEl={headerMenuAnchor}
						open={!!headerMenuAnchor}
						onClose={() => setHeaderMenuAnchor(null)}
						slotProps={{ paper: { elevation: 0, sx: { borderRadius: 2, border: `1px solid ${tokens.line.main}`, minWidth: 170 } } }}
					>
						{selectedChat.status === 'CLOSED' && (
							<MenuItem
								onClick={() => { handleUpdateStatus(selectedChat, 'OPEN'); setHeaderMenuAnchor(null); }}
								disabled={updatingStatusChatId === selectedChat.id}
								sx={{ fontSize: '0.82rem', gap: 1 }}
							>
								<ListItemIcon sx={{ minWidth: 0 }}>
									{updatingStatusChatId === selectedChat.id
										? <CircularProgress size={14} sx={{ color: tokens.brand.text }} />
										: <LockOpenOutlinedIcon fontSize="small" sx={{ color: tokens.brand.text }} />
									}
								</ListItemIcon>
								{t('appAIResumeChat.reopenChat')}
							</MenuItem>
						)}
						{selectedChat.status === 'OPEN' && (
							<MenuItem
								onClick={() => { handleUpdateStatus(selectedChat, 'CLOSED'); setHeaderMenuAnchor(null); }}
								disabled={updatingStatusChatId === selectedChat.id}
								sx={{ fontSize: '0.82rem', gap: 1 }}
							>
								<ListItemIcon sx={{ minWidth: 0 }}>
									{updatingStatusChatId === selectedChat.id
										? <CircularProgress size={14} sx={{ color: tokens.brand.text }} />
										: <LockOutlinedIcon fontSize="small" sx={{ color: tokens.ink.muted }} />
									}
								</ListItemIcon>
								{t('appAIResumeChat.closeChat')}
							</MenuItem>
						)}
						{selectedChat.status !== 'ARCHIVED' && (
							<MenuItem
								onClick={() => { handleUpdateStatus(selectedChat, 'ARCHIVED'); setHeaderMenuAnchor(null); }}
								disabled={updatingStatusChatId === selectedChat.id}
								sx={{ fontSize: '0.82rem', gap: 1 }}
							>
								<ListItemIcon sx={{ minWidth: 0 }}>
									{updatingStatusChatId === selectedChat.id
										? <CircularProgress size={14} sx={{ color: tokens.brand.text }} />
										: <ArchiveOutlinedIcon fontSize="small" sx={{ color: tokens.ink.muted }} />
									}
								</ListItemIcon>
								{t('appAIResumeChat.archiveChat')}
							</MenuItem>
						)}
						<Divider sx={{ my: 0.5, borderColor: tokens.surface.muted }} />
						<MenuItem
							onClick={() => { setChatToDelete(selectedChat); setHeaderMenuAnchor(null); }}
							sx={{ fontSize: '0.82rem', color: tokens.status.error.bright, gap: 1 }}
						>
							<ListItemIcon sx={{ minWidth: 0 }}>
								<DeleteOutlineIcon fontSize="small" sx={{ color: tokens.status.error.bright }} />
							</ListItemIcon>
							{t('appAIResumeChat.deleteChat')}
						</MenuItem>
					</Menu>
				</>
			) : (
				<Typography sx={{ fontSize: '0.85rem', color: tokens.ink.subtle }}>
					{t('appAIResumeChat.selectChat')}
				</Typography>
			)}
		</Box>
		</>
	);
};

ChatHeader.propTypes = {
	contextOpen: PropTypes.any,
	handleUpdateStatus: PropTypes.func,
	headerMenuAnchor: PropTypes.any,
	linkedReport: PropTypes.any,
	navigate: PropTypes.any,
	selectedChat: PropTypes.any,
	setChatToDelete: PropTypes.func,
	setHeaderMenuAnchor: PropTypes.func,
	toggleContext: PropTypes.func,
	updatingStatusChatId: PropTypes.any,
};

export default ChatHeader;
