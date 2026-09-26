import PropTypes from 'prop-types';
import { Box, Button, Chip, CircularProgress, IconButton, ListItemButton, Typography } from '@mui/material';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';

/** Searchable, paginated list of chats. */
const ChatListPanel = ({ chatHasMore, chatListOpen, chatPage, chats, fetchChatsPage, handleSelectChat, loadingChats, selectedChat, setListMenuAnchor, setStatusFilter, statusFilter, userLang }) => {
	const { t } = useTranslation();
	return (
		<>
		{chatListOpen && (
		<Box sx={{
			width: { xs: 200, sm: 240, md: 280 },
			flexShrink: 0,
			display: 'flex', flexDirection: 'column',
			borderRight: '1px solid #e2e8f0',
			backgroundColor: '#ffffff',
			overflow: 'hidden',
		}}>
			<Box sx={{ px: 1.5, pt: 1, pb: 0.75, borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
				<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
					{t('appAIResumeChat.chats')}
				</Typography>
				<Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
					{[
						{ value: null, labelKey: 'filterAll', activeBg: '#f1f5f9', activeColor: '#475569', activeBorder: '#cbd5e1' },
						{ value: 'OPEN', labelKey: 'open', activeBg: 'rgba(98,156,68,0.12)', activeColor: '#629C44', activeBorder: '#629C44' },
						{ value: 'CLOSED', labelKey: 'closed', activeBg: '#f1f5f9', activeColor: '#64748b', activeBorder: '#94a3b8' },
						{ value: 'ARCHIVED', labelKey: 'archived', activeBg: '#fef3c7', activeColor: '#92400e', activeBorder: '#d97706' },
					].map(({ value, labelKey, activeBg, activeColor, activeBorder }) => {
						const isSelected = statusFilter === value;
						return (
							<Chip
								key={value ?? 'all'}
								size="small"
								label={t(`appAIResumeChat.${labelKey}`)}
								onClick={() => setStatusFilter(value)}
								sx={{
									fontSize: '0.68rem', height: 20, cursor: 'pointer',
									backgroundColor: isSelected ? activeBg : 'transparent',
									color: isSelected ? activeColor : '#94a3b8',
									border: `1px solid ${isSelected ? activeBorder : '#e2e8f0'}`,
									'& .MuiChip-label': { px: 0.75 },
									'&:hover': { backgroundColor: activeBg, color: activeColor },
								}}
							/>
						);
					})}
				</Box>
			</Box>

			<Box sx={{ flex: 1, overflowY: 'auto', py: 0.5 }}>
				{loadingChats && chats.length === 0 ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', pt: 3 }}>
						<CircularProgress size={20} sx={{ color: '#629C44' }} />
					</Box>
				) : chats.length === 0 ? (
					<Box sx={{ px: 2, pt: 2 }}>
						<Typography sx={{ fontSize: '0.78rem', color: '#94a3b8' }}>
							{t('appAIResumeChat.noChatSelected')}
						</Typography>
					</Box>
				) : (
					chats.map((c) => {
						const isActive = selectedChat?.id === c.id;
						return (
							<ListItemButton
								key={c.id}
								onClick={() => handleSelectChat(c)}
								sx={{
									px: 1.5, py: 1,
									borderLeft: isActive ? '3px solid #629C44' : '3px solid transparent',
									backgroundColor: isActive ? 'rgba(98,156,68,0.06)' : 'transparent',
									'&:hover': { backgroundColor: isActive ? 'rgba(98,156,68,0.10)' : '#f8fafc' },
									gap: 1.5, alignItems: 'center',
								}}
							>
								<Box sx={{
									width: 30, height: 30, borderRadius: 1.5, flexShrink: 0,
									display: 'flex', alignItems: 'center', justifyContent: 'center',
									backgroundColor: isActive ? 'rgba(98,156,68,0.15)' : '#f1f5f9',
								}}>
									<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 14, color: isActive ? '#629C44' : '#94a3b8' }} />
								</Box>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography sx={{
										fontSize: '0.8rem', fontWeight: isActive ? 600 : 400,
										color: (c.status === 'CLOSED' || c.status === 'ARCHIVED') ? '#94a3b8' : '#0f172a', lineHeight: 1.3,
										overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
									}}>
										{c.title}
									</Typography>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
										<Typography sx={{ fontSize: '0.68rem', color: '#94a3b8' }}>
											{new Date(c.lastUpdatedAt || c.createdAt).toLocaleDateString(userLang || 'en')}
										</Typography>
										{c.status === 'CLOSED' && (
											<Chip size="small" label={t('appAIResumeChat.closed')} sx={{ fontSize: '0.6rem', height: 14, backgroundColor: '#f1f5f9', color: '#94a3b8', '& .MuiChip-label': { px: 0.75 } }} />
										)}
										{c.status === 'ARCHIVED' && (
											<Chip size="small" label={t('appAIResumeChat.archived')} sx={{ fontSize: '0.6rem', height: 14, backgroundColor: '#fef3c7', color: '#92400e', '& .MuiChip-label': { px: 0.75 } }} />
										)}
									</Box>
								</Box>
								<IconButton
									size="small"
									onClick={(e) => { e.stopPropagation(); setListMenuAnchor({ el: e.currentTarget, chat: c }); }}
									sx={{ flexShrink: 0, p: 0.4, color: '#94a3b8', '&:hover': { color: '#475569', backgroundColor: 'rgba(0,0,0,0.04)' } }}
								>
									<MoreVertIcon sx={{ fontSize: 16 }} />
								</IconButton>
							</ListItemButton>
						);
					})
				)}
				{chatHasMore && !loadingChats && (
					<Box sx={{ px: 1.5, py: 1 }}>
						<Button
							size="small" fullWidth
							onClick={() => fetchChatsPage(chatPage + 1, statusFilter)}
							sx={{ fontSize: '0.72rem', color: '#629C44', textTransform: 'none', borderRadius: 1.5 }}
						>
							{t('appAIResumeChat.loadMore')}
						</Button>
					</Box>
				)}
			</Box>
		</Box>
		)}
		</>
	);
};

ChatListPanel.propTypes = {
	chatHasMore: PropTypes.any,
	chatListOpen: PropTypes.any,
	chatPage: PropTypes.any,
	chats: PropTypes.any,
	fetchChatsPage: PropTypes.any,
	handleSelectChat: PropTypes.func,
	loadingChats: PropTypes.any,
	selectedChat: PropTypes.any,
	setListMenuAnchor: PropTypes.func,
	setStatusFilter: PropTypes.func,
	statusFilter: PropTypes.any,
	userLang: PropTypes.any,
};

export default ChatListPanel;
