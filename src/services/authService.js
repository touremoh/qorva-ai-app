import apiClient from '../../axiosConfig.js';

export const login = (email, password) =>
    apiClient.post('/auth/login', { email, rawPassword: password });

export const validateToken = (token) =>
    apiClient.post('/auth/token/validate', null, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const refreshToken = () =>
    apiClient.post('/auth/token/refresh');
