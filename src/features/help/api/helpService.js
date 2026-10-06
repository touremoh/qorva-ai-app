import apiClient from '../../../shared/api/client.js';

/** { enabled }: false hides the help button. */
export const getHelpAvailability = () =>
	apiClient.get('/help/availability');

/**
 * Asks Qorva Help. The answer comes back in the UI language (Accept-Language).
 * @param {{ conversationId?: string, message: string, page?: string }} body
 */
export const sendHelpMessage = (body) =>
	apiClient.post('/help/messages', body);

/**
 * Sends a support request; answers { reference }.
 * @param {{ conversationId?: string, subject: string, description: string, includeConversation: boolean, page?: string }} body
 */
export const createSupportTicket = (body) =>
	apiClient.post('/help/tickets', body);
