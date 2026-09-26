// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
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
import { updateChatStatus, deleteChat, getChat } from '../api/chatService.js';
import ChatContextPanel from './ChatContextPanel.jsx';
import { findReportByCriteria } from '../../reports/api/reportService.js';
import { QORVA_USER_LANGUAGE } from '../../../constants.js';
import { ls, LIST_PANEL_KEY, CONTEXT_PANEL_KEY, persist } from '../model/chat.js';
import CreateChatDialog from './CreateChatDialog.jsx';
import ChatComposer from './ChatComposer.jsx';
import ChatMessageList from './ChatMessageList.jsx';
import ChatHeader from './ChatHeader.jsx';
import ChatListMenu from './ChatListMenu.jsx';
import ChatListPanel from './ChatListPanel.jsx';
import useCreateChat from '../hooks/useCreateChat.js';
import useChatList from '../hooks/useChatList.js';
import useChatMessages from '../hooks/useChatMessages.js';
import ChatToolbar from './ChatToolbar.jsx';
import * as tokens from '../../../theme/tokens.js';

const AppAIResumeChat = () => {
	const { t } = useTranslation();

	const list = useChatList();
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
	const [linkedReport, setLinkedReport] = useState(null); // screening report of the selected chat, null when none yet

	const [chatToDelete, setChatToDelete] = useState(null);
	const [deletingChat, setDeletingChat] = useState(false);
	const [updatingStatusChatId, setUpdatingStatusChatId] = useState(null);
	const [listMenuAnchor, setListMenuAnchor] = useState(null);
	const [headerMenuAnchor, setHeaderMenuAnchor] = useState(null);

	const userLang = ls(QORVA_USER_LANGUAGE, 'en');

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
			list.patch(fresh.id, fresh);
			if (!linkedReport) loadLinkedReport(fresh);
		} catch (e) {
			console.error('Error refreshing chat:', e);
		}
	};

	const conversation = useChatMessages({ selectedChat, onReplied: refreshChat });

	const newChat = useCreateChat({
		userLang,
		onCreated: async (created) => {
			list.prepend(created);
			setSelectedChat(created);
			conversation.reset();
			loadLinkedReport(created);
			await conversation.fetchMessagesPage(created.id, 0);
		},
	});

	const handleSelectChat = (chat) => {
		setSelectedChat(chat);
		if (!isMdUp) setChatListOpen(false); // no room for three columns on a tablet
		conversation.reset();
		conversation.fetchMessagesPage(chat.id, 0);
		loadLinkedReport(chat);
	};

	// Tags / availability edited from the context panel: keep the dialog's CV picker in sync.
	// The chat title is stored server-side at creation and is left as it is.
	const handleCvUpdated = (updated) => {
		if (!updated?.id) return;
		newChat.syncCv(updated);
	};

	const handleDeleteChat = async () => {
		if (!chatToDelete) return;
		try {
			setDeletingChat(true);
			await deleteChat(chatToDelete.id);
			list.remove(chatToDelete.id);
			if (selectedChat?.id === chatToDelete.id) {
				setSelectedChat(null);
				conversation.clear();
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
			if (list.statusFilter && newStatus !== list.statusFilter) {
				list.remove(chat.id);
				if (selectedChat?.id === chat.id) { setSelectedChat(null); conversation.clear(); }
			} else {
				list.patch(chat.id, { status: newStatus });
				if (selectedChat?.id === chat.id) setSelectedChat(prev => ({ ...prev, status: newStatus }));
			}
		} catch (e) {
			console.error('Error updating chat status:', e);
		} finally {
			setUpdatingStatusChatId(null);
		}
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: tokens.surface.subtle }}>

			{/* Toolbar */}
			<ChatToolbar
				chatListOpen={chatListOpen}
				fetchChatsPage={list.fetchChatsPage}
				loadingChats={list.loadingChats}
				openCreateChatModal={newChat.openCreateChatModal}
				statusFilter={list.statusFilter}
				toggleChatList={toggleChatList}
			/>

			{/* Split pane */}
			<Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>

				{/* Left panel: chat list */}
				<ChatListPanel
					chatHasMore={list.chatHasMore}
					chatListOpen={chatListOpen}
					chatPage={list.chatPage}
					chats={list.chats}
					fetchChatsPage={list.fetchChatsPage}
					handleSelectChat={handleSelectChat}
					loadingChats={list.loadingChats}
					selectedChat={selectedChat}
					setListMenuAnchor={setListMenuAnchor}
					setStatusFilter={list.setStatusFilter}
					statusFilter={list.statusFilter}
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
						assistantTyping={conversation.assistantTyping}
						copiedMessageId={conversation.copiedMessageId}
						fetchMessagesPage={conversation.fetchMessagesPage}
						handleCopyMessage={conversation.handleCopyMessage}
						handleRetryMessage={conversation.handleRetryMessage}
						loadingMessages={conversation.loadingMessages}
						messages={conversation.messages}
						messagesEndRef={conversation.messagesEndRef}
						msgHasMore={conversation.msgHasMore}
						msgPage={conversation.msgPage}
						selectedChat={selectedChat}
						userLang={userLang}
					/>

					{/* Composer */}
					<ChatComposer
						composer={conversation.composer}
						handleSendMessage={conversation.handleSendMessage}
						selectedChat={selectedChat}
						setComposer={conversation.setComposer}
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
					<Typography sx={{ fontSize: tokens.fontSize.body2, fontWeight: 600, color: 'ink.strong' }}>{chatToDelete.title}</Typography>
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
