import apiClient from '../../axiosConfig.js';

export const getUsers = () =>
    apiClient.get('/Users');

export const createUser = (data) =>
    apiClient.post('/Users', data);

export const updateUserAuthorities = (id, authorities) =>
    apiClient.put(`/Users/${id}/authorities`, { authorities });

export const deleteUser = (id) =>
    apiClient.delete(`/Users/${id}`);

export const updateProfile = (id, data) =>
    apiClient.patch(`/Users/${id}`, data);

export const updatePassword = (id, data) =>
    apiClient.patch(`/Users/${id}/password`, data);
