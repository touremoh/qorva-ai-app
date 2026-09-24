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

// Public — request a password-reset link. Always resolves with { data: true }
// (no account enumeration).
export const forgotPassword = (email) =>
    apiClient.post('/auth/password/forgot', { email });

// Public — second sign-in step when the account has email MFA on. Resolves with the same
// { jwt, user } a plain login returns.
export const verifyMfa = (challengeId, code) =>
    apiClient.post('/auth/mfa/verify', { challengeId, code });

// Public — emails a fresh code for the same challenge (the previous code stops working).
export const resendMfa = (challengeId) =>
    apiClient.post('/auth/mfa/resend', { challengeId });
