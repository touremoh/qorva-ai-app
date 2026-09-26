import PropTypes from 'prop-types';
import { Box, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import { useTranslation } from 'react-i18next';

/** Message box and send button; read-only notice for closed chats. */
const ChatComposer = ({ composer, handleSendMessage, selectedChat, setComposer }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ flexShrink: 0, backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
			{(selectedChat?.status === 'CLOSED' || selectedChat?.status === 'ARCHIVED') && (
				<Box sx={{ px: 2, py: 0.75, display: 'flex', alignItems: 'center', gap: 0.75, backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
					{selectedChat.status === 'ARCHIVED'
						? <ArchiveOutlinedIcon sx={{ fontSize: 13, color: '#92400e' }} />
						: <LockOutlinedIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
					}
					<Typography sx={{ fontSize: '0.75rem', color: selectedChat.status === 'ARCHIVED' ? '#92400e' : '#94a3b8' }}>
						{t(selectedChat.status === 'ARCHIVED' ? 'appAIResumeChat.chatArchived' : 'appAIResumeChat.chatClosed')}
					</Typography>
				</Box>
			)}
			<Box sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'flex', gap: 1, alignItems: 'flex-end' }}>
				<TextField
					fullWidth
					multiline
					minRows={3}
					maxRows={10}
					placeholder={t('appAIResumeChat.placeholder')}
					value={composer}
					onChange={(e) => setComposer(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault();
							if (composer.trim()) handleSendMessage();
						}
					}}
					disabled={!selectedChat || selectedChat?.status === 'CLOSED' || selectedChat?.status === 'ARCHIVED'}
					sx={{
						'& .MuiOutlinedInput-root': {
							borderRadius: 3, fontSize: '0.9rem', lineHeight: 1.5,
							padding: '12px 14px',
							backgroundColor: '#f8fafc',
							'&.Mui-focused': { backgroundColor: '#ffffff' },
						},
					}}
				/>
				<Tooltip title={t('appAIResumeChat.send')}>
					<span>
						<IconButton
							onClick={handleSendMessage}
							disabled={!selectedChat || !composer.trim() || selectedChat?.status === 'CLOSED' || selectedChat?.status === 'ARCHIVED'}
							sx={{
								backgroundColor: '#629C44', color: '#ffffff', borderRadius: 2,
								width: 42, height: 42, flexShrink: 0, mb: 0.25,
								'&:hover': { backgroundColor: '#4a7a33' },
								'&.Mui-disabled': { backgroundColor: '#e2e8f0', color: '#94a3b8' },
							}}
						>
							<SendRoundedIcon sx={{ fontSize: 17 }} />
						</IconButton>
					</span>
				</Tooltip>
			</Box>
			<Typography sx={{ px: 2.5, pb: 1, fontSize: '0.68rem', color: '#94a3b8' }}>
				{t('appAIResumeChat.composerHint')}
			</Typography>
		</Box>
		</>
	);
};

ChatComposer.propTypes = {
	composer: PropTypes.any,
	handleSendMessage: PropTypes.func,
	selectedChat: PropTypes.any,
	setComposer: PropTypes.func,
};

export default ChatComposer;
