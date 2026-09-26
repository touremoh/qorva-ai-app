import PropTypes from 'prop-types';
import { Box, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import { useTranslation } from 'react-i18next';
import * as tokens from '../../../theme/tokens.js';

/** Message box and send button; read-only notice for closed chats. */
const ChatComposer = ({ composer, handleSendMessage, selectedChat, setComposer }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ flexShrink: 0, backgroundColor: tokens.surface.paper, borderTop: `1px solid ${tokens.line.main}` }}>
			{(selectedChat?.status === 'CLOSED' || selectedChat?.status === 'ARCHIVED') && (
				<Box sx={{ px: 2, py: 0.75, display: 'flex', alignItems: 'center', gap: 0.75, backgroundColor: tokens.surface.subtle, borderBottom: `1px solid ${tokens.surface.muted}` }}>
					{selectedChat.status === 'ARCHIVED'
						? <ArchiveOutlinedIcon sx={{ fontSize: 13, color: tokens.status.warning.text }} />
						: <LockOutlinedIcon sx={{ fontSize: 13, color: tokens.ink.subtle }} />
					}
					<Typography sx={{ fontSize: '0.75rem', color: selectedChat.status === 'ARCHIVED' ? `${tokens.status.warning.text}` : `${tokens.ink.subtle}` }}>
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
							backgroundColor: tokens.surface.subtle,
							'&.Mui-focused': { backgroundColor: tokens.surface.paper },
						},
					}}
				/>
				<Tooltip title={t('appAIResumeChat.send')}>
					<span>
						<IconButton
							onClick={handleSendMessage}
							disabled={!selectedChat || !composer.trim() || selectedChat?.status === 'CLOSED' || selectedChat?.status === 'ARCHIVED'}
							sx={{
								backgroundColor: tokens.brand.main, color: tokens.ink.inverse, borderRadius: 2,
								width: 42, height: 42, flexShrink: 0, mb: 0.25,
								'&:hover': { backgroundColor: tokens.brand.pressed },
								'&.Mui-disabled': { backgroundColor: tokens.line.main, color: tokens.ink.subtle },
							}}
						>
							<SendRoundedIcon sx={{ fontSize: 17 }} />
						</IconButton>
					</span>
				</Tooltip>
			</Box>
			<Typography sx={{ px: 2.5, pb: 1, fontSize: '0.68rem', color: tokens.ink.subtle }}>
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
