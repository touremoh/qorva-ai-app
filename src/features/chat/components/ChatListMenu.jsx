import PropTypes from 'prop-types';
import { CircularProgress, Divider, ListItemIcon, Menu, MenuItem } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';

/** Per-chat menu: rename, close or reopen, delete. */
const ChatListMenu = ({ handleUpdateStatus, listMenuAnchor, setChatToDelete, setListMenuAnchor, updatingStatusChatId }) => {
	const { t } = useTranslation();
	return (
		<>
		<Menu
			anchorEl={listMenuAnchor?.el}
			open={!!listMenuAnchor}
			onClose={() => setListMenuAnchor(null)}
			slotProps={{ paper: { elevation: 0, sx: { borderRadius: 2, border: `1px solid ${tokens.line.main}`, minWidth: 170 } } }}
		>
			{listMenuAnchor?.chat?.status === 'CLOSED' && (
				<MenuItem
					onClick={() => { handleUpdateStatus(listMenuAnchor.chat, 'OPEN'); setListMenuAnchor(null); }}
					disabled={updatingStatusChatId === listMenuAnchor?.chat?.id}
					sx={{ fontSize: tokens.fontSize.body2, gap: 1 }}
				>
					<ListItemIcon sx={{ minWidth: 0 }}>
						{updatingStatusChatId === listMenuAnchor?.chat?.id
							? <CircularProgress size={14} sx={{ color: tokens.brand.text }} />
							: <LockOpenOutlinedIcon fontSize="small" sx={{ color: tokens.brand.text }} />
						}
					</ListItemIcon>
					{t('appAIResumeChat.reopenChat')}
				</MenuItem>
			)}
			{listMenuAnchor?.chat?.status === 'OPEN' && (
				<MenuItem
					onClick={() => { handleUpdateStatus(listMenuAnchor.chat, 'CLOSED'); setListMenuAnchor(null); }}
					disabled={updatingStatusChatId === listMenuAnchor?.chat?.id}
					sx={{ fontSize: tokens.fontSize.body2, gap: 1 }}
				>
					<ListItemIcon sx={{ minWidth: 0 }}>
						{updatingStatusChatId === listMenuAnchor?.chat?.id
							? <CircularProgress size={14} sx={{ color: tokens.brand.text }} />
							: <LockOutlinedIcon fontSize="small" sx={{ color: tokens.ink.muted }} />
						}
					</ListItemIcon>
					{t('appAIResumeChat.closeChat')}
				</MenuItem>
			)}
			{listMenuAnchor?.chat?.status !== 'ARCHIVED' && (
				<MenuItem
					onClick={() => { handleUpdateStatus(listMenuAnchor.chat, 'ARCHIVED'); setListMenuAnchor(null); }}
					disabled={updatingStatusChatId === listMenuAnchor?.chat?.id}
					sx={{ fontSize: tokens.fontSize.body2, gap: 1 }}
				>
					<ListItemIcon sx={{ minWidth: 0 }}>
						{updatingStatusChatId === listMenuAnchor?.chat?.id
							? <CircularProgress size={14} sx={{ color: tokens.brand.text }} />
							: <ArchiveOutlinedIcon fontSize="small" sx={{ color: tokens.ink.muted }} />
						}
					</ListItemIcon>
					{t('appAIResumeChat.archiveChat')}
				</MenuItem>
			)}
			<Divider sx={{ my: 0.5, borderColor: tokens.surface.muted }} />
			<MenuItem
				onClick={() => { setChatToDelete(listMenuAnchor?.chat); setListMenuAnchor(null); }}
				sx={{ fontSize: tokens.fontSize.body2, color: tokens.status.error.bright, gap: 1 }}
			>
				<ListItemIcon sx={{ minWidth: 0 }}>
					<DeleteOutlineIcon fontSize="small" sx={{ color: tokens.status.error.bright }} />
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
