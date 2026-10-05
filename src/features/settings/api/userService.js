import apiClient from '../../../shared/api/client.js';

export const getUsers = () =>
    apiClient.get('/users');

export const createUser = (data) =>
    apiClient.post('/users/invite', data);

export const updateUserAuthorities = (id, authorities) =>
    apiClient.put(`/users/${id}/authorities`, { authorities });

export const deleteUser = (id) =>
    apiClient.delete(`/users/${id}`);

export const updateProfile = (id, data) =>
    apiClient.patch(`/users/${id}`, data);

export const updatePassword = (id, data) =>
    apiClient.patch(`/users/${id}/password`, data);

/** Re-sends a pending invite with a fresh link (the previous link stops working). 202; 409 once the user has joined, 429 inside two minutes. */
export const resendInvite = (id) =>
    apiClient.post(`/users/${id}/invite/resend`);
