import apiClient from '../shared/api/client.js';

// The signed-in user's own email MFA. `action` is 'enable' or 'disable'; both need an emailed code.

// { enabled, email }
export const getMfaStatus = () =>
    apiClient.get('/users/me/mfa');

// { challengeId, maskedEmail, expiresAt, resendAvailableAt } — a code is on its way.
export const startMfaChange = (action) =>
    apiClient.post(`/users/me/mfa/${action}/start`);

// { enabled } once the code is accepted.
export const confirmMfaChange = (action, challengeId, code) =>
    apiClient.post(`/users/me/mfa/${action}/confirm`, { challengeId, code });

export const resendMfaChange = (challengeId) =>
    apiClient.post('/users/me/mfa/resend', { challengeId });
