import { useEffect, useRef, useState } from 'react';
import { getMessages, sendMessage as sendChatMessage } from '../api/chatService.js';
import { resolveError } from '../../../utils/errorHandler.js';
import { PAGE_SIZE_MESSAGES } from '../model/chat.js';

/**
 * The selected chat's conversation: paged history, the composer, optimistic send with retry,
 * copy-to-clipboard and auto-scroll. `onReplied(chatId)` runs after each assistant reply.
 */
export default function useChatMessages({ selectedChat, onReplied }) {
	const [messages, setMessages] = useState([]);
	const [copiedMessageId, setCopiedMessageId] = useState(null);
	const [msgPage, setMsgPage] = useState(0);
	const [msgHasMore, setMsgHasMore] = useState(true);
	const [loadingMessages, setLoadingMessages] = useState(false);
	const [composer, setComposer] = useState('');
	const [assistantTyping, setAssistantTyping] = useState(false);
	const messagesEndRef = useRef(null);

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

	/** Empties the conversation before another chat's history is loaded. */
	const reset = () => { setMessages([]); setMsgPage(0); setMsgHasMore(true); };

	/** Empties the conversation when no chat is selected any more. */
	const clear = () => setMessages([]);

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
			onReplied(chatId);
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

	useEffect(() => {
		try { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); } catch { /* auto-scroll is cosmetic; ignore if unsupported */ }
	}, [messages.length, assistantTyping]);

	return {
		messages, copiedMessageId, msgPage, msgHasMore, loadingMessages, composer, setComposer, assistantTyping, messagesEndRef,
		fetchMessagesPage, reset, clear, handleCopyMessage, handleSendMessage, handleRetryMessage,
	};
}
