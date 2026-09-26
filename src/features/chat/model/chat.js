export const ls = (k, d = null) => { try { const v = localStorage.getItem(k); return v ?? d; } catch { return d; } };

export const buildChatTitle = (cv, job) => {
	const name = cv?.personalInformation?.name || 'Chat';
	const jobTitle = job?.title || job?.jobPostTitle || 'Job';
	return `${name} - ${jobTitle}`;
};

export const getCandidateIdFromCV = (cv) => cv?.candidateId || cv?.id || null;

export const LIST_PANEL_KEY = 'qorva.chat.listPanel';

export const CONTEXT_PANEL_KEY = 'qorva.chat.contextPanel';

export const persist = (k, v) => { try { localStorage.setItem(k, v); } catch { /* per-viewer convenience only */ } };

export const PAGE_SIZE_CHATS = 25;

export const PAGE_SIZE_MESSAGES = 50;
