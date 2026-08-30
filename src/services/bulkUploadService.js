import apiClient, { apiFormDataClient } from '../../axiosConfig.js';

// Asynchronous bulk CV import: create a draft job, stage files in chunks
// (S3-only, fast), start it, then poll until a terminal status.

export const createBulkUpload = () =>
    apiClient.post('/cvs/bulk-uploads');

export const stageBulkFiles = (jobId, formData) =>
    apiFormDataClient.post(`/cvs/bulk-uploads/${jobId}/files`, formData);

export const startBulkUpload = (jobId) =>
    apiClient.post(`/cvs/bulk-uploads/${jobId}/start`);

export const getBulkUpload = (jobId) =>
    apiClient.get(`/cvs/bulk-uploads/${jobId}`);

export const listBulkUploads = () =>
    apiClient.get('/cvs/bulk-uploads');

export const cancelBulkUpload = (jobId) =>
    apiClient.post(`/cvs/bulk-uploads/${jobId}/cancel`);

export const BULK_TERMINAL_STATUSES = ['COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED', 'CANCELLED'];
