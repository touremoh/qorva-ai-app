import apiClient from '../../axiosConfig.js';

export const getReports = (params) =>
    apiClient.get('/matching-reports', { params });

export const getReportsByFilter = (params) =>
    apiClient.get('/matching-reports/search', { params });

export const findReportByCriteria = (body) =>
    apiClient.post('/matching-reports/search', body);

export const deleteReport = (id) =>
    apiClient.delete(`/matching-reports/${id}`);

export const startMatching = () =>
    apiClient.post('/ai/start-screening');

export const generateReport = (data) =>
    apiClient.post('/reports/generate', data);

export const exportCsv = (jobPostId, format) =>
    apiClient.get('/matching-reports/export/csv', { params: { jobPostId, format }, responseType: 'blob' });
