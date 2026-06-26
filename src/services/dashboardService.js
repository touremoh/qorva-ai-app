import apiClient from '../../axiosConfig.js';

export const getDashboardData = () =>
    apiClient.get('/dashboard/data');

export const getTopCandidatesPerJobPost = (pageNumber = 0, pageSize = 5) =>
    apiClient.get('/dashboard/top-candidates', { params: { pageNumber, pageSize } });
