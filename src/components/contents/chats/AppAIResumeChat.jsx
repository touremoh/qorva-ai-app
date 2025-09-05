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
import Autocomplete from '@mui/material/Autocomplete';
import { useTranslation } from 'react-i18next';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddCommentIcon from '@mui/icons-material/AddComment';
import apiClient from '../../../../axiosConfig.js';
import {AUTH_TOKEN, QORVA_USER_LANGUAGE, TENANT_ID} from '../../../constants.js';

// Helpers
const ls = (k, d = null) => { try { const v = localStorage.getItem(k); return v ?? d; } catch { return d; } };

// Build chat title: "First Last - Job Title"
const buildChatTitle = (cv, job) => {
	const name = cv?.personalInformation.name || 'Chat Session';
	const jobTitle = job?.title || job?.jobPostTitle || 'Job';
	return `${name} - ${jobTitle}`;
};

const getCandidateIdFromCV = (cv) =>
	cv?.candidateId || cv?.id || null;

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

	// Selections
	const [selectedCV, setSelectedCV] = useState(null);     // object
	const [selectedJob, setSelectedJob] = useState(null);   // object
	const [customTitle, setCustomTitle] = useState('');

	// Resume match (auto-searched)
	const [resumeMatch, setResumeMatch] = useState(null);
	const [selectedResumeMatchId, setSelectedResumeMatchId] = useState('');
	const [loadingResumeMatch, setLoadingResumeMatch] = useState(false);

	const [cvSearch, setCvSearch] = useState('');

	// ENV + auth
	const userLang = ls(QORVA_USER_LANGUAGE, 'en');
	const bearer = ls(AUTH_TOKEN);
	const chatBaseUrl = import.meta.env.VITE_APP_API_CHAT_URL; // Change #5

	const jobsUrl = import.meta.env.VITE_APP_API_JOB_POSTS_URL;
	const reportSearchUrl = import.meta.env.VITE_APP_API_REPORT_URL
		? `${import.meta.env.VITE_APP_API_REPORT_URL}/search`
		: null; // Change #1

	// Fetch chats
	const fetchChatsPage = async (pageNumber = 0) => {
		if (!chatBaseUrl) return;
		try {
			setLoadingChats(true);
			const resp = await apiClient.get(chatBaseUrl, {
				params: { pageNumber, pageSize: PAGE_SIZE_CHATS}
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

	// Fetch messages
	const fetchMessagesPage = async (chatId, pageNumber = 0) => {
		if (!chatBaseUrl || !chatId) return;
		try {
			setLoadingMessages(true);
			const resp = await apiClient.get(`${chatBaseUrl}/${chatId}/messages`, {
				params: { pageNumber, pageSize: PAGE_SIZE_MESSAGES }
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

	// Initial load of chats
	useEffect(() => { fetchChatsPage(0); /* eslint-disable-next-line */ }, []);

	// Select chat
	const handleSelectChat = (chat) => {
		setSelectedChat(chat);
		setMessages([]);
		setMsgPage(0);
		setMsgHasMore(true);
		fetchMessagesPage(chat.id, 0);
	};

	// Typing animation
	const TypingDots = () => (
		<Box
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				px: 2, py: 1,
				borderRadius: '12px',
				backgroundColor: '#E3F2FD',
				border: '1px solid #BBDEFB',
				fontSize: '0.9rem',
				'@keyframes blink': {
					'0%': { opacity: 0.2 }, '20%': { opacity: 1 }, '100%': { opacity: 0.2 }
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

	// Modal data (CVs + Jobs)
	const loadModalData = async () => {
		try {
			const cvResp = await getAllCVEntries();
			const cvContent = cvResp?.data?.data?.content ?? cvResp?.data?.content ?? [];
			setCvList(cvContent);
		} catch (e) {
			console.error('Error loading CVs:', e);
			setCvList([]);
		}
		try {
			const jobsResp = await apiClient.get(jobsUrl, {
				params: { pageSize: 50 }
			});
			const jobContent = jobsResp?.data?.data?.content ?? jobsResp?.data?.content ?? [];
			setJobs(jobContent);
		} catch (e) {
			console.warn('Error loading jobs:', e);
			setJobs([]);
		}
	};

	const getAllCVEntries = async () => {
		return await apiClient.get(import.meta.env.VITE_APP_API_CV_URL, {
			params: {
				pageNumber: 0,
				pageSize: 50
			}
		});
	};

	const searchCVEntriesByCriteria = async (searchTerm) => {
		return await apiClient.get(`${import.meta.env.VITE_APP_API_CV_URL}/search`, {
			params: {
				pageNumber: 0,
				pageSize: 25,
				searchTerms: searchTerm.trim(),
			},
		});
	}

	// Handle search functionality
	const handleSearchChange = async (value) => {
		const searchValue = value;
		setCvSearch(searchValue);
		try {
			let response = null;
			if (searchValue === undefined || searchValue.length === 0) {
				response = await getAllCVEntries();
				setCvList(response.data.data.content);
			} else {
				response = await searchCVEntriesByCriteria(searchValue);

				if (response.status === 200 && response.data.data.content.length > 0) {
					setCvList(response.data.data.content);
				}
			}
		} catch (error) {
			console.error('Error during search:', error);
		}
	};

	// Open/close modal (no auto-open; user controlled)
	const openCreateChatModal = async () => {
		setSelectedCV(null);
		setSelectedJob(null);
		setResumeMatch(null);
		setSelectedResumeMatchId('');
		setCustomTitle('');
		setCvSearch('');
		setOpenCreateModal(true);
		await loadModalData();
	};
	const closeCreateChatModal = () => { if (!creatingChat) setOpenCreateModal(false); };

	// Change #1: Auto-search resume match after both CV + Job are chosen
	useEffect(() => {
		const candidateId = getCandidateIdFromCV(selectedCV);
		if (!openCreateModal || !selectedCV || !selectedJob || !reportSearchUrl || !candidateId) {
			setResumeMatch(null);
			setSelectedResumeMatchId('');
			return;
		}
		let cancelled = false;
		const search = async () => {
			try {
				setLoadingResumeMatch(true);
				const payload = { jobPostId: selectedJob.id, candidateInfo: { candidateId } };
				const resp = await apiClient.post(reportSearchUrl, payload);
				if (cancelled) return;
				const found = resp?.data?.data || null;
				setResumeMatch(found);
				setSelectedResumeMatchId(found?.id || '');
				// Default title if empty -> "First Last - Job Title"
				if (!customTitle && selectedCV && selectedJob) {
					setCustomTitle(buildChatTitle(selectedCV, selectedJob));
				}
			} catch (e) {
				if (!cancelled) {
					console.error('Resume match search failed:', e);
					setResumeMatch(null);
					setSelectedResumeMatchId('');
				}
			} finally {
				if (!cancelled) setLoadingResumeMatch(false);
			}
		};
		search();
		return () => { cancelled = true; };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [openCreateModal, selectedCV, selectedJob]);

	// Create chat
	const handleCreateChat = async () => {
		if (!chatBaseUrl) return;
		if (!selectedCV || !selectedJob) {
			alert(t('appAIResumeChat.selectCvAndJob', 'Please select a CV and a Job Post.'));
			return;
		}
		try {
			setCreatingChat(true);
			const locale = userLang || i18n.language || 'en';
			const title = buildChatTitle(selectedCV, selectedJob) || (customTitle?.trim());
			const body = {
				title,
				cvId: selectedCV.id,
				jobPostId: selectedJob.id,
				...(selectedResumeMatchId ? { resumeMatchId: selectedResumeMatchId } : {}),
				participants: [{ role: 'OWNER' }],
				language: locale
			};
			const resp = await apiClient.post(chatBaseUrl, body);
			const created = resp?.data;
			setChats(prev => [created, ...prev]);
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

	// Send message
	const handleSendMessage = async () => {
		if (!composer.trim() || !selectedChat) return;
		const chatId = selectedChat.id;
		const content = composer.trim();
		const optimistic = { id: `local-${Date.now()}`, chatId, role: 'USER', content, createdAt: new Date().toISOString() };
		setMessages(prev => [...prev, optimistic]);
		setComposer('');
		setAssistantTyping(true);
		try {
			await apiClient.post(`${chatBaseUrl}/${chatId}/messages`, { content }, {
				headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined
			});
			await fetchMessagesPage(chatId, 0);
		} catch (e) {
			console.error('Error sending message:', e);
		} finally {
			setAssistantTyping(false);
		}
	};

	// Build a stable unique key for CV options
	const cvOptionKey = (cv) => cv?.id ?? `${cv?.personalInformation.name ?? 'cv'}-${cv?.candidateName ?? ''}-${cv?.createdAt ?? ''}`;

   // Optional: dedupe CVs by key
	const cvOptions = useMemo(() => {
		const seen = new Set();
		return (cvList || []).filter(cv => {
			const k = cvOptionKey(cv);
			if (seen.has(k)) return false;
			seen.add(k);
			return true;
		});
	}, [cvList]);

	// Scroll bottom on updates
	useEffect(() => { try { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); } catch {} }, [messages.length, assistantTyping]);

	return (
		<Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: 'transparent', color: '#232F3E', p: 2, overflowX: 'hidden' }}>
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

			{/* Main content */}
			<Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '90%', mt: 1, mb: '10vh', gap: 2 }}>
				{/* Left pane: Chats (30%) */}
				<Paper sx={{ width: '30%', height: '77vh', p: 2, boxShadow: 3, backgroundColor: 'white', overflowY: 'auto' }}>
					<Typography variant="h6" gutterBottom>{t('appAIResumeChat.chats', 'Chats')}</Typography>
					<Divider sx={{ mb: 2 }} />
					<List dense>
						{chats.map((c) => (
							<ListItem key={c.id} disablePadding>
								<ListItemButton selected={selectedChat?.id === c.id} onClick={() => handleSelectChat(c)} sx={{ borderRadius: '8px', mb: 1 }}>
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
					{loadingChats && <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} /></Box>}
					{chatHasMore && !loadingChats && (
						<Button onClick={() => fetchChatsPage(chatPage + 1)} fullWidth variant="outlined" sx={{ mt: 1 }}>
							{t('appAIResumeChat.loadMore', 'Load more')}
						</Button>
					)}
				</Paper>

				{/* Right pane: Messages (70%) */}
				<Paper sx={{ width: '70%', height: '77vh', p: 2, boxShadow: 3, backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
					<Typography variant="h6" gutterBottom>
						{selectedChat ? selectedChat.title : t('appAIResumeChat.selectChat', 'Select a chat to start')}
					</Typography>
					<Divider sx={{ mb: 2 }} />

					{/* Messages list */}
					<Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
						{selectedChat ? (
							<>
								{msgHasMore && !loadingMessages && (
									<Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
										<Button size="small" onClick={() => fetchMessagesPage(selectedChat.id, msgPage + 1)} variant="outlined">
											{t('appAIResumeChat.loadOlder', 'Load older')}
										</Button>
									</Box>
								)}
								{loadingMessages && <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}><CircularProgress size={20} /></Box>}

								{messages.map((m) => {
									const isUser = m.role === 'USER';
									return (
										<Box key={m.id} sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', mb: 1.5 }}>
											<Box sx={{
												maxWidth: '75%', p: 1.2, borderRadius: 2,
												backgroundColor: isUser ? '#E8F5E9' : '#E3F2FD',
												border: `1px solid ${isUser ? '#C8E6C9' : '#BBDEFB'}`,
												whiteSpace: 'pre-wrap', wordBreak: 'break-word'
											}}>
												<Typography variant="body2" sx={{ opacity: 0.7, mb: 0.5 }}>
													{isUser ? t('appAIResumeChat.you', 'You') : t('appAIResumeChat.assistant', 'Assistant')}
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
						) : (
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
							fullWidth size="small"
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

			{/* Create Chat Modal (fields stacked vertically) */}
			<Modal open={openCreateModal} onClose={closeCreateChatModal}>
				<Box sx={{
					position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
					width: { xs: '95%', md: '60%' }, bgcolor: 'white', color: '#232F3E', boxShadow: 24,
					p: 3, borderRadius: 2
				}}>
					<DialogTitle sx={{ px: 0, pt: 0 }}>
						{t('appAIResumeChat.createChatTitle', 'Create a new chat session')}
					</DialogTitle>
					<DialogContent sx={{ px: 0 }}>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
							{t('appAIResumeChat.createChatHelp', 'Select a CV and a Job Post. We’ll auto-search for the related screening report if available.')}
						</Typography>

						<Stack direction="column" spacing={2} sx={{ mb: 2 }}>
							{/* Searchable CV (shows candidate name) */}
							<Autocomplete
								options={cvOptions}
								value={selectedCV}
								onChange={(_, v) => setSelectedCV(v || null)}
								inputValue={cvSearch}
								onInputChange={(_, val) => handleSearchChange(val)}
								getOptionLabel={(cv) => cv?.personalInformation.name || 'Unknown'}
								renderOption={(props, option) => (
									<li {...props} key={cvOptionKey(option)}>   {/* unique, stable key */}
										{option?.personalInformation.name || option?.id}
									</li>
								)}
								isOptionEqualToValue={(opt, val) => (opt?.id ?? opt?._id) === (val?.id ?? val?._id)}
								noOptionsText={t('appAIResumeChat.noCVFound', 'No CV found')}
								renderInput={(params) => (
									<TextField
										{...params}
										size="small"
										/* removed onChange={handleSearchChange} */
										label={t('appAIResumeChat.cvSearch', 'Search CV (by candidate name)')}
										placeholder={t('appAIResumeChat.cvSearchPlaceholder', 'Type a name…')}
									/>
								)}
							/>

							{/* Job select (can be made searchable later if needed) */}
							<FormControl fullWidth size="small">
								<InputLabel>{t('appAIResumeChat.jobPost', 'Job Post')}</InputLabel>
								<Select
									label={t('appAIResumeChat.jobPost', 'Job Post')}
									value={selectedJob?.id || ''}
									onChange={(e) => {
										const j = jobs.find(x => x.id === e.target.value) || null;
										setSelectedJob(j);
									}}
								>
									{jobs.map(j => (
										<MenuItem key={j.id} value={j.id}>
											{j.title || j.jobPostTitle || j.id}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							{/* Resume Match (auto-searched based on CV + Job) */}
							<Box>
								<Typography variant="subtitle2" sx={{ mb: 0.5 }}>
									{t('appAIResumeChat.relatedScreeningReport', 'Related Screening Report')}
								</Typography>
								{!selectedCV || !selectedJob ? (
									<Typography variant="body2" color="text.secondary">
										{t('appAIResumeChat.resumeMatchHint', 'Select a CV and Job to search for a match.')}
									</Typography>
								) : loadingResumeMatch ? (
									<Stack direction="row" spacing={1} alignItems="center">
										<CircularProgress size={18} />
										<Typography variant="body2" color="text.secondary">
											{t('appAIResumeChat.searching', 'Searching…')}
										</Typography>
									</Stack>
								) : resumeMatch ? (
									<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
										{resumeMatch.jobPostTitle && (
											<Chip size="small" label={`${t('appAIResumeChat.job', 'Job Title')}: ${resumeMatch.jobPostTitle}`} />
										)}
										{resumeMatch?.aiAnalysisReportDetails?.overallSummary?.score !== undefined && (
											<Chip
												size="small"
												color="primary"
												label={`${t('appAIResumeChat.score', 'Score')}: ${resumeMatch.aiAnalysisReportDetails.overallSummary.score}`}
											/>
										)}
									</Stack>
								) : (
									<Typography variant="body2" color="text.secondary">
										{t('appAIResumeChat.noResumeMatch', 'No resume match found.')}
									</Typography>
								)}
							</Box>

							{/* Title (defaults to "First Last - Job Title") */}
							<TextField
								fullWidth
								size="small"
								label={t('appAIResumeChat.chatTitle', 'Chat title')}
								value={customTitle}
								onChange={(e) => setCustomTitle(e.target.value)}
								helperText={t('appAIResumeChat.chatTitleHelp2', 'Defaults to “First Last - Job Title”.')}
							/>

							<Chip size="small" label={`${t('appAIResumeChat.language', 'Language')}: ${userLang || 'en'}`} sx={{ width: 'fit-content' }} />
						</Stack>
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
