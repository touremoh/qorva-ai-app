import apiClient from '../../../shared/api/client.js';

export const getUsageMonitoring = () =>
    apiClient.get('/usage-monitoring/current');
