import apiClient from '../../axiosConfig.js';

export const getUsageMonitoring = () =>
    apiClient.get('/usage-monitoring/current');
