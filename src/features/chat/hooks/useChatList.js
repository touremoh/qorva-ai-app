import { useEffect, useState } from 'react';
import { getChats } from '../api/chatService.js';
import { PAGE_SIZE_CHATS } from '../model/chat.js';

/**
 * The left-hand chat list: paged fetch, status filter (refetches page 0 when it changes), and
 * in-place edits so the list follows creates, deletes and status changes without a refetch.
 */
export default function useChatList() {
	const [chats, setChats] = useState([]);
	const [chatPage, setChatPage] = useState(0);
	const [chatHasMore, setChatHasMore] = useState(true);
	const [loadingChats, setLoadingChats] = useState(false);
	const [statusFilter, setStatusFilter] = useState(null);

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

	// eslint-disable-next-line react-hooks/exhaustive-deps -- refetch only when the filter changes; fetchChatsPage is recreated every render
	useEffect(() => { fetchChatsPage(0, statusFilter); }, [statusFilter]);

	const prepend = (chat) => setChats(prev => [chat, ...prev]);
	const remove = (chatId) => setChats(prev => prev.filter(c => c.id !== chatId));
	const patch = (chatId, fields) => setChats(prev => prev.map(c => (c.id === chatId ? { ...c, ...fields } : c)));

	return { chats, chatPage, chatHasMore, loadingChats, statusFilter, setStatusFilter, fetchChatsPage, prepend, remove, patch };
}
