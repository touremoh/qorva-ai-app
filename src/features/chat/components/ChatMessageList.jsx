import PropTypes from 'prop-types';
import { Box, Button, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckIcon from '@mui/icons-material/Check';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ChatMarkdown from './ChatMarkdown.jsx';
import TypingDots from './TypingDots.jsx';
import { useTranslation } from 'react-i18next';

/** The conversation: messages, typing indicator, empty states. */
const ChatMessageList = ({ assistantTyping, copiedMessageId, fetchMessagesPage, handleCopyMessage, handleRetryMessage, loadingMessages, messages, messagesEndRef, msgHasMore, msgPage, selectedChat, userLang }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
			{!selectedChat ? (
				<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
					<AutoAwesomeOutlinedIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
					<Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
						{t('appAIResumeChat.noChatSelected')}
					</Typography>
				</Box>
			) : (
				<>
					{msgHasMore && !loadingMessages && (
						<Box sx={{ display: 'flex', justifyContent: 'center' }}>
							<Button
								size="small"
								onClick={() => fetchMessagesPage(selectedChat.id, msgPage + 1)}
								sx={{ fontSize: '0.72rem', color: '#629C44', textTransform: 'none', borderRadius: 2 }}
							>
								{t('appAIResumeChat.loadOlder')}
							</Button>
						</Box>
					)}
					{loadingMessages && (
						<Box sx={{ display: 'flex', justifyContent: 'center' }}>
							<CircularProgress size={18} sx={{ color: '#629C44' }} />
						</Box>
					)}

					{messages.map((m) => {
						const isUser = m.role === 'USER';
						return (
							<Box key={m.id} sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', gap: 1, alignItems: 'flex-end' }}>
								{!isUser && (
									<Box sx={{
										width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
										display: 'flex', alignItems: 'center', justifyContent: 'center',
										backgroundColor: 'rgba(98,156,68,0.12)',
									}}>
										<SmartToyOutlinedIcon sx={{ fontSize: 14, color: '#629C44' }} />
									</Box>
								)}
								<Box sx={{
									maxWidth: isUser ? '72%' : '88%',
									minWidth: 0,
									px: 1.75, py: 1.25,
									borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
									backgroundColor: isUser ? 'rgba(98,156,68,0.10)' : '#ffffff',
									border: `1px solid ${m.failed ? 'rgba(185,28,28,0.35)' : isUser ? 'rgba(98,156,68,0.25)' : '#e2e8f0'}`,
									boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
								}}>
									<Typography sx={{
										fontSize: '0.72rem', fontWeight: 600,
										color: isUser ? '#629C44' : '#94a3b8',
										mb: 0.5,
										display: 'flex', alignItems: 'center', gap: 0.5,
									}}>
										{isUser
											? <><PersonOutlineOutlinedIcon sx={{ fontSize: 12 }} />{t('appAIResumeChat.you')}</>
											: <><SmartToyOutlinedIcon sx={{ fontSize: 12 }} />{t('appAIResumeChat.assistant')}</>
										}
									</Typography>
									{isUser ? (
										<Typography sx={{ fontSize: '0.85rem', color: '#0f172a', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
											{m.content}
										</Typography>
									) : (
										<ChatMarkdown content={m.content} />
									)}
									{m.failed ? (
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75, flexWrap: 'wrap' }}>
											<ErrorOutlineOutlinedIcon sx={{ fontSize: 14, color: '#b91c1c' }} />
											<Typography sx={{ fontSize: '0.7rem', color: '#b91c1c' }}>
												{m.error || t('appAIResumeChat.sendFailed')}
											</Typography>
											<Button
												size="small"
												startIcon={<ReplayOutlinedIcon sx={{ fontSize: 14 }} />}
												onClick={() => handleRetryMessage(m)}
												disabled={assistantTyping}
												sx={{ fontSize: '0.7rem', color: '#629C44', textTransform: 'none', minWidth: 0, px: 0.75, py: 0 }}
											>
												{t('appAIResumeChat.retry')}
											</Button>
										</Box>
									) : (
										<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isUser ? 'flex-end' : 'space-between', mt: 0.5, gap: 1 }}>
											<Typography sx={{ fontSize: '0.65rem', color: '#94a3b8' }}>
												{new Date(m.createdAt).toLocaleTimeString(userLang || 'en', { hour: '2-digit', minute: '2-digit' })}
											</Typography>
											{!isUser && (
												<Tooltip title={copiedMessageId === m.id ? t('appAIResumeChat.copied') : t('appAIResumeChat.copyAnswer')}>
													<IconButton size="small" onClick={() => handleCopyMessage(m)} sx={{ p: 0.25, color: copiedMessageId === m.id ? '#629C44' : '#94a3b8' }}>
														{copiedMessageId === m.id ? <CheckIcon sx={{ fontSize: 13 }} /> : <ContentCopyOutlinedIcon sx={{ fontSize: 13 }} />}
													</IconButton>
												</Tooltip>
											)}
										</Box>
									)}
								</Box>
								{isUser && (
									<Box sx={{
										width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
										display: 'flex', alignItems: 'center', justifyContent: 'center',
										backgroundColor: 'rgba(98,156,68,0.15)',
									}}>
										<PersonOutlineOutlinedIcon sx={{ fontSize: 14, color: '#629C44' }} />
									</Box>
								)}
							</Box>
						);
					})}

					{assistantTyping && (
						<Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1, alignItems: 'flex-end' }}>
							<Box sx={{
								width: 26, height: 26, borderRadius: '50%',
								display: 'flex', alignItems: 'center', justifyContent: 'center',
								backgroundColor: 'rgba(98,156,68,0.12)',
							}}>
								<SmartToyOutlinedIcon sx={{ fontSize: 14, color: '#629C44' }} />
							</Box>
							<TypingDots />
						</Box>
					)}
					<div ref={messagesEndRef} />
				</>
			)}
		</Box>
		</>
	);
};

ChatMessageList.propTypes = {
	assistantTyping: PropTypes.any,
	copiedMessageId: PropTypes.any,
	fetchMessagesPage: PropTypes.any,
	handleCopyMessage: PropTypes.func,
	handleRetryMessage: PropTypes.func,
	loadingMessages: PropTypes.any,
	messages: PropTypes.any,
	messagesEndRef: PropTypes.any,
	msgHasMore: PropTypes.any,
	msgPage: PropTypes.any,
	selectedChat: PropTypes.any,
	userLang: PropTypes.any,
};

export default ChatMessageList;
