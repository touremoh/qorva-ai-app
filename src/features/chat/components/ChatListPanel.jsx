import PropTypes from 'prop-types';
import { Box, Button, Chip, CircularProgress, IconButton, ListItemButton, Typography } from '@mui/material';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

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
			borderRight: `1px solid ${tokens.line.main}`,
			backgroundColor: tokens.surface.paper,
			overflow: 'hidden',
		}}>
			<Box sx={{ px: 1.5, pt: 1, pb: 0.75, borderBottom: `1px solid ${tokens.surface.muted}`, flexShrink: 0 }}>
				<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: tokens.ink.subtle, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
					{t('appAIResumeChat.chats')}
				</Typography>
				<Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
					{[
						{ value: null, labelKey: 'filterAll', activeBg: tokens.surface.muted, activeColor: tokens.ink.soft, activeBorder: tokens.line.strong },
						{ value: 'OPEN', labelKey: 'open', activeBg: alpha(tokens.brand.main, 0.12), activeColor: tokens.brand.text, activeBorder: tokens.brand.main },
						{ value: 'CLOSED', labelKey: 'closed', activeBg: tokens.surface.muted, activeColor: tokens.ink.muted, activeBorder: tokens.ink.subtle },
						{ value: 'ARCHIVED', labelKey: 'archived', activeBg: tokens.status.warning.tintAlt, activeColor: tokens.status.warning.text, activeBorder: tokens.status.warning.main },
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
									color: isSelected ? activeColor : `${tokens.ink.subtle}`,
									border: `1px solid ${isSelected ? activeBorder : `${tokens.line.main}`}`,
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
						<CircularProgress size={20} sx={{ color: tokens.brand.text }} />
					</Box>
				) : chats.length === 0 ? (
					<Box sx={{ px: 2, pt: 2 }}>
						<Typography sx={{ fontSize: '0.78rem', color: tokens.ink.subtle }}>
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
									borderLeft: isActive ? `3px solid ${tokens.brand.main}` : '3px solid transparent',
									backgroundColor: isActive ? alpha(tokens.brand.main, 0.06) : 'transparent',
									'&:hover': { backgroundColor: isActive ? alpha(tokens.brand.main, 0.10) : `${tokens.surface.subtle}` },
									gap: 1.5, alignItems: 'center',
								}}
							>
								<Box sx={{
									width: 30, height: 30, borderRadius: 1.5, flexShrink: 0,
									display: 'flex', alignItems: 'center', justifyContent: 'center',
									backgroundColor: isActive ? alpha(tokens.brand.main, 0.15) : `${tokens.surface.muted}`,
								}}>
									<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 14, color: isActive ? `${tokens.brand.main}` : `${tokens.ink.subtle}` }} />
								</Box>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography sx={{
										fontSize: '0.8rem', fontWeight: isActive ? 600 : 400,
										color: (c.status === 'CLOSED' || c.status === 'ARCHIVED') ? `${tokens.ink.subtle}` : `${tokens.ink.strong}`, lineHeight: 1.3,
										overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
									}}>
										{c.title}
									</Typography>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
										<Typography sx={{ fontSize: '0.68rem', color: tokens.ink.subtle }}>
											{new Date(c.lastUpdatedAt || c.createdAt).toLocaleDateString(userLang || 'en')}
										</Typography>
										{c.status === 'CLOSED' && (
											<Chip size="small" label={t('appAIResumeChat.closed')} sx={{ fontSize: '0.6rem', height: 14, backgroundColor: tokens.surface.muted, color: tokens.ink.subtle, '& .MuiChip-label': { px: 0.75 } }} />
										)}
										{c.status === 'ARCHIVED' && (
											<Chip size="small" label={t('appAIResumeChat.archived')} sx={{ fontSize: '0.6rem', height: 14, backgroundColor: tokens.status.warning.tintAlt, color: tokens.status.warning.text, '& .MuiChip-label': { px: 0.75 } }} />
										)}
									</Box>
								</Box>
								<IconButton
									size="small"
									onClick={(e) => { e.stopPropagation(); setListMenuAnchor({ el: e.currentTarget, chat: c }); }}
									sx={{ flexShrink: 0, p: 0.4, color: tokens.ink.subtle, '&:hover': { color: tokens.ink.soft, backgroundColor: 'rgba(0,0,0,0.04)' } }}
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
							sx={{ fontSize: '0.72rem', color: tokens.brand.text, textTransform: 'none', borderRadius: 1.5 }}
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
