import apiClient from '../../axiosConfig.js';

export const getLibraryQuality = () =>
    apiClient.get('/library-quality');

export const getQualityIssues = (issueKey, pageNumber = 0, pageSize = 20) =>
    apiClient.get('/library-quality/issues', { params: { issueKey, pageNumber, pageSize } });

export const getLibraryQualitySummary = () =>
    apiClient.get('/library-quality/summary');

export const performQualityAction = (action, { issueKey, cvIds } = {}) =>
    apiClient.post('/library-quality/actions', { action, issueKey, cvIds });

export const dismissQualityIssue = (issueKey) =>
    apiClient.post(`/library-quality/issues/${issueKey}/dismiss`);

export const reopenQualityIssue = (issueKey) =>
    apiClient.post(`/library-quality/issues/${issueKey}/reopen`);

export const submitQualityJob = (type, issueKey, dryRun = false, language = undefined) =>
    apiClient.post('/library-quality/jobs', { type, issueKey, dryRun, language });

export const getQualityJobs = () =>
    apiClient.get('/library-quality/jobs');

export const cancelQualityJob = (jobId) =>
    apiClient.post(`/library-quality/jobs/${jobId}/cancel`);

/** Notifies listeners (sidebar badge) that quality data changed; detail carries the fresh count when known. */
export const notifyQualityChanged = (openIssueCount) =>
    window.dispatchEvent(new CustomEvent('qorva:quality-changed', { detail: { openIssueCount } }));
