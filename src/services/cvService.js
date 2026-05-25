import apiClient, { apiFormDataClient } from '../../axiosConfig.js';

export const getCVs = (params) =>
    apiClient.get('/cvs', { params });

export const searchCVs = (params) =>
    apiClient.get('/cvs/search', { params });

export const uploadCVs = (formData) =>
    apiFormDataClient.post('/cvs/upload', formData);

export const deleteCV = (id) =>
    apiClient.delete(`/cvs/${id}`);
