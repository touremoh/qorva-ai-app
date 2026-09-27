import apiClient from '../../../shared/api/client.js';

export const getUsageMonitoring = () =>
    apiClient.get('/usage-monitoring/current');

/** AI summary of the current period in the caller's language (Accept-Language). 204 without an active period. */
export const getUsageInsight = () =>
    apiClient.get('/usage-monitoring/insight');
