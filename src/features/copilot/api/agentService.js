import apiClient from '../../../shared/api/client.js';

// Copilot (/agent). Raw JSON responses: callers read res.data.

export const getAgentAvailability = () => apiClient.get('/agent/availability');

export const startAgentRun = (payload) => apiClient.post('/agent/runs', payload);

export const getAgentRun = (id) => apiClient.get(`/agent/runs/${id}`);

export const cancelAgentRun = (id) => apiClient.post(`/agent/runs/${id}/cancel`);

/** "Save as note": keeps a candidate answer as a Copilot note on the report (or the candidate); returns the run. */
export const saveAgentAnswerAsNote = (id) => apiClient.post(`/agent/runs/${id}/answer-note`);

/** params: { scope: 'mine' | 'team', status, origin, ruleId, userEmail, page, size } */
export const listAgentRuns = (params) => apiClient.get('/agent/runs', { params });

export const listAgentConversations = () => apiClient.get('/agent/conversations');

export const getAgentConversation = (conversationId) => apiClient.get(`/agent/conversations/${conversationId}`);

export const deleteAgentConversation = (conversationId) => apiClient.delete(`/agent/conversations/${conversationId}`);

export const getPendingApprovalCount = () => apiClient.get('/agent/runs/pending-approval/count');

/** decision: { argsHash, subject?, body? } — the argsHash of the card the user saw. */
export const approveAgentAction = (runId, actionId, decision) =>
	apiClient.post(`/agent/runs/${runId}/actions/${actionId}/approve`, decision);

/** decision: { argsHash, reason? } */
export const rejectAgentAction = (runId, actionId, decision) =>
	apiClient.post(`/agent/runs/${runId}/actions/${actionId}/reject`, decision);

// Standing rules (/agent/rules).

/** scope: 'mine' | 'team' */
export const listAgentRules = (scope = 'mine') => apiClient.get('/agent/rules', { params: { scope } });

export const createAgentRule = (rule) => apiClient.post('/agent/rules', rule);

export const updateAgentRule = (id, rule) => apiClient.put(`/agent/rules/${id}`, rule);

export const deleteAgentRule = (id) => apiClient.delete(`/agent/rules/${id}`);

export const pauseAgentRule = (id) => apiClient.post(`/agent/rules/${id}/pause`);

export const resumeAgentRule = (id) => apiClient.post(`/agent/rules/${id}/resume`);
