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

/** Selected chat: candidate, job, linked report and chat actions. */
const ChatHeader = ({ contextOpen, handleUpdateStatus, headerMenuAnchor, linkedReport, navigate, selectedChat, setChatToDelete, setHeaderMenuAnchor, toggleContext, updatingStatusChatId }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			px: 2.5, py: 1.5, flexShrink: 0,
			backgroundColor: '#ffffff',
			borderBottom: '1px solid #e2e8f0',
			display: 'flex', alignItems: 'center', gap: 1.5,
		}}>
			{selectedChat ? (
				<>
					<Avatar sx={{ width: 28, height: 28, fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#629C44' }}>
						{(selectedChat.title || '?')[0].toUpperCase()}
					</Avatar>
					<Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a', flex: 1 }}>
						{selectedChat.title}
					</Typography>
					{linkedReport?.matchingReportDetails?.decisionSummary?.finalScore != null ? (
						<Tooltip title={t('appAIResumeChat.screeningScoreHint')}>
							<Chip
								size="small"
								icon={<AssessmentOutlinedIcon sx={{ fontSize: '13px !important' }} />}
								label={`${t('appAIResumeChat.screeningScore')}: ${Math.round(linkedReport.matchingReportDetails.decisionSummary.finalScore)}%`}
								onClick={() => navigate('/app/reports')}
								sx={{ fontSize: '0.72rem', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 600, height: 22, cursor: 'pointer' }}
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
								sx={{ fontSize: '0.72rem', color: '#92400e', borderColor: '#fcd34d', backgroundColor: '#fffbeb', height: 22, cursor: 'pointer' }}
							/>
						</Tooltip>
					)}
					{selectedChat.status === 'CLOSED' && (
						<Chip
							size="small"
							icon={<LockOutlinedIcon sx={{ fontSize: '12px !important' }} />}
							label={t('appAIResumeChat.closed')}
							sx={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#64748b', height: 22 }}
						/>
					)}
					{selectedChat.status === 'ARCHIVED' && (
						<Chip
							size="small"
							icon={<ArchiveOutlinedIcon sx={{ fontSize: '12px !important' }} />}
							label={t('appAIResumeChat.archived')}
							sx={{ fontSize: '0.72rem', backgroundColor: '#fef3c7', color: '#92400e', height: 22 }}
						/>
					)}
					<Tooltip title={t(contextOpen ? 'appAIResumeChat.hideContext' : 'appAIResumeChat.showContext')}>
						<IconButton
							size="small"
							onClick={toggleContext}
							sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, color: contextOpen ? '#629C44' : '#64748b', '&:hover': { backgroundColor: '#f1f5f9' } }}
						>
							<ViewSidebarOutlinedIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
					<Tooltip title={t('appAIResumeChat.chatOptions')}>
						<IconButton
							size="small"
							onClick={(e) => setHeaderMenuAnchor(e.currentTarget)}
							sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, color: '#64748b', '&:hover': { backgroundColor: '#f1f5f9' } }}
						>
							<MoreVertIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
					<Menu
						anchorEl={headerMenuAnchor}
						open={!!headerMenuAnchor}
						onClose={() => setHeaderMenuAnchor(null)}
						slotProps={{ paper: { elevation: 0, sx: { borderRadius: 2, border: '1px solid #e2e8f0', minWidth: 170 } } }}
					>
						{selectedChat.status === 'CLOSED' && (
							<MenuItem
								onClick={() => { handleUpdateStatus(selectedChat, 'OPEN'); setHeaderMenuAnchor(null); }}
								disabled={updatingStatusChatId === selectedChat.id}
								sx={{ fontSize: '0.82rem', gap: 1 }}
							>
								<ListItemIcon sx={{ minWidth: 0 }}>
									{updatingStatusChatId === selectedChat.id
										? <CircularProgress size={14} sx={{ color: '#629C44' }} />
										: <LockOpenOutlinedIcon fontSize="small" sx={{ color: '#629C44' }} />
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
										? <CircularProgress size={14} sx={{ color: '#629C44' }} />
										: <LockOutlinedIcon fontSize="small" sx={{ color: '#64748b' }} />
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
										? <CircularProgress size={14} sx={{ color: '#629C44' }} />
										: <ArchiveOutlinedIcon fontSize="small" sx={{ color: '#64748b' }} />
									}
								</ListItemIcon>
								{t('appAIResumeChat.archiveChat')}
							</MenuItem>
						)}
						<Divider sx={{ my: 0.5, borderColor: '#f1f5f9' }} />
						<MenuItem
							onClick={() => { setChatToDelete(selectedChat); setHeaderMenuAnchor(null); }}
							sx={{ fontSize: '0.82rem', color: '#ef4444', gap: 1 }}
						>
							<ListItemIcon sx={{ minWidth: 0 }}>
								<DeleteOutlineIcon fontSize="small" sx={{ color: '#ef4444' }} />
							</ListItemIcon>
							{t('appAIResumeChat.deleteChat')}
						</MenuItem>
					</Menu>
				</>
			) : (
				<Typography sx={{ fontSize: '0.85rem', color: '#94a3b8' }}>
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
