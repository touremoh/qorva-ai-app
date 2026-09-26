import PropTypes from 'prop-types';
import { CircularProgress, Divider, ListItemIcon, Menu, MenuItem } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import { useTranslation } from 'react-i18next';

/** Per-chat menu: rename, close or reopen, delete. */
const ChatListMenu = ({ handleUpdateStatus, listMenuAnchor, setChatToDelete, setListMenuAnchor, updatingStatusChatId }) => {
	const { t } = useTranslation();
	return (
		<>
		<Menu
			anchorEl={listMenuAnchor?.el}
			open={!!listMenuAnchor}
			onClose={() => setListMenuAnchor(null)}
			slotProps={{ paper: { elevation: 0, sx: { borderRadius: 2, border: '1px solid #e2e8f0', minWidth: 170 } } }}
		>
			{listMenuAnchor?.chat?.status === 'CLOSED' && (
				<MenuItem
					onClick={() => { handleUpdateStatus(listMenuAnchor.chat, 'OPEN'); setListMenuAnchor(null); }}
					disabled={updatingStatusChatId === listMenuAnchor?.chat?.id}
					sx={{ fontSize: '0.82rem', gap: 1 }}
				>
					<ListItemIcon sx={{ minWidth: 0 }}>
						{updatingStatusChatId === listMenuAnchor?.chat?.id
							? <CircularProgress size={14} sx={{ color: '#629C44' }} />
							: <LockOpenOutlinedIcon fontSize="small" sx={{ color: '#629C44' }} />
						}
					</ListItemIcon>
					{t('appAIResumeChat.reopenChat')}
				</MenuItem>
			)}
			{listMenuAnchor?.chat?.status === 'OPEN' && (
				<MenuItem
					onClick={() => { handleUpdateStatus(listMenuAnchor.chat, 'CLOSED'); setListMenuAnchor(null); }}
					disabled={updatingStatusChatId === listMenuAnchor?.chat?.id}
					sx={{ fontSize: '0.82rem', gap: 1 }}
				>
					<ListItemIcon sx={{ minWidth: 0 }}>
						{updatingStatusChatId === listMenuAnchor?.chat?.id
							? <CircularProgress size={14} sx={{ color: '#629C44' }} />
							: <LockOutlinedIcon fontSize="small" sx={{ color: '#64748b' }} />
						}
					</ListItemIcon>
					{t('appAIResumeChat.closeChat')}
				</MenuItem>
			)}
			{listMenuAnchor?.chat?.status !== 'ARCHIVED' && (
				<MenuItem
					onClick={() => { handleUpdateStatus(listMenuAnchor.chat, 'ARCHIVED'); setListMenuAnchor(null); }}
					disabled={updatingStatusChatId === listMenuAnchor?.chat?.id}
					sx={{ fontSize: '0.82rem', gap: 1 }}
				>
					<ListItemIcon sx={{ minWidth: 0 }}>
						{updatingStatusChatId === listMenuAnchor?.chat?.id
							? <CircularProgress size={14} sx={{ color: '#629C44' }} />
							: <ArchiveOutlinedIcon fontSize="small" sx={{ color: '#64748b' }} />
						}
					</ListItemIcon>
					{t('appAIResumeChat.archiveChat')}
				</MenuItem>
			)}
			<Divider sx={{ my: 0.5, borderColor: '#f1f5f9' }} />
			<MenuItem
				onClick={() => { setChatToDelete(listMenuAnchor?.chat); setListMenuAnchor(null); }}
				sx={{ fontSize: '0.82rem', color: '#ef4444', gap: 1 }}
			>
				<ListItemIcon sx={{ minWidth: 0 }}>
					<DeleteOutlineIcon fontSize="small" sx={{ color: '#ef4444' }} />
				</ListItemIcon>
				{t('appAIResumeChat.deleteChat')}
			</MenuItem>
		</Menu>
		</>
	);
};

ChatListMenu.propTypes = {
	handleUpdateStatus: PropTypes.func,
	listMenuAnchor: PropTypes.any,
	setChatToDelete: PropTypes.func,
	setListMenuAnchor: PropTypes.func,
	updatingStatusChatId: PropTypes.any,
};

export default ChatListMenu;
