import apiClient from '../../axiosConfig.js';

export const getChats = (params) =>
    apiClient.get('/chats', { params });

export const getMessages = (chatId, params) =>
    apiClient.get(`/chats/${chatId}/messages`, { params });

export const createChat = (data) =>
    apiClient.post('/chats', data);

export const sendMessage = (chatId, content) =>
    apiClient.post(`/chats/${chatId}/messages`, { content });

export const updateChatStatus = (chatId, status) =>
    apiClient.patch(`/chats/${chatId}/status`, null, { params: { status } });

export const deleteChat = (chatId) =>
    apiClient.delete(`/chats/${chatId}`);

export const getChatAllowedStatus = () =>
    apiClient.get('/chats/allowed');
