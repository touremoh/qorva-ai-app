// eslint-disable-next-line no-unused-vars
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	Autocomplete,
	Avatar,
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	IconButton,
	InputAdornment,
	InputLabel,
	ListItemButton,
	ListItemIcon,
	Menu,
	MenuItem,
	Select,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getChats, getMessages, createChat, sendMessage as sendChatMessage, updateChatStatus, deleteChat } from '../../../services/chatService.js';
import { getCVs, searchCVs } from '../../../services/cvService.js';
import { getJobs } from '../../../services/jobService.js';
import { findReportByCriteria } from '../../../services/reportService.js';
import { QORVA_USER_LANGUAGE } from '../../../constants.js';

const ls = (k, d = null) => { try { const v = localStorage.getItem(k); return v ?? d; } catch { return d; } };

const buildChatTitle = (cv, job) => {
	const name = cv?.personalInformation?.name || 'Chat';
	const jobTitle = job?.title || job?.jobPostTitle || 'Job';
	return `${name} - ${jobTitle}`;
};

const getCandidateIdFromCV = (cv) => cv?.candidateId || cv?.id || null;

const PAGE_SIZE_CHATS = 25;
const PAGE_SIZE_MESSAGES = 50;

const TypingDots = () => (
	<Box sx={{
		display: 'inline-flex', alignItems: 'center', gap: 1,
		px: 2, py: 1, borderRadius: '16px 16px 16px 4px',
		backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
		'@keyframes blink': {
			'0%, 100%': { opacity: 0.2 }, '50%': { opacity: 1 },
		},
	}}>
		<SmartToyOutlinedIcon sx={{ fontSize: 14, color: '#629C44' }} />
		<Box sx={{ display: 'flex', gap: 0.4, alignItems: 'center' }}>
			{[0, 0.2, 0.4].map((delay, i) => (
				<Box key={i} sx={{
					width: 5, height: 5, borderRadius: '50%',
					backgroundColor: '#629C44',
					animation: `blink 1.2s ease-in-out infinite ${delay}s`,
				}} />
			))}
		</Box>
	</Box>
);

const AppAIResumeChat = () => {
	const { t, i18n } = useTranslation();

	const [chats, setChats] = useState([]);
	const [chatPage, setChatPage] = useState(0);
	const [chatHasMore, setChatHasMore] = useState(true);
	const [loadingChats, setLoadingChats] = useState(false);
	const [selectedChat, setSelectedChat] = useState(null);

	const [messages, setMessages] = useState([]);
	const [msgPage, setMsgPage] = useState(0);
	const [msgHasMore, setMsgHasMore] = useState(true);
	const [loadingMessages, setLoadingMessages] = useState(false);
	const [composer, setComposer] = useState('');
	const [assistantTyping, setAssistantTyping] = useState(false);
	const messagesEndRef = useRef(null);

	const [openCreateModal, setOpenCreateModal] = useState(false);
	const [creatingChat, setCreatingChat] = useState(false);
	const [cvList, setCvList] = useState([]);
	const [jobs, setJobs] = useState([]);
	const [selectedCV, setSelectedCV] = useState(null);
	const [selectedJob, setSelectedJob] = useState(null);
	const [customTitle, setCustomTitle] = useState('');
	const [resumeMatch, setResumeMatch] = useState(null);
	const [selectedResumeMatchId, setSelectedResumeMatchId] = useState('');
	const [loadingResumeMatch, setLoadingResumeMatch] = useState(false);
	const [cvSearch, setCvSearch] = useState('');

	const [statusFilter, setStatusFilter] = useState(null);

	const [chatToDelete, setChatToDelete] = useState(null);
	const [deletingChat, setDeletingChat] = useState(false);
	const [updatingStatusChatId, setUpdatingStatusChatId] = useState(null);
	const [listMenuAnchor, setListMenuAnchor] = useState(null);
	const [headerMenuAnchor, setHeaderMenuAnchor] = useState(null);

	const userLang = ls(QORVA_USER_LANGUAGE, 'en');

	const fetchChatsPage = async (pageNumber = 0, filter = statusFilter) => {
		try {
			setLoadingChats(true);
			const params = { page: pageNumber, size: PAGE_SIZE_CHATS };
			if (filter) params.status = filter;
			const resp = await getChats(params);
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
		if (!chatId) return;
		try {
			setLoadingMessages(true);
			const resp = await getMessages(chatId, { pageNumber, pageSize: PAGE_SIZE_MESSAGES });
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

	useEffect(() => { fetchChatsPage(0, statusFilter); /* eslint-disable-next-line */ }, [statusFilter]);

	const handleSelectChat = (chat) => {
		setSelectedChat(chat);
		setMessages([]);
		setMsgPage(0);
		setMsgHasMore(true);
		fetchMessagesPage(chat.id, 0);
	};

	const getAllCVEntries = async () => getCVs({ pageNumber: 0, pageSize: 50 });

	const searchCVEntriesByCriteria = async (searchTerm) =>
		searchCVs({ pageNumber: 0, pageSize: 25, searchTerms: searchTerm.trim() });

	const handleSearchChange = async (value) => {
		setCvSearch(value);
		try {
			let response;
			if (!value || value.length === 0) {
				response = await getAllCVEntries();
			} else {
				response = await searchCVEntriesByCriteria(value);
			}
			setCvList(response?.data?.data?.content ?? response?.data?.content ?? []);
		} catch (error) {
			console.error('Error during search:', error);
		}
	};

	const loadModalData = async () => {
		try {
			const cvResp = await getAllCVEntries();
			setCvList(cvResp?.data?.data?.content ?? cvResp?.data?.content ?? []);
		} catch (e) { setCvList([]); }
		try {
			const jobsResp = await getJobs({ pageSize: 50 });
			setJobs(jobsResp?.data?.data?.content ?? jobsResp?.data?.content ?? []);
		} catch (e) { setJobs([]); }
	};

	const openCreateChatModal = async () => {
		setSelectedCV(null); setSelectedJob(null);
		setResumeMatch(null); setSelectedResumeMatchId('');
		setCustomTitle(''); setCvSearch('');
		setOpenCreateModal(true);
		await loadModalData();
	};
	const closeCreateChatModal = () => { if (!creatingChat) setOpenCreateModal(false); };

	useEffect(() => {
		const candidateId = getCandidateIdFromCV(selectedCV);
		if (!openCreateModal || !selectedCV || !selectedJob || !candidateId) {
			setResumeMatch(null); setSelectedResumeMatchId(''); return;
		}
		let cancelled = false;
		const search = async () => {
			try {
				setLoadingResumeMatch(true);
				const resp = await findReportByCriteria({ jobPostId: selectedJob.id, candidateInfo: { candidateId } });
				if (cancelled) return;
				const found = resp?.data?.data || null;
				setResumeMatch(found);
				setSelectedResumeMatchId(found?.id || '');
				if (!customTitle && selectedCV && selectedJob) setCustomTitle(buildChatTitle(selectedCV, selectedJob));
			} catch (e) {
				if (!cancelled) { setResumeMatch(null); setSelectedResumeMatchId(''); }
			} finally {
				if (!cancelled) setLoadingResumeMatch(false);
			}
		};
		search();
		return () => { cancelled = true; };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [openCreateModal, selectedCV, selectedJob]);

	const handleCreateChat = async () => {
		if (!selectedCV || !selectedJob) {
			alert(t('appAIResumeChat.selectCvAndJob'));
			return;
		}
		try {
			setCreatingChat(true);
			const locale = userLang || i18n.language || 'en';
			const title = buildChatTitle(selectedCV, selectedJob) || customTitle?.trim();
			const body = {
				title, cvId: selectedCV.id, jobPostId: selectedJob.id,
				...(selectedResumeMatchId ? { resumeMatchId: selectedResumeMatchId } : {}),
				participants: [{ role: 'OWNER' }],
				language: locale,
			};
			const resp = await createChat(body);
			const created = resp?.data;
			setChats(prev => [created, ...prev]);
			setSelectedChat(created);
			setMessages([]); setMsgPage(0); setMsgHasMore(true);
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
		const optimistic = { id: `local-${Date.now()}`, chatId, role: 'USER', content, createdAt: new Date().toISOString() };
		setMessages(prev => [...prev, optimistic]);
		setComposer('');
		setAssistantTyping(true);
		try {
			await sendChatMessage(chatId, content);
			await fetchMessagesPage(chatId, 0);
		} catch (e) {
			console.error('Error sending message:', e);
		} finally {
			setAssistantTyping(false);
		}
	};

	const handleDeleteChat = async () => {
		if (!chatToDelete) return;
		try {
			setDeletingChat(true);
			await deleteChat(chatToDelete.id);
			setChats(prev => prev.filter(c => c.id !== chatToDelete.id));
			if (selectedChat?.id === chatToDelete.id) {
				setSelectedChat(null);
				setMessages([]);
			}
			setChatToDelete(null);
		} catch (e) {
			console.error('Error deleting chat:', e);
		} finally {
			setDeletingChat(false);
		}
	};

	const handleUpdateStatus = async (chat, status) => {
		try {
			setUpdatingStatusChatId(chat.id);
			const resp = await updateChatStatus(chat.id, status);
			const newStatus = resp?.data?.status ?? status;
			if (statusFilter && newStatus !== statusFilter) {
				setChats(prev => prev.filter(c => c.id !== chat.id));
				if (selectedChat?.id === chat.id) { setSelectedChat(null); setMessages([]); }
			} else {
				setChats(prev => prev.map(c => c.id === chat.id ? { ...c, status: newStatus } : c));
				if (selectedChat?.id === chat.id) setSelectedChat(prev => ({ ...prev, status: newStatus }));
			}
		} catch (e) {
			console.error('Error updating chat status:', e);
		} finally {
			setUpdatingStatusChatId(null);
		}
	};

	const cvOptionKey = (cv) => cv?.id ?? `${cv?.personalInformation?.name ?? 'cv'}-${cv?.createdAt ?? ''}`;
	const cvOptions = useMemo(() => {
		const seen = new Set();
		return (cvList || []).filter(cv => {
			const k = cvOptionKey(cv);
			if (seen.has(k)) return false;
			seen.add(k); return true;
		});
	}, [cvList]);

	useEffect(() => {
		try { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); } catch {}
	}, [messages.length, assistantTyping]);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#f8fafc' }}>

			{/* Toolbar */}
			<Box sx={{
				display: 'flex', alignItems: 'center', gap: 1.5,
				px: 2, py: 1.5, flexShrink: 0,
				backgroundColor: '#ffffff',
				borderBottom: '1px solid #e2e8f0',
			}}>
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

			{/* Split pane */}
			<Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>

				{/* Left panel: chat list */}
				<Box sx={{
					width: { xs: 200, sm: 240, md: 280 },
					flexShrink: 0,
					display: 'flex', flexDirection: 'column',
					borderRight: '1px solid #e2e8f0',
					backgroundColor: '#ffffff',
					overflow: 'hidden',
				}}>
					<Box sx={{ px: 1.5, pt: 1, pb: 0.75, borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
						<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
							{t('appAIResumeChat.chats')}
						</Typography>
						<Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
							{[
								{ value: null, labelKey: 'filterAll', activeBg: '#f1f5f9', activeColor: '#475569', activeBorder: '#cbd5e1' },
								{ value: 'OPEN', labelKey: 'open', activeBg: 'rgba(98,156,68,0.12)', activeColor: '#629C44', activeBorder: '#629C44' },
								{ value: 'CLOSED', labelKey: 'closed', activeBg: '#f1f5f9', activeColor: '#64748b', activeBorder: '#94a3b8' },
								{ value: 'ARCHIVED', labelKey: 'archived', activeBg: '#fef3c7', activeColor: '#92400e', activeBorder: '#d97706' },
							].map(({ value, labelKey, activeBg, activeColor, activeBorder }) => {
								const isSelected = statusFilter === value;
								return (
									<Chip
										key={value ?? 'all'}
										size="small"
										label={t(`appAIResumeChat.${labelKey}`)}
										onClick={() => setStatusFilter(value)}
										sx={{
											fontSize: '0.68rem', height: 20, cursor: 'pointer',
											backgroundColor: isSelected ? activeBg : 'transparent',
											color: isSelected ? activeColor : '#94a3b8',
											border: `1px solid ${isSelected ? activeBorder : '#e2e8f0'}`,
											'& .MuiChip-label': { px: 0.75 },
											'&:hover': { backgroundColor: activeBg, color: activeColor },
										}}
									/>
								);
							})}
						</Box>
					</Box>

					<Box sx={{ flex: 1, overflowY: 'auto', py: 0.5 }}>
						{loadingChats && chats.length === 0 ? (
							<Box sx={{ display: 'flex', justifyContent: 'center', pt: 3 }}>
								<CircularProgress size={20} sx={{ color: '#629C44' }} />
							</Box>
						) : chats.length === 0 ? (
							<Box sx={{ px: 2, pt: 2 }}>
								<Typography sx={{ fontSize: '0.78rem', color: '#94a3b8' }}>
									{t('appAIResumeChat.noChatSelected')}
								</Typography>
							</Box>
						) : (
							chats.map((c) => {
								const isActive = selectedChat?.id === c.id;
								return (
									<ListItemButton
										key={c.id}
										onClick={() => handleSelectChat(c)}
										sx={{
											px: 1.5, py: 1,
											borderLeft: isActive ? '3px solid #629C44' : '3px solid transparent',
											backgroundColor: isActive ? 'rgba(98,156,68,0.06)' : 'transparent',
											'&:hover': { backgroundColor: isActive ? 'rgba(98,156,68,0.10)' : '#f8fafc' },
											gap: 1.5, alignItems: 'center',
										}}
									>
										<Box sx={{
											width: 30, height: 30, borderRadius: 1.5, flexShrink: 0,
											display: 'flex', alignItems: 'center', justifyContent: 'center',
											backgroundColor: isActive ? 'rgba(98,156,68,0.15)' : '#f1f5f9',
										}}>
											<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 14, color: isActive ? '#629C44' : '#94a3b8' }} />
										</Box>
										<Box sx={{ flex: 1, minWidth: 0 }}>
											<Typography sx={{
												fontSize: '0.8rem', fontWeight: isActive ? 600 : 400,
												color: (c.status === 'CLOSED' || c.status === 'ARCHIVED') ? '#94a3b8' : '#0f172a', lineHeight: 1.3,
												overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
											}}>
												{c.title}
											</Typography>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
												<Typography sx={{ fontSize: '0.68rem', color: '#94a3b8' }}>
													{new Date(c.lastUpdatedAt || c.createdAt).toLocaleDateString(userLang || 'en')}
												</Typography>
												{c.status === 'CLOSED' && (
													<Chip size="small" label={t('appAIResumeChat.closed')} sx={{ fontSize: '0.6rem', height: 14, backgroundColor: '#f1f5f9', color: '#94a3b8', '& .MuiChip-label': { px: 0.75 } }} />
												)}
												{c.status === 'ARCHIVED' && (
													<Chip size="small" label={t('appAIResumeChat.archived')} sx={{ fontSize: '0.6rem', height: 14, backgroundColor: '#fef3c7', color: '#92400e', '& .MuiChip-label': { px: 0.75 } }} />
												)}
											</Box>
										</Box>
										<IconButton
											size="small"
											onClick={(e) => { e.stopPropagation(); setListMenuAnchor({ el: e.currentTarget, chat: c }); }}
											sx={{ flexShrink: 0, p: 0.4, color: '#94a3b8', '&:hover': { color: '#475569', backgroundColor: 'rgba(0,0,0,0.04)' } }}
										>
											<MoreVertIcon sx={{ fontSize: 16 }} />
										</IconButton>
									</ListItemButton>
								);
							})
						)}
						{chatHasMore && !loadingChats && (
							<Box sx={{ px: 1.5, py: 1 }}>
								<Button
									size="small" fullWidth
									onClick={() => fetchChatsPage(chatPage + 1, statusFilter)}
									sx={{ fontSize: '0.72rem', color: '#629C44', textTransform: 'none', borderRadius: 1.5 }}
								>
									{t('appAIResumeChat.loadMore')}
								</Button>
							</Box>
						)}
					</Box>
				</Box>

				{/* Chat list item context menu */}
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

				{/* Right panel: messages */}
				<Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

					{/* Chat header */}
					<Box sx={{
						px: 2.5, py: 1.5, flexShrink: 0,
						backgroundColor: '#ffffff',
						borderBottom: '1px solid #e2e8f0',
						display: 'flex', alignItems: 'center', gap: 1.5,
					}}>
						{selectedChat ? (
							<>
								<Avatar sx={{ width: 28, height: 28, fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#629C44' }}>
									{(selectedChat.title || '?')[0].toUpperCase()}
								</Avatar>
								<Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a', flex: 1 }}>
									{selectedChat.title}
								</Typography>
								{selectedChat.status === 'CLOSED' && (
									<Chip
										size="small"
										icon={<LockOutlinedIcon sx={{ fontSize: '12px !important' }} />}
										label={t('appAIResumeChat.closed')}
										sx={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#64748b', height: 22 }}
									/>
								)}
								{selectedChat.status === 'ARCHIVED' && (
									<Chip
										size="small"
										icon={<ArchiveOutlinedIcon sx={{ fontSize: '12px !important' }} />}
										label={t('appAIResumeChat.archived')}
										sx={{ fontSize: '0.72rem', backgroundColor: '#fef3c7', color: '#92400e', height: 22 }}
									/>
								)}
								<Tooltip title={t('appAIResumeChat.chatOptions')}>
									<IconButton
										size="small"
										onClick={(e) => setHeaderMenuAnchor(e.currentTarget)}
										sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5, color: '#64748b', '&:hover': { backgroundColor: '#f1f5f9' } }}
									>
										<MoreVertIcon sx={{ fontSize: 16 }} />
									</IconButton>
								</Tooltip>
								<Menu
									anchorEl={headerMenuAnchor}
									open={!!headerMenuAnchor}
									onClose={() => setHeaderMenuAnchor(null)}
									slotProps={{ paper: { elevation: 0, sx: { borderRadius: 2, border: '1px solid #e2e8f0', minWidth: 170 } } }}
								>
									{selectedChat.status === 'CLOSED' && (
										<MenuItem
											onClick={() => { handleUpdateStatus(selectedChat, 'OPEN'); setHeaderMenuAnchor(null); }}
											disabled={updatingStatusChatId === selectedChat.id}
											sx={{ fontSize: '0.82rem', gap: 1 }}
										>
											<ListItemIcon sx={{ minWidth: 0 }}>
												{updatingStatusChatId === selectedChat.id
													? <CircularProgress size={14} sx={{ color: '#629C44' }} />
													: <LockOpenOutlinedIcon fontSize="small" sx={{ color: '#629C44' }} />
												}
											</ListItemIcon>
											{t('appAIResumeChat.reopenChat')}
										</MenuItem>
									)}
									{selectedChat.status === 'OPEN' && (
										<MenuItem
											onClick={() => { handleUpdateStatus(selectedChat, 'CLOSED'); setHeaderMenuAnchor(null); }}
											disabled={updatingStatusChatId === selectedChat.id}
											sx={{ fontSize: '0.82rem', gap: 1 }}
										>
											<ListItemIcon sx={{ minWidth: 0 }}>
												{updatingStatusChatId === selectedChat.id
													? <CircularProgress size={14} sx={{ color: '#629C44' }} />
													: <LockOutlinedIcon fontSize="small" sx={{ color: '#64748b' }} />
												}
											</ListItemIcon>
											{t('appAIResumeChat.closeChat')}
										</MenuItem>
									)}
									{selectedChat.status !== 'ARCHIVED' && (
										<MenuItem
											onClick={() => { handleUpdateStatus(selectedChat, 'ARCHIVED'); setHeaderMenuAnchor(null); }}
											disabled={updatingStatusChatId === selectedChat.id}
											sx={{ fontSize: '0.82rem', gap: 1 }}
										>
											<ListItemIcon sx={{ minWidth: 0 }}>
												{updatingStatusChatId === selectedChat.id
													? <CircularProgress size={14} sx={{ color: '#629C44' }} />
													: <ArchiveOutlinedIcon fontSize="small" sx={{ color: '#64748b' }} />
												}
											</ListItemIcon>
											{t('appAIResumeChat.archiveChat')}
										</MenuItem>
									)}
									<Divider sx={{ my: 0.5, borderColor: '#f1f5f9' }} />
									<MenuItem
										onClick={() => { setChatToDelete(selectedChat); setHeaderMenuAnchor(null); }}
										sx={{ fontSize: '0.82rem', color: '#ef4444', gap: 1 }}
									>
										<ListItemIcon sx={{ minWidth: 0 }}>
											<DeleteOutlineIcon fontSize="small" sx={{ color: '#ef4444' }} />
										</ListItemIcon>
										{t('appAIResumeChat.deleteChat')}
									</MenuItem>
								</Menu>
							</>
						) : (
							<Typography sx={{ fontSize: '0.85rem', color: '#94a3b8' }}>
								{t('appAIResumeChat.selectChat')}
							</Typography>
						)}
					</Box>

					{/* Messages */}
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
												maxWidth: '72%',
												px: 1.75, py: 1.25,
												borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
												backgroundColor: isUser ? 'rgba(98,156,68,0.10)' : '#ffffff',
												border: `1px solid ${isUser ? 'rgba(98,156,68,0.25)' : '#e2e8f0'}`,
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
												<Typography sx={{ fontSize: '0.85rem', color: '#0f172a', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
													{m.content}
												</Typography>
												<Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', mt: 0.5, textAlign: isUser ? 'right' : 'left' }}>
													{new Date(m.createdAt).toLocaleTimeString(userLang || 'en', { hour: '2-digit', minute: '2-digit' })}
												</Typography>
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

					{/* Composer */}
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
						<Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 1, alignItems: 'center' }}>
							<TextField
								fullWidth
								size="small"
								multiline
								maxRows={4}
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
										borderRadius: 3, fontSize: '0.85rem',
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
											width: 38, height: 38, flexShrink: 0,
											'&:hover': { backgroundColor: '#4a7a33' },
											'&.Mui-disabled': { backgroundColor: '#e2e8f0', color: '#94a3b8' },
										}}
									>
										<SendRoundedIcon sx={{ fontSize: 17 }} />
									</IconButton>
								</span>
							</Tooltip>
						</Box>
					</Box>
				</Box>
			</Box>

			{/* Delete Chat Confirmation Dialog */}
			<Dialog
				open={!!chatToDelete}
				onClose={() => { if (!deletingChat) setChatToDelete(null); }}
				maxWidth="xs"
				fullWidth
				slotProps={{ paper: { elevation: 0, sx: { borderRadius: 3, border: '1px solid #e2e8f0' } } }}
			>
				<DialogTitle sx={{ pb: 1 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<DeleteOutlineIcon sx={{ fontSize: 18, color: '#ef4444' }} />
						<Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
							{t('appAIResumeChat.confirmDeleteChat')}
						</Typography>
					</Box>
				</DialogTitle>
				<Divider sx={{ borderColor: '#f1f5f9' }} />
				<DialogContent sx={{ pt: 2 }}>
					<Typography sx={{ fontSize: '0.85rem', color: '#475569' }}>
						{t('appAIResumeChat.confirmDeleteChatMessage')}
					</Typography>
					{chatToDelete && (
						<Box sx={{ mt: 1.5, px: 1.5, py: 1, borderRadius: 2, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
							<Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
								{chatToDelete.title}
							</Typography>
						</Box>
					)}
				</DialogContent>
				<Divider sx={{ borderColor: '#f1f5f9' }} />
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button
						onClick={() => setChatToDelete(null)}
						disabled={deletingChat}
						sx={{ borderRadius: 2, fontSize: '0.82rem', textTransform: 'none', color: '#64748b' }}
					>
						{t('appAIResumeChat.cancel')}
					</Button>
					<Button
						onClick={handleDeleteChat}
						variant="contained"
						disabled={deletingChat}
						startIcon={deletingChat ? <CircularProgress size={14} color="inherit" /> : <DeleteOutlineIcon sx={{ fontSize: 16 }} />}
						sx={{
							backgroundColor: '#ef4444', borderRadius: 2, fontSize: '0.82rem',
							textTransform: 'none', fontWeight: 600, boxShadow: 'none',
							'&:hover': { backgroundColor: '#dc2626', boxShadow: 'none' },
						}}
					>
						{t('appAIResumeChat.delete')}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Create Chat Dialog */}
			<Dialog
				open={openCreateModal}
				onClose={closeCreateChatModal}
				fullWidth
				maxWidth="sm"
				slotProps={{
					paper: {
						elevation: 0,
						sx: { borderRadius: 3, border: '1px solid #e2e8f0' },
					},
				}}
			>
				<DialogTitle sx={{ pb: 1 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<AutoAwesomeOutlinedIcon sx={{ fontSize: 18, color: '#629C44' }} />
						<Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
							{t('appAIResumeChat.createChatTitle')}
						</Typography>
					</Box>
					<Typography sx={{ fontSize: '0.78rem', color: '#64748b', mt: 0.5, fontWeight: 400 }}>
						{t('appAIResumeChat.createChatHelp')}
					</Typography>
				</DialogTitle>

				<Divider sx={{ borderColor: '#f1f5f9' }} />

				<DialogContent sx={{ pt: 2.5 }}>
					<Stack spacing={2}>
						<Autocomplete
							options={cvOptions}
							value={selectedCV}
							onChange={(_, v) => setSelectedCV(v || null)}
							inputValue={cvSearch}
							onInputChange={(_, val) => handleSearchChange(val)}
							getOptionLabel={(cv) => cv?.personalInformation?.name || 'Unknown'}
							renderOption={(props, option) => (
								<li {...props} key={cvOptionKey(option)}>
									{option?.personalInformation?.name || option?.id}
								</li>
							)}
							isOptionEqualToValue={(opt, val) => (opt?.id ?? opt?._id) === (val?.id ?? val?._id)}
							noOptionsText={t('appAIResumeChat.noCVFound')}
							renderInput={(params) => (
								<TextField
									{...params}
									size="small"
									label={t('appAIResumeChat.cvSearch')}
									placeholder={t('appAIResumeChat.cvSearchPlaceholder')}
									sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
									InputProps={{
										...params.InputProps,
										startAdornment: (
											<>
												<InputAdornment position="start">
													<SearchOutlinedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
												</InputAdornment>
												{params.InputProps.startAdornment}
											</>
										),
									}}
								/>
							)}
						/>

						<FormControl fullWidth size="small">
							<InputLabel sx={{ fontSize: '0.85rem' }}>{t('appAIResumeChat.jobPost')}</InputLabel>
							<Select
								label={t('appAIResumeChat.jobPost')}
								value={selectedJob?.id || ''}
								onChange={(e) => setSelectedJob(jobs.find(x => x.id === e.target.value) || null)}
								sx={{ borderRadius: 2, fontSize: '0.85rem' }}
							>
								{jobs.map(j => (
									<MenuItem key={j.id} value={j.id} sx={{ fontSize: '0.85rem' }}>
										{j.title || j.jobPostTitle || j.id}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* Matching report */}
						<Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
							<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
								{t('appAIResumeChat.relatedMatchingReport')}
							</Typography>
							{!selectedCV || !selectedJob ? (
								<Typography sx={{ fontSize: '0.78rem', color: '#94a3b8' }}>
									{t('appAIResumeChat.resumeMatchHint')}
								</Typography>
							) : loadingResumeMatch ? (
								<Stack direction="row" spacing={1} alignItems="center">
									<CircularProgress size={14} sx={{ color: '#629C44' }} />
									<Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>{t('appAIResumeChat.searching')}</Typography>
								</Stack>
							) : resumeMatch ? (
								<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
									{resumeMatch.jobPostTitle && (
										<Chip size="small" label={resumeMatch.jobPostTitle} sx={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#334155' }} />
									)}
									{resumeMatch?.aiAnalysisReportDetails?.overallSummary?.score !== undefined && (
										<Chip
											size="small"
											label={`${t('appAIResumeChat.score')}: ${resumeMatch.aiAnalysisReportDetails.overallSummary.score}%`}
											sx={{ fontSize: '0.72rem', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 600 }}
										/>
									)}
								</Stack>
							) : (
								<Typography sx={{ fontSize: '0.78rem', color: '#94a3b8' }}>
									{t('appAIResumeChat.noResumeMatch')}
								</Typography>
							)}
						</Box>

						<TextField
							fullWidth size="small"
							label={t('appAIResumeChat.chatTitle')}
							value={customTitle}
							onChange={(e) => setCustomTitle(e.target.value)}
							helperText={t('appAIResumeChat.chatTitleHelp2')}
							sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
						/>

						<Chip
							size="small"
							label={`${t('appAIResumeChat.language')}: ${userLang || 'en'}`}
							sx={{ width: 'fit-content', fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#334155' }}
						/>
					</Stack>
				</DialogContent>

				<Divider sx={{ borderColor: '#f1f5f9' }} />

				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button
						onClick={closeCreateChatModal}
						disabled={creatingChat}
						sx={{ borderRadius: 2, fontSize: '0.82rem', textTransform: 'none', color: '#64748b' }}
					>
						{t('appAIResumeChat.cancel')}
					</Button>
					<Button
						onClick={handleCreateChat}
						variant="contained"
						disabled={creatingChat}
						startIcon={creatingChat ? <CircularProgress size={14} color="inherit" /> : <AddCommentOutlinedIcon sx={{ fontSize: 16 }} />}
						sx={{
							backgroundColor: '#629C44', borderRadius: 2, fontSize: '0.82rem',
							textTransform: 'none', fontWeight: 600, boxShadow: 'none',
							'&:hover': { backgroundColor: '#4a7a33', boxShadow: 'none' },
						}}
					>
						{t('appAIResumeChat.create')}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default AppAIResumeChat;
