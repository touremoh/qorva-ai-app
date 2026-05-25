import apiClient, { apiFormDataClient } from '../../axiosConfig.js';

export const updateTenantProfile = (profileData, logoFile) => {
    const formData = new FormData();
    formData.append('profile', new Blob([JSON.stringify(profileData)], { type: 'application/json' }));
    if (logoFile) {
        formData.append('logo', logoFile);
    }
    return apiFormDataClient.patch('/tenants/profile', formData);
};

export const getTenantById = (tenantId) => apiClient.get(`/tenants/${tenantId}`);
