import PropTypes from 'prop-types';
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import MenuOpenOutlinedIcon from '@mui/icons-material/MenuOpenOutlined';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';

/** Toggle the chat list, refresh, and start a new chat. */
const ChatToolbar = ({ chatListOpen, fetchChatsPage, loadingChats, openCreateChatModal, statusFilter, toggleChatList }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			display: 'flex', alignItems: 'center', gap: 1.5,
			px: 2, py: 1.5, flexShrink: 0,
			backgroundColor: tokens.surface.paper,
			borderBottom: `1px solid ${tokens.line.main}`,
		}}>
			<Tooltip title={t(chatListOpen ? 'appAIResumeChat.hideChats' : 'appAIResumeChat.showChats')}>
				<IconButton size="small" onClick={toggleChatList} sx={{ color: tokens.ink.muted, border: `1px solid ${tokens.line.main}`, borderRadius: 1.5 }}>
					{chatListOpen ? <MenuOpenOutlinedIcon sx={{ fontSize: tokens.iconSize.lg }} /> : <MenuOutlinedIcon sx={{ fontSize: tokens.iconSize.lg }} />}
				</IconButton>
			</Tooltip>
			<AutoAwesomeOutlinedIcon sx={{ color: tokens.brand.text, fontSize: tokens.iconSize.lg }} />
			<Typography sx={{ fontWeight: 600, fontSize: tokens.fontSize.body, color: tokens.ink.strong, flex: 1 }}>
				{t('header.aiResumeChat')}
			</Typography>
			<Tooltip title={t('appAIResumeChat.refresh')}>
				<span>
					<IconButton
						size="small"
						onClick={() => fetchChatsPage(0, statusFilter)}
						disabled={loadingChats}
						sx={{ border: `1px solid ${tokens.line.main}`, borderRadius: 1.5, color: tokens.ink.muted, '&:hover': { backgroundColor: tokens.surface.muted } }}
					>
						<RefreshOutlinedIcon sx={{ fontSize: tokens.iconSize.md }} />
					</IconButton>
				</span>
			</Tooltip>
			<Button
				variant="contained"
				size="small"
				startIcon={<AddCommentOutlinedIcon sx={{ fontSize: tokens.iconSize.md }} />}
				onClick={openCreateChatModal}
				disabled={loadingChats}
				sx={{
					backgroundColor: tokens.brand.main, borderRadius: 2, fontSize: tokens.fontSize.small, fontWeight: 600,
					textTransform: 'none', px: 1.5, py: 0.75, boxShadow: 'none',
					'&:hover': { backgroundColor: tokens.brand.pressed, boxShadow: 'none' },
				}}
			>
				{t('appAIResumeChat.createChat')}
			</Button>
		</Box>
		</>
	);
};

ChatToolbar.propTypes = {
	chatListOpen: PropTypes.any,
	fetchChatsPage: PropTypes.any,
	loadingChats: PropTypes.any,
	openCreateChatModal: PropTypes.func,
	statusFilter: PropTypes.any,
	toggleChatList: PropTypes.func,
};

export default ChatToolbar;
