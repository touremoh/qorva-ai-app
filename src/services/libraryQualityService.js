import apiClient from '../../axiosConfig.js';

export const getLibraryQuality = () =>
    apiClient.get('/library-quality');

export const getQualityIssues = (issueKey, pageNumber = 0, pageSize = 20) =>
    apiClient.get('/library-quality/issues', { params: { issueKey, pageNumber, pageSize } });
