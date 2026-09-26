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
import * as tokens from '../../../theme/tokens.js';
import { alpha } from '@mui/material/styles';

/** The conversation: messages, typing indicator, empty states. */
const ChatMessageList = ({ assistantTyping, copiedMessageId, fetchMessagesPage, handleCopyMessage, handleRetryMessage, loadingMessages, messages, messagesEndRef, msgHasMore, msgPage, selectedChat, userLang }) => {
	const { t } = useTranslation();
	return (
		<>
		<Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
			{!selectedChat ? (
				<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
					<AutoAwesomeOutlinedIcon sx={{ fontSize: 40, color: tokens.ink.faint }} />
					<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.subtle, fontWeight: 500 }}>
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
								sx={{ fontSize: tokens.fontSize.caption, color: tokens.brand.text, textTransform: 'none', borderRadius: 2 }}
							>
								{t('appAIResumeChat.loadOlder')}
							</Button>
						</Box>
					)}
					{loadingMessages && (
						<Box sx={{ display: 'flex', justifyContent: 'center' }}>
							<CircularProgress size={18} sx={{ color: tokens.brand.text }} />
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
										backgroundColor: alpha(tokens.brand.main, 0.12),
									}}>
										<SmartToyOutlinedIcon sx={{ fontSize: tokens.iconSize.sm, color: tokens.brand.text }} />
									</Box>
								)}
								<Box sx={{
									maxWidth: isUser ? '72%' : '88%',
									minWidth: 0,
									px: 1.75, py: 1.25,
									borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
									backgroundColor: isUser ? alpha(tokens.brand.main, 0.10) : `${tokens.surface.paper}`,
									border: `1px solid ${m.failed ? 'rgba(185,28,28,0.35)' : isUser ? alpha(tokens.brand.main, 0.25) : `${tokens.line.main}`}`,
									boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
								}}>
									<Typography sx={{
										fontSize: tokens.fontSize.caption, fontWeight: 600,
										color: isUser ? `${tokens.brand.main}` : `${tokens.ink.subtle}`,
										mb: 0.5,
										display: 'flex', alignItems: 'center', gap: 0.5,
									}}>
										{isUser
											? <><PersonOutlineOutlinedIcon sx={{ fontSize: tokens.iconSize.xs }} />{t('appAIResumeChat.you')}</>
											: <><SmartToyOutlinedIcon sx={{ fontSize: tokens.iconSize.xs }} />{t('appAIResumeChat.assistant')}</>
										}
									</Typography>
									{isUser ? (
										<Typography sx={{ fontSize: tokens.fontSize.body2, color: tokens.ink.strong, lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
											{m.content}
										</Typography>
									) : (
										<ChatMarkdown content={m.content} />
									)}
									{m.failed ? (
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75, flexWrap: 'wrap' }}>
											<ErrorOutlineOutlinedIcon sx={{ fontSize: tokens.iconSize.sm, color: tokens.status.error.dark }} />
											<Typography sx={{ fontSize: tokens.fontSize.caption, color: tokens.status.error.dark }}>
												{m.error || t('appAIResumeChat.sendFailed')}
											</Typography>
											<Button
												size="small"
												startIcon={<ReplayOutlinedIcon sx={{ fontSize: tokens.iconSize.sm }} />}
												onClick={() => handleRetryMessage(m)}
												disabled={assistantTyping}
												sx={{ fontSize: tokens.fontSize.caption, color: tokens.brand.text, textTransform: 'none', minWidth: 0, px: 0.75, py: 0 }}
											>
												{t('appAIResumeChat.retry')}
											</Button>
										</Box>
									) : (
										<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isUser ? 'flex-end' : 'space-between', mt: 0.5, gap: 1 }}>
											<Typography sx={{ fontSize: tokens.fontSize.micro, color: tokens.ink.subtle }}>
												{new Date(m.createdAt).toLocaleTimeString(userLang || 'en', { hour: '2-digit', minute: '2-digit' })}
											</Typography>
											{!isUser && (
												<Tooltip title={copiedMessageId === m.id ? t('appAIResumeChat.copied') : t('appAIResumeChat.copyAnswer')}>
													<IconButton size="small" onClick={() => handleCopyMessage(m)} sx={{ p: 0.25, color: copiedMessageId === m.id ? `${tokens.brand.main}` : `${tokens.ink.subtle}` }}>
														{copiedMessageId === m.id ? <CheckIcon sx={{ fontSize: tokens.iconSize.xs }} /> : <ContentCopyOutlinedIcon sx={{ fontSize: tokens.iconSize.xs }} />}
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
										backgroundColor: alpha(tokens.brand.main, 0.15),
									}}>
										<PersonOutlineOutlinedIcon sx={{ fontSize: tokens.iconSize.sm, color: tokens.brand.text }} />
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
								backgroundColor: alpha(tokens.brand.main, 0.12),
							}}>
								<SmartToyOutlinedIcon sx={{ fontSize: tokens.iconSize.sm, color: tokens.brand.text }} />
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
