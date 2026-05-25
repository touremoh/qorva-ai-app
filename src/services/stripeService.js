import apiClient from '../../axiosConfig.js';

export const getCheckoutSuccess = (sessionId) =>
    apiClient.get('/stripe/checkout/success', sessionId ? { params: { session_id: sessionId } } : undefined);

export const getCheckoutCancel = () =>
    apiClient.get('/stripe/checkout/cancel');

export const createPortalSession = () =>
    apiClient.post('/stripe/portal-session');
