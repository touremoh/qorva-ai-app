import apiClient from '../shared/api/client.js';

// targetType is 'CV' | 'MATCHING_REPORT'; the backend gates each with the target's own authorities.
export const getNotes = (targetType, targetId) =>
    apiClient.get('/notes', { params: { targetType, targetId } });

export const addNote = (targetType, targetId, text) =>
    apiClient.post('/notes', { targetType, targetId, text });

export const editNote = (id, text) =>
    apiClient.put(`/notes/${id}`, { text });

export const removeNote = (id) =>
    apiClient.delete(`/notes/${id}`);
