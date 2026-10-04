import apiClient from '../../../shared/api/client.js';

// The pipeline board (VIEW_REPORT): every status column with its count and first page, then more of one column.

const filterParams = ({ jobPostId, q, hideOutdated } = {}) => ({
    ...(jobPostId ? { jobPostId } : {}),
    ...(q?.trim() ? { q: q.trim() } : {}),
    ...(hideOutdated ? { hideOutdated: true } : {}),
});

export const getBoard = (filters) =>
    apiClient.get('/matching-reports/pipeline', { params: filterParams(filters) });

export const getColumn = (status, filters, cursor, size = 20) =>
    apiClient.get(`/matching-reports/pipeline/${status}`, { params: { ...filterParams(filters), cursor, size } });

/** The full report, for the side panel. */
export const getReport = (id) =>
    apiClient.get(`/matching-reports/${id}`);
