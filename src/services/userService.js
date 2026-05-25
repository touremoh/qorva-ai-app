import apiClient from '../../axiosConfig.js';

export const getUsers = () =>
    apiClient.get('/users');

export const createUser = (data) =>
    apiClient.post('/users', data);

export const updateUserAuthorities = (id, authorities) =>
    apiClient.put(`/users/${id}/authorities`, { authorities });

export const deleteUser = (id) =>
    apiClient.delete(`/users/${id}`);

export const updateProfile = (id, data) =>
    apiClient.patch(`/users/${id}`, data);

export const updatePassword = (id, data) =>
    apiClient.patch(`/users/${id}/password`, data);
