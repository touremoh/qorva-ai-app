import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendHelpMessage } from '../api/helpService.js';

export const MAX_MESSAGE_LENGTH = 1000;
const STORAGE_KEY = 'QORVA_HELP_CONVERSATION';

const readStored = () => {
	try {
		return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
	} catch {
		return null;
	}
};

const store = (value) => {
	try {
		if (value) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
		else sessionStorage.removeItem(STORAGE_KEY);
	} catch {
		// Storage full or blocked: the conversation simply isn't kept across reloads.
	}
};

/** The API's translated message for a help error, or a generic one. */
export const helpErrorMessage = (err, t) => {
	const data = err?.response?.data;
	if (data?.errorCode?.startsWith('error.help.') && data.message) return data.message;
	return t('help.errors.generic');
};

/**
 * One Qorva Help conversation: messages shown in the panel (kept for this browser tab), the server's conversation
 * id, and ask(). The model's context is the server's copy of the conversation, never these messages.
 */
export const useHelpConversation = () => {
	const { t } = useTranslation();
	const [state, setState] = useState(() => readStored() ?? { conversationId: null, messages: [] });
	const [pending, setPending] = useState(false);
	const [error, setError] = useState(null);

	const update = useCallback((updater) => {
		setState((prev) => {
			const next = updater(prev);
			store(next);
			return next;
		});
	}, []);

	const ask = useCallback(async (text, page) => {
		const message = (text ?? '').trim();
		if (!message || message.length > MAX_MESSAGE_LENGTH || pending) return;
		setError(null);
		setPending(true);
		update((prev) => ({ ...prev, messages: [...prev.messages, { role: 'user', text: message }] }));
		try {
			const res = await sendHelpMessage({ conversationId: state.conversationId ?? undefined, message, page: page ?? undefined });
			const data = res.data ?? {};
			update((prev) => ({
				conversationId: data.conversationId ?? prev.conversationId,
				messages: [...prev.messages, {
					role: 'assistant',
					text: data.answer ?? '',
					links: (data.links ?? []).map((l) => l.key),
					followUps: data.followUps ?? [],
					offerSupport: !!data.offerSupport,
				}],
			}));
		} catch (err) {
			setError({ message: helpErrorMessage(err, t), rateLimited: err?.response?.status === 429 });
		} finally {
			setPending(false);
		}
	}, [pending, state.conversationId, t, update]);

	const reset = useCallback(() => {
		setError(null);
		update(() => ({ conversationId: null, messages: [] }));
	}, [update]);

	return { conversationId: state.conversationId, messages: state.messages, pending, error, ask, reset };
};
