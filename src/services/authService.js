import apiClient from '../../axiosConfig.js';

export const login = (email, password) =>
    apiClient.post('/auth/login', { email, rawPassword: password });

export const validateToken = (token) =>
    apiClient.post('/auth/token/validate', null, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const refreshToken = () =>
    apiClient.post('/auth/token/refresh');

// Public — set a new password using the JWT from the activation email link.
export const setPassword = (token, newPassword) =>
    apiClient.post('/auth/password/set', { token, newPassword });

// Public — request a fresh activation / set-password link. Always resolves
// with { data: true } (no account enumeration).
export const resendActivation = (email) =>
    apiClient.post('/auth/password/resend', { email });
