// eslint-disable-next-line no-unused-vars
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ConfirmDialog from '../../../shared/ui/ConfirmDialog.jsx';
import {
	Box,
	Typography,
	Drawer,
	useMediaQuery,
	useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getChats, getMessages, sendMessage as sendChatMessage, updateChatStatus, deleteChat, getChat } from '../api/chatService.js';
import ChatContextPanel from './ChatContextPanel.jsx';
import { findReportByCriteria } from '../../reports/api/reportService.js';
import { QORVA_USER_LANGUAGE } from '../../../constants.js';
import { resolveError } from '../../../utils/errorHandler.js';
import { ls, LIST_PANEL_KEY, CONTEXT_PANEL_KEY, persist, PAGE_SIZE_CHATS, PAGE_SIZE_MESSAGES } from '../model/chat.js';
import CreateChatDialog from './CreateChatDialog.jsx';
import ChatComposer from './ChatComposer.jsx';
import ChatMessageList from './ChatMessageList.jsx';
import ChatHeader from './ChatHeader.jsx';
import ChatListMenu from './ChatListMenu.jsx';
import ChatListPanel from './ChatListPanel.jsx';
import useCreateChat from '../hooks/useCreateChat.js';
import ChatToolbar from './ChatToolbar.jsx';
import * as tokens from '../../../theme/tokens.js';

const AppAIResumeChat = () => {
	const { t } = useTranslation();

	const [chats, setChats] = useState([]);
	const [chatPage, setChatPage] = useState(0);
	const [chatHasMore, setChatHasMore] = useState(true);
	const [loadingChats, setLoadingChats] = useState(false);
	const [selectedChat, setSelectedChat] = useState(null);

	const navigate = useNavigate();
	const theme = useTheme();
	const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
	// Both side columns collapse independently; explicit toggles are remembered, auto-collapses are not.
	const [chatListOpen, setChatListOpen] = useState(() => ls(LIST_PANEL_KEY, 'open') !== 'closed');
	const [contextOpen, setContextOpen] = useState(() => {
		const v = ls(CONTEXT_PANEL_KEY);
		if (v) return v === 'open';
		try { return window.matchMedia('(min-width: 900px)').matches; } catch { return true; }
	});
	const toggleChatList = () => setChatListOpen(open => { persist(LIST_PANEL_KEY, open ? 'closed' : 'open'); return !open; });
	const toggleContext = () => setContextOpen(open => { persist(CONTEXT_PANEL_KEY, open ? 'closed' : 'open'); return !open; });
	const [messages, setMessages] = useState([]);
	const [linkedReport, setLinkedReport] = useState(null); // screening report of the selected chat, null when none yet
	const [copiedMessageId, setCopiedMessageId] = useState(null);
	const [msgPage, setMsgPage] = useState(0);
	const [msgHasMore, setMsgHasMore] = useState(true);
	const [loadingMessages, setLoadingMessages] = useState(false);
	const [composer, setComposer] = useState('');
	const [assistantTyping, setAssistantTyping] = useState(false);
	const messagesEndRef = useRef(null);


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

	// The API returns messages newest-first: page 0 is the tail of the chat, higher pages are older
	// and get prepended above what is already shown.
	const fetchMessagesPage = async (chatId, pageNumber = 0) => {
		if (!chatId) return;
		try {
			setLoadingMessages(true);
			const resp = await getMessages(chatId, { page: pageNumber, size: PAGE_SIZE_MESSAGES });
			const content = resp?.data?.content ?? resp?.data?.data?.content ?? [];
			const totalPages = resp?.data?.totalPages ?? resp?.data?.data?.totalPages ?? 1;
			const chronological = [...content].reverse();
			setMessages(prev => (pageNumber === 0 ? chronological : [...chronological, ...prev]));
			setMsgHasMore(pageNumber + 1 < totalPages);
			setMsgPage(pageNumber);
		} catch (e) {
			console.error('Error fetching messages:', e);
		} finally {
			setLoadingMessages(false);
		}
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps -- refetch only when the filter changes; fetchChatsPage is recreated every render
	useEffect(() => { fetchChatsPage(0, statusFilter); }, [statusFilter]);

	const newChat = useCreateChat({
		userLang,
		onCreated: async (created) => {
			setChats(prev => [created, ...prev]);
			setSelectedChat(created);
			setMessages([]); setMsgPage(0); setMsgHasMore(true);
			loadLinkedReport(created);
			await fetchMessagesPage(created.id, 0);
		},
	});

	const handleSelectChat = (chat) => {
		setSelectedChat(chat);
		if (!isMdUp) setChatListOpen(false); // no room for three columns on a tablet
		setMessages([]);
		setMsgPage(0);
		setMsgHasMore(true);
		fetchMessagesPage(chat.id, 0);
		loadLinkedReport(chat);
	};

	// The header shows the official screening score for the chat's (job, candidate) pair, or a
	// link to run screening. Looked up by pair rather than by the chat's stored report id: a
	// report generated after the chat was created is only linked by the backend on the next
	// turn, and the header should be truthful before that.
	const loadLinkedReport = async (chat) => {
		const cvId = chat?.context?.cvId;
		const jobPostId = chat?.context?.jobPostId;
		if (!cvId || !jobPostId) { setLinkedReport(null); return; }
		try {
			const resp = await findReportByCriteria({ jobPostId, candidateInfo: { candidateId: cvId } });
			setLinkedReport(resp?.data?.data || null);
		} catch {
			setLinkedReport(null); // 404 = no report yet (silenced in the API client)
		}
	};

	const refreshChat = async (chatId) => {
		try {
			const resp = await getChat(chatId);
			const fresh = resp?.data;
			if (!fresh?.id) return;
			setSelectedChat(prev => (prev?.id === fresh.id ? { ...prev, ...fresh } : prev));
			setChats(prev => prev.map(c => (c.id === fresh.id ? { ...c, ...fresh } : c)));
			if (!linkedReport) loadLinkedReport(fresh);
		} catch (e) {
			console.error('Error refreshing chat:', e);
		}
	};

	// Tags / availability edited from the context panel: keep the dialog's CV picker in sync.
	// The chat title is stored server-side at creation and is left as it is.
	const handleCvUpdated = (updated) => {
		if (!updated?.id) return;
		newChat.syncCv(updated);
	};

	const handleCopyMessage = (m) => {
		navigator.clipboard.writeText(m.content || '').then(() => {
			setCopiedMessageId(m.id);
			setTimeout(() => setCopiedMessageId(null), 1500);
		}).catch(() => {});
	};








	// Posts one message; the response is the assistant reply, appended in place — no refetch.
	// On failure the user bubble stays with an error and a retry (the backend reuses the stored
	// unanswered message on retry, so nothing is duplicated).
	const postMessage = async (chatId, localId, content) => {
		setAssistantTyping(true);
		try {
			const resp = await sendChatMessage(chatId, content);
			const reply = resp?.data;
			setMessages(prev => {
				const next = prev.map(m => (m.id === localId ? { ...m, failed: false, error: null } : m));
				return reply?.id ? [...next, reply] : next;
			});
			refreshChat(chatId);
		} catch (e) {
			console.error('Error sending message:', e);
			const error = resolveError(e);
			setMessages(prev => prev.map(m => (m.id === localId ? { ...m, failed: true, error } : m)));
		} finally {
			setAssistantTyping(false);
		}
	};

	const handleSendMessage = async () => {
		if (!composer.trim() || !selectedChat || assistantTyping) return;
		const chatId = selectedChat.id;
		const content = composer.trim();
		const optimistic = { id: `local-${Date.now()}`, chatId, role: 'USER', content, createdAt: new Date().toISOString() };
		setMessages(prev => [...prev, optimistic]);
		setComposer('');
		await postMessage(chatId, optimistic.id, content);
	};

	const handleRetryMessage = async (message) => {
		if (!selectedChat || assistantTyping) return;
		await postMessage(selectedChat.id, message.id, message.content);
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


	useEffect(() => {
		try { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); } catch { /* auto-scroll is cosmetic; ignore if unsupported */ }
	}, [messages.length, assistantTyping]);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: tokens.surface.subtle }}>

			{/* Toolbar */}
			<ChatToolbar
				chatListOpen={chatListOpen}
				fetchChatsPage={fetchChatsPage}
				loadingChats={loadingChats}
				openCreateChatModal={newChat.openCreateChatModal}
				statusFilter={statusFilter}
				toggleChatList={toggleChatList}
			/>

			{/* Split pane */}
			<Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>

				{/* Left panel: chat list */}
				<ChatListPanel
					chatHasMore={chatHasMore}
					chatListOpen={chatListOpen}
					chatPage={chatPage}
					chats={chats}
					fetchChatsPage={fetchChatsPage}
					handleSelectChat={handleSelectChat}
					loadingChats={loadingChats}
					selectedChat={selectedChat}
					setListMenuAnchor={setListMenuAnchor}
					setStatusFilter={setStatusFilter}
					statusFilter={statusFilter}
					userLang={userLang}
				/>

				{/* Chat list item context menu */}
				<ChatListMenu
					handleUpdateStatus={handleUpdateStatus}
					listMenuAnchor={listMenuAnchor}
					setChatToDelete={setChatToDelete}
					setListMenuAnchor={setListMenuAnchor}
					updatingStatusChatId={updatingStatusChatId}
				/>

				{/* Right panel: messages */}
				<Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

					{/* Chat header */}
					<ChatHeader
						contextOpen={contextOpen}
						handleUpdateStatus={handleUpdateStatus}
						headerMenuAnchor={headerMenuAnchor}
						linkedReport={linkedReport}
						navigate={navigate}
						selectedChat={selectedChat}
						setChatToDelete={setChatToDelete}
						setHeaderMenuAnchor={setHeaderMenuAnchor}
						toggleContext={toggleContext}
						updatingStatusChatId={updatingStatusChatId}
					/>

					{/* Messages | context panel */}
					<Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
					<Box sx={{ flex: selectedChat && contextOpen && isMdUp ? '1 1 50%' : '1 1 100%', minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

					{/* Messages */}
					<ChatMessageList
						assistantTyping={assistantTyping}
						copiedMessageId={copiedMessageId}
						fetchMessagesPage={fetchMessagesPage}
						handleCopyMessage={handleCopyMessage}
						handleRetryMessage={handleRetryMessage}
						loadingMessages={loadingMessages}
						messages={messages}
						messagesEndRef={messagesEndRef}
						msgHasMore={msgHasMore}
						msgPage={msgPage}
						selectedChat={selectedChat}
						userLang={userLang}
					/>

					{/* Composer */}
					<ChatComposer
						composer={composer}
						handleSendMessage={handleSendMessage}
						selectedChat={selectedChat}
						setComposer={setComposer}
					/>
					</Box>

					{selectedChat && contextOpen && isMdUp && (
						<Box sx={{ flex: '0 0 50%', minWidth: 0, borderLeft: `1px solid ${tokens.line.main}`, overflow: 'hidden' }}>
							<ChatContextPanel
								chat={selectedChat}
								report={linkedReport}
								onReportRefresh={() => loadLinkedReport(selectedChat)}
								onCvUpdated={handleCvUpdated}
							/>
						</Box>
					)}
					</Box>
				</Box>
			</Box>

			{/* Below md the context panel is a drawer instead of a third column */}
			{selectedChat && !isMdUp && (
				<Drawer anchor="right" open={contextOpen} onClose={toggleContext} PaperProps={{ sx: { width: 'min(560px, 92vw)' } }}>
					<ChatContextPanel
						chat={selectedChat}
						report={linkedReport}
						onReportRefresh={() => loadLinkedReport(selectedChat)}
						onCvUpdated={handleCvUpdated}
						onClose={toggleContext}
					/>
				</Drawer>
			)}

			{/* Delete Chat Confirmation Dialog */}
			<ConfirmDialog
				open={!!chatToDelete}
				title={t('appAIResumeChat.confirmDeleteChat')}
				subject={chatToDelete && (
					<Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: 'ink.strong' }}>{chatToDelete.title}</Typography>
				)}
				cancelLabel={t('appAIResumeChat.cancel')}
				confirmLabel={t('appAIResumeChat.delete')}
				onCancel={() => setChatToDelete(null)}
				onConfirm={handleDeleteChat}
				busy={deletingChat}
				tone="danger"
				maxWidth="xs"
				fullWidth
			>
				{t('appAIResumeChat.confirmDeleteChatMessage')}
			</ConfirmDialog>

			{/* Create Chat Dialog */}
			<CreateChatDialog
				loadingResumeMatch={newChat.loadingResumeMatch}
				closeCreateChatModal={newChat.closeCreateChatModal}
				copiedJobRef={newChat.copiedJobRef}
				creatingChat={newChat.creatingChat}
				customTitle={newChat.customTitle}
				cvOptionKey={newChat.cvOptionKey}
				cvOptions={newChat.cvOptions}
				cvSearch={newChat.cvSearch}
				handleCopyJobRef={newChat.handleCopyJobRef}
				handleCreateChat={newChat.handleCreateChat}
				handleSearchChange={newChat.handleSearchChange}
				jobs={newChat.jobs}
				openCreateModal={newChat.openCreateModal}
				resumeMatch={newChat.resumeMatch}
				selectedCV={newChat.selectedCV}
				selectedJob={newChat.selectedJob}
				setCustomTitle={newChat.setCustomTitle}
				setSelectedCV={newChat.setSelectedCV}
				setSelectedJob={newChat.setSelectedJob}
				userLang={userLang}
			/>
		</Box>
	);
};

export default AppAIResumeChat;
