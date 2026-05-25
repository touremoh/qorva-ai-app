import apiClient from '../../axiosConfig.js';

export const getDashboardData = () =>
    apiClient.get('/dashboard/data');
