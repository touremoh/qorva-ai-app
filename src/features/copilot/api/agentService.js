import apiClient from '../../../shared/api/client.js';

// Copilot (/agent). Raw JSON responses: callers read res.data.

export const getAgentAvailability = () => apiClient.get('/agent/availability');

export const startAgentRun = (payload) => apiClient.post('/agent/runs', payload);

export const getAgentRun = (id) => apiClient.get(`/agent/runs/${id}`);

export const cancelAgentRun = (id) => apiClient.post(`/agent/runs/${id}/cancel`);

/** params: { scope: 'mine' | 'team', status, origin, userEmail, page, size } */
export const listAgentRuns = (params) => apiClient.get('/agent/runs', { params });

export const listAgentConversations = () => apiClient.get('/agent/conversations');

export const getAgentConversation = (conversationId) => apiClient.get(`/agent/conversations/${conversationId}`);

export const deleteAgentConversation = (conversationId) => apiClient.delete(`/agent/conversations/${conversationId}`);
