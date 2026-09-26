import PropTypes from 'prop-types';
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import MenuOpenOutlinedIcon from '@mui/icons-material/MenuOpenOutlined';
import { useTranslation } from 'react-i18next';

/** Toggle the chat list, refresh, and start a new chat. */
const ChatToolbar = ({ chatListOpen, fetchChatsPage, loadingChats, openCreateChatModal, statusFilter, toggleChatList }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{
			display: 'flex', alignItems: 'center', gap: 1.5,
			px: 2, py: 1.5, flexShrink: 0,
			backgroundColor: '#ffffff',
			borderBottom: '1px solid #e2e8f0',
		}}>
			<Tooltip title={t(chatListOpen ? 'appAIResumeChat.hideChats' : 'appAIResumeChat.showChats')}>
				<IconButton size="small" onClick={toggleChatList} sx={{ color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 1.5 }}>
					{chatListOpen ? <MenuOpenOutlinedIcon sx={{ fontSize: 18 }} /> : <MenuOutlinedIcon sx={{ fontSize: 18 }} />}
				</IconButton>
			</Tooltip>
			<AutoAwesomeOutlinedIcon sx={{ color: '#629C44', fontSize: 20 }} />
			<Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', flex: 1 }}>
				{t('header.aiResumeChat')}
			</Typography>
			<Tooltip title={t('appAIResumeChat.refresh')}>
				<span>
					<IconButton
						size="small"
						onClick={() => fetchChatsPage(0, statusFilter)}
						disabled={loadingChats}
						sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, color: '#64748b', '&:hover': { backgroundColor: '#f1f5f9' } }}
					>
						<RefreshOutlinedIcon sx={{ fontSize: 16 }} />
					</IconButton>
				</span>
			</Tooltip>
			<Button
				variant="contained"
				size="small"
				startIcon={<AddCommentOutlinedIcon sx={{ fontSize: 16 }} />}
				onClick={openCreateChatModal}
				disabled={loadingChats}
				sx={{
					backgroundColor: '#629C44', borderRadius: 2, fontSize: '0.78rem', fontWeight: 600,
					textTransform: 'none', px: 1.5, py: 0.75, boxShadow: 'none',
					'&:hover': { backgroundColor: '#4a7a33', boxShadow: 'none' },
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
