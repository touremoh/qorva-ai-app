// src/pages/app/cv/components/AppAIResumeChat.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	Box,
	Button,
	Modal,
	Typography,
	Paper,
	Divider,
	DialogActions,
	DialogContent,
	DialogTitle,
	CircularProgress,
	List,
	ListItem,
	ListItemText,
	ListItemButton,
	TextField,
	IconButton,
	Stack,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Chip,
	Tooltip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddCommentIcon from '@mui/icons-material/AddComment';
import apiClient from '../../../../axiosConfig.js';
import { AUTH_TOKEN } from '../../../constants.js';

// Helper: read safely from localStorage
const ls = (k, d = null) => {
	try { const v = localStorage.getItem(k); return v ?? d; } catch { return d; }
};

// Helper: build a reasonable chat title using CV + date
const buildChatTitle = (cv, locale = 'en') => {
	const name =
		cv?.candidateName ||
		[cv?.firstName, cv?.lastName].filter(Boolean).join(' ') ||
		cv?.ownerName ||
		'Unknown Candidate';
	const date = new Date().toLocaleDateString(locale, { year: 'numeric', month: 'short', day: '2-digit' });
	return `${name} - ${date}`;
};

const PAGE_SIZE_CHATS = 25;
const PAGE_SIZE_MESSAGES = 50;

const AppAIResumeChat = () => {
	const { t, i18n } = useTranslation();

	// Left pane: chats
	const [chats, setChats] = useState([]);
	const [chatPage, setChatPage] = useState(0);
	const [chatHasMore, setChatHasMore] = useState(true);
	const [loadingChats, setLoadingChats] = useState(false);
	const [selectedChat, setSelectedChat] = useState(null);

	// Right pane: messages
	const [messages, setMessages] = useState([]);
	const [msgPage, setMsgPage] = useState(0);
	const [msgHasMore, setMsgHasMore] = useState(true);
	const [loadingMessages, setLoadingMessages] = useState(false);
	const [composer, setComposer] = useState('');
	const [assistantTyping, setAssistantTyping] = useState(false);
	const messagesEndRef = useRef(null);

	// Create Chat modal
	const [openCreateModal, setOpenCreateModal] = useState(false);
	const [creatingChat, setCreatingChat] = useState(false);
	const [cvList, setCvList] = useState([]);
	const [jobs, setJobs] = useState([]);
	const [resumeMatches, setResumeMatches] = useState([]);
	const [selectedCVId, setSelectedCVId] = useState('');
	const [selectedJobId, setSelectedJobId] = useState('');
	const [selectedResumeMatchId, setSelectedResumeMatchId] = useState('');
	const [customTitle, setCustomTitle] = useState('');

	const userLang = ls('QORVA_USER_LANGUAGE', 'en');
	const bearer = ls(AUTH_TOKEN);
	const chatBaseUrl = import.meta.env.VITE_APP_API_CHAT_URL;

	// Fetch helpers
	const fetchChatsPage = async (pageNumber = 0) => {
		if (!chatBaseUrl) return;
		try {
			setLoadingChats(true);
			const resp = await apiClient.get(chatBaseUrl, {
				params: {
					pageNumber,
					pageSize: PAGE_SIZE_CHATS
				}
			});
			const content = resp?.data?.content ?? resp?.data?.data?.content ?? [];
			const totalPages = resp?.data?.totalPages ?? resp?.data?.data?.totalPages ?? 1;
			setChats(prev => (pageNumber === 0 ? content : [...prev, ...content]));
			setChatHasMore(pageNumber + 1 < totalPages);
			setChatPage(pageNumber);
		} catch (e) {
			console.error('Error fetching chats:', e);
		} finally {
			setLoadingChats(false);
		}
	};

	const fetchMessagesPage = async (chatId, pageNumber = 0) => {
		if (!chatBaseUrl || !chatId) return;
		try {
			setLoadingMessages(true);
			// We request ascending by createdAt so the list is already sorted
			const resp = await apiClient.get(`${chatBaseUrl}/${chatId}/messages`, {
				params: {
					pageNumber,
					pageSize: PAGE_SIZE_MESSAGES,
				},
				headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined
			});
			const content = resp?.data?.content ?? resp?.data?.data?.content ?? [];
			const totalPages = resp?.data?.totalPages ?? resp?.data?.data?.totalPages ?? 1;
			setMessages(prev => (pageNumber === 0 ? content : [...prev, ...content]));
			setMsgHasMore(pageNumber + 1 < totalPages);
			setMsgPage(pageNumber);
		} catch (e) {
			console.error('Error fetching messages:', e);
		} finally {
			setLoadingMessages(false);
		}
	};

	const scrollToBottom = () => {
		try { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); } catch {}
	};

	// Initial load of chats
	useEffect(() => {
		fetchChatsPage(0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// When selecting a chat, load its first page of messages
	const handleSelectChat = (chat) => {
		setSelectedChat(chat);
		setMessages([]);
		setMsgPage(0);
		setMsgHasMore(true);
		fetchMessagesPage(chat.id, 0);
	};

	// Typing animation CSS
	const TypingDots = () => (
		<Box
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				px: 2,
				py: 1,
				borderRadius: '12px',
				backgroundColor: '#E3F2FD',
				border: '1px solid #BBDEFB',
				fontSize: '0.9rem',
				'@keyframes blink': {
					'0%': { opacity: 0.2 },
					'20%': { opacity: 1 },
					'100%': { opacity: 0.2 }
				}
			}}
		>
			<Box sx={{ mr: 1 }}>{t('appAIResumeChat.typing', 'Assistant is typing')}</Box>
			<Box sx={{ display: 'flex', gap: 0.5 }}>
				<Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'primary.main', animation: 'blink 1.4s infinite 0s' }} />
				<Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'primary.main', animation: 'blink 1.4s infinite 0.2s' }} />
				<Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'primary.main', animation: 'blink 1.4s infinite 0.4s' }} />
			</Box>
		</Box>
	);

	// Create Chat modal: load dropdown data
	const loadModalData = async () => {
		// CVs
		try {
			const cvResp = await apiClient.get(import.meta.env.VITE_APP_API_CV_URL, {
				params: { pageSize: 50 }
			});
			const cvContent = cvResp?.data?.data?.content ?? cvResp?.data?.content ?? [];
			console.log('CV content', cvContent);
			setCvList(cvContent);
		} catch (e) {
			console.error('Error loading CVs:', e);
			setCvList([]);
		}
		// Jobs
		try {
			const jobsResp = await apiClient.get(import.meta.env.VITE_APP_API_JOBS_URL, {
				params: { pageSize: 50 }
			});
			const jobContent = jobsResp?.data?.data?.content ?? jobsResp?.data?.content ?? [];
			console.log('Jobs content', jobContent);
			setJobs(jobContent);
		} catch (e) {
			console.warn('Error loading jobs (adjust VITE_APP_API_JOBS_URL if needed):', e);
			setJobs([]);
		}
		// Resume matches (optional)
		try {
			const rmResp = await apiClient.get(import.meta.env.VITE_APP_API_RESUME_MATCHES_URL, {
				params: { pageSize: 50 },
				headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined
			});
			const rmContent = rmResp?.data?.data?.content ?? rmResp?.data?.content ?? [];
			setResumeMatches(rmContent);
		} catch (e) {
			// Optional; may not exist
			setResumeMatches([]);
		}
	};

	const openCreateChatModal = async () => {
		setSelectedCVId('');
		setSelectedJobId('');
		setSelectedResumeMatchId('');
		setCustomTitle('');
		setOpenCreateModal(true);
		await loadModalData();
	};

	const closeCreateChatModal = () => {
		if (creatingChat) return;
		setOpenCreateModal(false);
	};

	const handleCreateChat = async () => {
		if (!chatBaseUrl) return;
		if (!selectedCVId || !selectedJobId) {
			alert(t('appAIResumeChat.selectCvAndJob', 'Please select a CV and a Job Post.'));
			return;
		}
		try {
			setCreatingChat(true);

			const cvEntity = cvList.find(c => c.id === selectedCVId);
			const locale = userLang || i18n.language || 'en';
			const title = customTitle?.trim() || buildChatTitle(cvEntity, locale);

			const userId = ls('USER_ID', null);
			const body = {
				title,
				cvId: selectedCVId,
				jobPostId: selectedJobId,
				...(selectedResumeMatchId ? { resumeMatchId: selectedResumeMatchId } : {}),
				...(userId ? {
					participants: [{ userId, role: 'OWNER' }]
				} : {}),
				language: locale
			};

			const resp = await apiClient.post(chatBaseUrl, body, {
				headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined
			});

			const created = resp?.data;
			// Add to chat list at the top
			setChats(prev => [created, ...prev]);
			// Select it and load messages
			setSelectedChat(created);
			setMessages([]);
			setMsgPage(0);
			setMsgHasMore(true);
			await fetchMessagesPage(created.id, 0);
			setOpenCreateModal(false);
		} catch (e) {
			console.error('Error creating chat:', e);
		} finally {
			setCreatingChat(false);
		}
	};

	const handleSendMessage = async () => {
		if (!composer.trim() || !selectedChat) return;
		const chatId = selectedChat.id;
		const content = composer.trim();

		// optimistic user message
		const optimistic = {
			id: `local-${Date.now()}`,
			chatId,
			role: 'USER',
			content,
			createdAt: new Date().toISOString()
		};
		setMessages(prev => [...prev, optimistic]);
		setComposer('');
		setAssistantTyping(true);
		scrollToBottom();

		try {
			const resp = await apiClient.post(`${chatBaseUrl}/${chatId}/messages`, { content }, {
				headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined
			});

			// After sending, refresh the last page of messages (to include assistant reply)
			// You can also read resp.data if your API echoes the assistant message after completion.
			await fetchMessagesPage(chatId, 0); // reload from first page to keep asc order correct
			// Alternatively, you could fetch the last page; here we keep it simple and consistent.
		} catch (e) {
			console.error('Error sending message:', e);
		} finally {
			setAssistantTyping(false);
			scrollToBottom();
		}
	};

	const selectedCVForTitle = useMemo(() => {
		if (!openCreateModal || !selectedCVId) return null;
		return cvList.find(c => c.id === selectedCVId) || null;
	}, [openCreateModal, selectedCVId, cvList]);

	useEffect(() => {
		if (selectedCVForTitle && !customTitle) {
			setCustomTitle(buildChatTitle(selectedCVForTitle, userLang || 'en'));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedCVForTitle]);

	useEffect(() => {
		scrollToBottom();
	}, [messages.length, assistantTyping]);

	return (
		<Box
			sx={{
				width: '100%',
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'flex-start',
				backgroundColor: 'transparent',
				color: '#232F3E',
				p: 2,
				overflowX: 'hidden'
			}}
		>
			{/* Header actions: Create chat */}
			<Box sx={{ width: '90%', display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
				<Button
					startIcon={<AddCommentIcon />}
					variant="contained"
					color="success"
					onClick={openCreateChatModal}
					sx={{ borderRadius: '50px', mr: 2 }}
					disabled={loadingChats}
				>
					{loadingChats ? <CircularProgress size={24} /> : t('appAIResumeChat.createChat', 'Create Chat')}
				</Button>
				<Tooltip title={t('appAIResumeChat.refresh', 'Refresh')}>
          <span>
            <IconButton onClick={() => fetchChatsPage(0)} disabled={loadingChats}>
              <RefreshIcon />
            </IconButton>
          </span>
				</Tooltip>
			</Box>

			{/* Main content: Left (chats) + Right (messages) */}
			<Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '90%', mt: 1, mb: '10vh', gap: 2 }}>
				{/* Left pane: Chats */}
				<Paper sx={{ width: '30%', height: '85vh', p: 2, boxShadow: 3, backgroundColor: 'white', overflowY: 'auto' }}>
					<Typography variant="h6" gutterBottom>
						{t('appAIResumeChat.chats', 'Chats')}
					</Typography>
					<Divider sx={{ mb: 2 }} />
					<List dense>
						{chats.map((c) => (
							<ListItem key={c.id} disablePadding>
								<ListItemButton
									selected={selectedChat?.id === c.id}
									onClick={() => handleSelectChat(c)}
									sx={{ borderRadius: '8px', mb: 1 }}
								>
									<ChatIcon fontSize="small" style={{ marginRight: 8 }} />
									<ListItemText
										primary={c.title}
										secondary={new Date(c.lastUpdatedAt || c.createdAt).toLocaleString(userLang || 'en')}
										primaryTypographyProps={{ noWrap: true }}
										secondaryTypographyProps={{ fontSize: '0.75rem' }}
									/>
								</ListItemButton>
							</ListItem>
						))}
					</List>
					{loadingChats && (
						<Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
							<CircularProgress size={24} />
						</Box>
					)}
					{chatHasMore && !loadingChats && (
						<Button
							onClick={() => fetchChatsPage(chatPage + 1)}
							fullWidth
							variant="outlined"
							sx={{ mt: 1 }}
						>
							{t('appAIResumeChat.loadMore', 'Load more')}
						</Button>
					)}
				</Paper>

				{/* Right pane: Messages */}
				<Paper sx={{ width: '70%', height: '85vh', p: 2, boxShadow: 3, backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
					<Typography variant="h6" gutterBottom>
						{selectedChat ? selectedChat.title : t('appAIResumeChat.selectChat', 'Select a chat to start')}
					</Typography>
					<Divider sx={{ mb: 2 }} />

					{/* Messages list */}
					<Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
						{selectedChat && (
							<>
								{msgHasMore && !loadingMessages && (
									<Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
										<Button size="small" onClick={() => fetchMessagesPage(selectedChat.id, msgPage + 1)} variant="outlined">
											{t('appAIResumeChat.loadOlder', 'Load older')}
										</Button>
									</Box>
								)}
								{loadingMessages && (
									<Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
										<CircularProgress size={20} />
									</Box>
								)}

								{messages.map((m) => {
									const isUser = m.role === 'USER';
									return (
										<Box
											key={m.id}
											sx={{
												display: 'flex',
												justifyContent: isUser ? 'flex-end' : 'flex-start',
												mb: 1.5
											}}
										>
											<Box
												sx={{
													maxWidth: '75%',
													p: 1.2,
													borderRadius: 2,
													bgcolor: isUser ? '#E8F5E9' : '#E3F2FD',
													border: `1px solid ${isUser ? '#C8E6C9' : '#BBDEFB'}`,
													whiteSpace: 'pre-wrap',
													wordBreak: 'break-word'
												}}
											>
												<Typography variant="body2" sx={{ opacity: 0.7, mb: 0.5 }}>
													{!isUser ? t('appAIResumeChat.assistant', 'Assistant') : t('appAIResumeChat.you', 'You')}
												</Typography>
												<Typography variant="body1">{m.content}</Typography>
												<Typography variant="caption" sx={{ display: 'block', mt: 0.5, textAlign: isUser ? 'right' : 'left' }}>
													{new Date(m.createdAt).toLocaleString(userLang || 'en')}
												</Typography>
											</Box>
										</Box>
									);
								})}

								{assistantTyping && (
									<Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1.5 }}>
										<TypingDots />
									</Box>
								)}

								<div ref={messagesEndRef} />
							</>
						)}

						{!selectedChat && (
							<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
								<Typography color="text.secondary">
									{t('appAIResumeChat.noChatSelected', 'No chat selected. Create or select one from the left.')}
								</Typography>
							</Box>
						)}
					</Box>

					{/* Composer */}
					<Divider sx={{ mt: 1, mb: 1 }} />
					<Box sx={{ display: 'flex', gap: 1 }}>
						<TextField
							fullWidth
							size="small"
							placeholder={t('appAIResumeChat.placeholder', 'Ask about the CV vs Job…')}
							value={composer}
							onChange={(e) => setComposer(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && !e.shiftKey) {
									e.preventDefault();
									if (composer.trim()) handleSendMessage();
								}
							}}
							disabled={!selectedChat}
						/>
						<Tooltip title={t('appAIResumeChat.send', 'Send')}>
              <span>
                <IconButton color="primary" onClick={handleSendMessage} disabled={!selectedChat || !composer.trim()}>
                  <SendIcon />
                </IconButton>
              </span>
						</Tooltip>
					</Box>
				</Paper>
			</Box>

			{/* Create Chat Modal */}
			<Modal open={openCreateModal} onClose={closeCreateChatModal}>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: { xs: '95%', md: '60%' },
						bgcolor: 'white',
						color: '#232F3E',
						boxShadow: 24,
						p: 3,
						borderRadius: 2
					}}
				>
					<DialogTitle sx={{ px: 0, pt: 0 }}>
						{t('appAIResumeChat.createChatTitle', 'Create a new chat session')}
					</DialogTitle>
					<DialogContent sx={{ px: 0 }}>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
							{t('appAIResumeChat.createChatHelp', 'Select a CV, a Job Post, and optionally an existing Resume Match.')}
						</Typography>

						<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
							<FormControl fullWidth size="small">
								<InputLabel>{t('appAIResumeChat.cv', 'CV')}</InputLabel>
								<Select
									label={t('appAIResumeChat.cv', 'CV')}
									value={selectedCVId}
									onChange={(e) => setSelectedCVId(e.target.value)}
								>
									{cvList.map(cv => (
										<MenuItem key={cv.id} value={cv.id}>
											{cv.candidateName || [cv.firstName, cv.lastName].filter(Boolean).join(' ') || cv.fileName || cv.id}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							<FormControl fullWidth size="small">
								<InputLabel>{t('appAIResumeChat.jobPost', 'Job Post')}</InputLabel>
								<Select
									label={t('appAIResumeChat.jobPost', 'Job Post')}
									value={selectedJobId}
									onChange={(e) => setSelectedJobId(e.target.value)}
								>
									{jobs.map(j => (
										<MenuItem key={j.id} value={j.id}>
											{j.title || j.jobPostTitle || j.id}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Stack>

						<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
							<FormControl fullWidth size="small">
								<InputLabel>{t('appAIResumeChat.resumeMatch', 'Resume Match (optional)')}</InputLabel>
								<Select
									label={t('appAIResumeChat.resumeMatch', 'Resume Match (optional)')}
									value={selectedResumeMatchId}
									onChange={(e) => setSelectedResumeMatchId(e.target.value)}
								>
									<MenuItem value="">{t('appAIResumeChat.none', 'None')}</MenuItem>
									{resumeMatches.map(rm => (
										<MenuItem key={rm.id} value={rm.id}>
											{rm.title || `${rm.id}`}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							<TextField
								fullWidth
								size="small"
								label={t('appAIResumeChat.chatTitle', 'Chat title')}
								value={customTitle}
								onChange={(e) => setCustomTitle(e.target.value)}
								helperText={t('appAIResumeChat.chatTitleHelp', 'Defaults to “{name} - {date}”.')}
							/>
						</Stack>

						<Chip
							size="small"
							label={`${t('appAIResumeChat.language', 'Language')}: ${userLang || 'en'}`}
							sx={{ mb: 1 }}
						/>
					</DialogContent>

					<DialogActions sx={{ px: 0, pb: 0 }}>
						<Button onClick={closeCreateChatModal} disabled={creatingChat}>
							{t('appAIResumeChat.cancel', 'Cancel')}
						</Button>
						<Button
							onClick={handleCreateChat}
							variant="contained"
							color="primary"
							disabled={creatingChat}
							startIcon={creatingChat ? <CircularProgress size={16} /> : <AddCommentIcon />}
						>
							{t('appAIResumeChat.create', 'Create')}
						</Button>
					</DialogActions>
				</Box>
			</Modal>
		</Box>
	);
};

export default AppAIResumeChat;
