import apiClient from '../../axiosConfig.js';

export const getJobs = (params) =>
    apiClient.get('/jobs', { params });

export const createJob = (data) =>
    apiClient.post('/jobs', data);

export const updateJob = (id, data) =>
    apiClient.put(`/jobs/${id}`, data);

export const patchJobStatus = (id, status) =>
    apiClient.patch(`/jobs/${id}`, { status });

export const deleteJob = (id) =>
    apiClient.delete(`/jobs/${id}`);
