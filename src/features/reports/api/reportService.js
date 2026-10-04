import apiClient from '../../../shared/api/client.js';

export const getReports = (params) =>
    apiClient.get('/matching-reports', { params });

export const getReportsByFilter = (params) =>
    apiClient.get('/matching-reports/search', { params });

export const findReportByCriteria = (body) =>
    apiClient.post('/matching-reports/search', body);

export const deleteReport = (id) =>
    apiClient.delete(`/matching-reports/${id}`);

// Matching runs: the plan's Top N choices, the cost of a run before it starts, starting it and following it.
export const getMatchingRunOptions = () =>
    apiClient.get('/ai/matching-runs/options');

export const estimateMatchingRun = (jobIds, topN) =>
    apiClient.post('/ai/matching-runs/estimate', { jobIds, topN });

export const startMatchingRun = (jobIds, topN) =>
    apiClient.post('/ai/matching-runs', { jobIds, topN });

export const getMatchingRun = (runId) =>
    apiClient.get(`/ai/matching-runs/${runId}`);

export const getActiveMatchingRuns = () =>
    apiClient.get('/ai/matching-runs', { params: { active: true } });

export const deleteOutdatedReports = (jobPostId) =>
    apiClient.delete('/matching-reports/outdated', { params: { jobPostId } });

export const exportCsv = (jobPostId, format) =>
    apiClient.get('/matching-reports/export/csv', { params: { jobPostId, format }, responseType: 'blob' });
