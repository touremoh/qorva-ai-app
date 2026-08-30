import apiClient, { apiFormDataClient } from '../../axiosConfig.js';

export const getCVs = (params) =>
    apiClient.get('/cvs', { params });

export const searchCVs = (params) =>
    apiClient.get('/cvs/search', { params });

export const uploadCVs = (formData) =>
    apiFormDataClient.post('/cvs/upload', formData);

export const deleteCV = (id) =>
    apiClient.delete(`/cvs/${id}`);

export const getCVById = (id) =>
    apiClient.get(`/cvs/${id}`);

export const updateCV = (id, patch) =>
    apiClient.patch(`/cvs/${id}`, patch);

export const getDuplicates = (pageNumber = 0, pageSize = 20) =>
    apiClient.get('/cvs/duplicates', { params: { pageNumber, pageSize } });

export const replaceDuplicateCV = (newCvId, oldCvId) =>
    apiClient.post(`/cvs/${newCvId}/replace/${oldCvId}`);

export const getClearLibraryPreflight = () =>
    apiClient.get('/cvs/clear-library/preflight');

export const clearLibrary = () =>
    apiClient.post('/cvs/clear-library');
