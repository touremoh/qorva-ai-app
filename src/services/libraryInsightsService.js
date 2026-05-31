import apiClient from '../../axiosConfig.js';

export const askInsight = (request) =>
    apiClient.post('/library-insights/ask', request);

export const getConversations = () =>
    apiClient.get('/library-insights/conversations');

export const getConversationHistory = (conversationId) =>
    apiClient.get(`/library-insights/conversations/${conversationId}`);
